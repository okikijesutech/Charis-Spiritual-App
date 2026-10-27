/**
 * Sync Engine Orchestrator
 * Coordinates offline queue processing, Supabase sync, retry backoff,
 * and conflict detection.
 * Per docs/OFFLINE-SYNC.md Section 4, 5, 6 & 7.
 */

import { isSupabaseConfigured } from '../supabase/client';
import { syncQueueManager } from './sync-queue';
import { syncPrayerEntry, syncStudyEntry, syncActivityLog } from './sync-handlers';
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
          continue;
        }

        const success = await this.processOperation(op);
        if (success) {
          await syncQueueManager.dequeue(op.operationId);
        } else {
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
      const alreadyApplied = await syncQueueManager.hasReceipt(op.operationId, op.userId);
      if (alreadyApplied) {
        return true;
      }

      if (op.entityType === 'prayer_entry') {
        return await syncPrayerEntry(op);
      }
      if (op.entityType === 'study_entry') {
        return await syncStudyEntry(op);
      }
      if (op.entityType === 'activity_log') {
        return await syncActivityLog(op);
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await syncQueueManager.recordAttempt(op.operationId, msg);
      return false;
    }
  }
}

export const syncEngine = new SyncEngine();
