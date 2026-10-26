/**
 * Sync Engine Orchestrator
 * Coordinates offline queue processing, Supabase sync, retry backoff,
 * and conflict detection.
 * Per docs/OFFLINE-SYNC.md Section 4, 5, 6 & 7.
 */

import { supabase, isSupabaseConfigured } from '../supabase/client';
import { syncQueueManager } from './sync-queue';
import { prayerRepository } from '../db/prayer-repository';
import { studyRepository } from '../db/study-repository';
import type { SyncOperation } from '../../types/sync';

export interface SyncEngineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  statusText: 'Saved on this device' | 'Syncing' | 'Synced' | 'Needs attention';
}

type StatusListener = (status: SyncEngineStatus) => void;

export class SyncEngine {
  private isSyncing = false;
  private listeners: Set<StatusListener> = new Set();
  private maxRetries = 5;
  private lastSyncedAt: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus(0));
    return () => this.listeners.delete(listener);
  }

  private notify(pendingCount = 0): void {
    const status = this.getStatus(pendingCount);
    for (const listener of this.listeners) {
      listener(status);
    }
  }

  public getStatus(pendingCount = 0): SyncEngineStatus {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    let statusText: SyncEngineStatus['statusText'] = 'Saved on this device';

    if (this.isSyncing) {
      statusText = 'Syncing';
    } else if (pendingCount > 0) {
      statusText = isOnline ? 'Syncing' : 'Saved on this device';
    } else if (this.lastSyncedAt) {
      statusText = 'Synced';
    }

    return {
      isOnline,
      isSyncing: this.isSyncing,
      pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      statusText,
    };
  }

  private handleNetworkChange(): void {
    this.notify();
  }

  /**
   * Process all pending operations for the authenticated user.
   */
  async processQueue(userId: string): Promise<void> {
    if (this.isSyncing) return;
    if (!isSupabaseConfigured) {
      // In demo mode or unconfigured cloud, queue remains local
      const pending = await syncQueueManager.listQueue(userId);
      this.notify(pending.length);
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const pending = await syncQueueManager.listQueue(userId);
      this.notify(pending.length);
      return;
    }

    this.isSyncing = true;
    this.notify();

    try {
      const queue = await syncQueueManager.listQueue(userId);

      for (const op of queue) {
        if (op.retryCount >= this.maxRetries) {
          continue; // Needs manual attention or retry reset
        }

        const success = await this.processOperation(op);
        if (success) {
          await syncQueueManager.dequeue(op.operationId);
        } else {
          // Pause queue processing on transient network error
          break;
        }
      }

      this.lastSyncedAt = new Date().toISOString();
    } finally {
      this.isSyncing = false;
      const remaining = await syncQueueManager.listQueue(userId);
      this.notify(remaining.length);
    }
  }

  /**
   * Process a single queued operation against Supabase.
   */
  private async processOperation(op: SyncOperation): Promise<boolean> {
    try {
      // 1. Idempotency check: verify receipt
      const alreadyApplied = await syncQueueManager.hasReceipt(op.operationId, op.userId);
      if (alreadyApplied) {
        return true;
      }

      if (op.entityType === 'prayer_entry') {
        return await this.syncPrayerEntry(op);
      }
      if (op.entityType === 'study_entry') {
        return await this.syncStudyEntry(op);
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await syncQueueManager.recordAttempt(op.operationId, msg);
      return false;
    }
  }

  private async syncPrayerEntry(op: SyncOperation): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    if (op.action === 'delete') {
      const { error } = await supabase
        .from('prayer_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', op.entityId)
        .eq('user_id', op.userId);

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }

      await syncQueueManager.recordReceipt({
        operationId: op.operationId,
        userId: op.userId,
        entityType: op.entityType,
        entityId: op.entityId,
        appliedAt: new Date().toISOString(),
      });

      return true;
    }

    // Upsert operation: Check for remote concurrent modifications
    const { data: remoteData, error: fetchErr } = await supabase
      .from('prayer_entries')
      .select('updated_at')
      .eq('id', op.entityId)
      .maybeSingle();

    if (fetchErr) {
      throw new Error(fetchErr.message);
    }

    // Conflict detection: If remote row was updated after local baseVersion
    if (remoteData && remoteData.updated_at) {
      const remoteTime = new Date(remoteData.updated_at).getTime();
      const localBaseTime = new Date(op.queuedAt).getTime();

      if (remoteTime > localBaseTime) {
        // Flag conflict without overwriting remote or local data
        await prayerRepository.markConflict(op.entityId, op.userId, 1, remoteData);
        return true; // Dequeue because conflict is now stored in entity state
      }
    }

    // Apply upsert
    const payload = op.payload as Record<string, unknown> | undefined;
    if (!payload || typeof payload.body !== 'string') return true;

    const row = {
      id: op.entityId,
      user_id: op.userId,
      title: typeof payload.title === 'string' ? payload.title : null,
      body: payload.body,
      entry_at: typeof payload.entryAt === 'string' ? payload.entryAt : new Date().toISOString(),
      tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : [],
      scripture_references: Array.isArray(payload.scriptureReferences) ? (payload.scriptureReferences as any) : [],
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase.from('prayer_entries').upsert(row);

    if (upsertErr) throw new Error(upsertErr.message);

    await this.recordOpReceipt(op);
    await prayerRepository.markSynced(op.entityId, op.userId, 1);
    return true;
  }

  private async syncStudyEntry(op: SyncOperation): Promise<boolean> {
    if (!supabase) return false;

    if (op.action === 'delete') {
      const { error } = await supabase
        .from('study_entries')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', op.entityId)
        .eq('user_id', op.userId);

      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      await this.recordOpReceipt(op);
      return true;
    }

    const { data: remoteData, error: fetchErr } = await supabase
      .from('study_entries')
      .select('updated_at')
      .eq('id', op.entityId)
      .maybeSingle();

    if (fetchErr) throw new Error(fetchErr.message);

    if (remoteData?.updated_at) {
      const remoteTime = new Date(remoteData.updated_at).getTime();
      const localBaseTime = new Date(op.queuedAt).getTime();
      if (remoteTime > localBaseTime) {
        await studyRepository.markConflict(op.entityId, op.userId, 1, remoteData);
        return true;
      }
    }

    const p = (op.payload as Record<string, unknown>) || {};
    const row = {
      id: op.entityId,
      user_id: op.userId,
      title: typeof p.title === 'string' ? p.title : null,
      body: typeof p.body === 'string' ? p.body : null,
      passage_ref: p.passageRef ? (p.passageRef as any) : null,
      observations: typeof p.observations === 'string' ? p.observations : null,
      questions_context: typeof p.questionsContext === 'string' ? p.questionsContext : null,
      interpretation: typeof p.interpretation === 'string' ? p.interpretation : null,
      application: typeof p.application === 'string' ? p.application : null,
      notes: typeof p.notes === 'string' ? p.notes : null,
      cross_references: Array.isArray(p.crossReferences) ? (p.crossReferences as any) : [],
      updated_at: new Date().toISOString(),
    };

    const { error: upsertErr } = await supabase.from('study_entries').upsert(row);
    if (upsertErr) throw new Error(upsertErr.message);

    await this.recordOpReceipt(op);
    await studyRepository.markSynced(op.entityId, op.userId, 1);
    return true;
  }

  private async recordOpReceipt(op: SyncOperation): Promise<void> {
    await syncQueueManager.recordReceipt({
      operationId: op.operationId,
      userId: op.userId,
      entityType: op.entityType,
      entityId: op.entityId,
      appliedAt: new Date().toISOString(),
    });
  }
}

export const syncEngine = new SyncEngine();
