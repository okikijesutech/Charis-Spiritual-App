/**
 * Entity Sync Handlers
 * Performs Supabase upserts, deletes, conflict detection, and receipts.
 * Per docs/SYNC-PROTOCOL.md and docs/OFFLINE-SYNC.md
 */

import { supabase } from '../supabase/client';
import { syncQueueManager } from './sync-queue';
import { prayerRepository } from '../db/prayer-repository';
import { studyRepository } from '../db/study-repository';
import { activityRepository } from '../db/activity-repository';
import type { SyncOperation } from '../../types/sync';

async function recordOpReceipt(op: SyncOperation): Promise<void> {
  await syncQueueManager.recordReceipt({
    operationId: op.operationId,
    userId: op.userId,
    entityType: op.entityType,
    entityId: op.entityId,
    appliedAt: new Date().toISOString(),
  });
}

export async function syncPrayerEntry(op: SyncOperation): Promise<boolean> {
  if (!supabase) return false;

  if (op.action === 'delete') {
    const { error } = await supabase
      .from('prayer_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', op.entityId)
      .eq('user_id', op.userId);

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    await recordOpReceipt(op);
    return true;
  }

  const { data: remoteData, error: fetchErr } = await supabase
    .from('prayer_entries')
    .select('updated_at')
    .eq('id', op.entityId)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);

  if (remoteData?.updated_at) {
    const remoteTime = new Date(remoteData.updated_at).getTime();
    const localBaseTime = new Date(op.queuedAt).getTime();
    if (remoteTime > localBaseTime) {
      await prayerRepository.markConflict(op.entityId, op.userId, 1, remoteData);
      return true;
    }
  }

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

  await recordOpReceipt(op);
  await prayerRepository.markSynced(op.entityId, op.userId, 1);
  return true;
}

export async function syncStudyEntry(op: SyncOperation): Promise<boolean> {
  if (!supabase) return false;

  if (op.action === 'delete') {
    const { error } = await supabase
      .from('study_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', op.entityId)
      .eq('user_id', op.userId);

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    await recordOpReceipt(op);
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

  await recordOpReceipt(op);
  await studyRepository.markSynced(op.entityId, op.userId, 1);
  return true;
}

export async function syncActivityLog(op: SyncOperation): Promise<boolean> {
  if (!supabase) return false;

  if (op.action === 'delete') {
    const { error } = await supabase
      .from('activity_logs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', op.entityId)
      .eq('user_id', op.userId);

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    await recordOpReceipt(op);
    return true;
  }

  const p = (op.payload as Record<string, unknown>) || {};
  const row = {
    id: op.entityId,
    user_id: op.userId,
    category: typeof p.category === 'string' ? p.category : 'prayer',
    label: typeof p.label === 'string' ? p.label : 'Spiritual Rhythm',
    started_at: typeof p.startedAt === 'string' ? p.startedAt : new Date().toISOString(),
    duration_seconds: typeof p.durationSeconds === 'number' ? p.durationSeconds : null,
    note: typeof p.note === 'string' ? p.note : null,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertErr } = await supabase.from('activity_logs').upsert(row);
  if (upsertErr) throw new Error(upsertErr.message);

  await recordOpReceipt(op);
  await activityRepository.markSynced(op.entityId, op.userId, 1);
  return true;
}
