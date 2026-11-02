/**
 * Inbound Remote Sync Pull Handler
 * Pulls prayers, reflections, journeys, and spiritual rhythms from Supabase
 * down to this device's IndexedDB.
 * Per docs/OFFLINE-SYNC.md Section 4 & docs/DATA-MODEL.md.
 */

import { supabase, isSupabaseConfigured } from '../supabase/client';
import { getDB } from '../db/indexeddb';
import type { PrayerEntry, StudyEntry } from '../../types/journal';
import type { ReadingPlan, ReadingPlanAssignment } from '../../types/plan';
import type { ActivityLog } from '../../types/activity';

export async function pullRemoteChanges(userId: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured() || !userId || userId === 'demo-user-id') {
    return;
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  const db = await getDB();

  try {
    // 1. Pull Prayer Entries
    const { data: prayers, error: prayerErr } = await supabase
      .from('prayer_entries')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (!prayerErr && prayers) {
      for (const p of prayers) {
        const local = await db.get('prayer_entries', p.id);
        // Only overwrite if local copy is not pending unsynced changes
        if (!local || local.sync.syncStatus !== 'pending') {
          const entry: PrayerEntry = {
            id: p.id,
            userId: p.user_id,
            title: p.title || undefined,
            body: p.body,
            entryAt: p.entry_at,
            tags: p.tags || [],
            scriptureReferences: (p.scripture_references as any) || [],
            isAnswered: Boolean(p.is_answered),
            answeredAt: p.answered_at,
            answeredNote: p.answered_note || undefined,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            sync: {
              syncStatus: 'synced',
              localVersion: 1,
              serverVersion: 1,
              lastSyncedAt: p.updated_at,
              syncError: null,
            },
          };
          await db.put('prayer_entries', entry);
        }
      }
    }

    // 2. Pull Study Entries
    const { data: studies, error: studyErr } = await supabase
      .from('study_entries')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (!studyErr && studies) {
      for (const s of studies) {
        const local = await db.get('study_entries', s.id);
        if (!local || local.sync.syncStatus !== 'pending') {
          const entry: StudyEntry = {
            id: s.id,
            userId: s.user_id,
            title: s.title || undefined,
            body: s.body || undefined,
            passageRef: (s.passage_ref as any) || undefined,
            observations: s.observations || undefined,
            questionsContext: s.questions_context || undefined,
            interpretation: s.interpretation || undefined,
            application: s.application || undefined,
            notes: s.notes || undefined,
            crossReferences: (s.cross_references as any) || [],
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            sync: {
              syncStatus: 'synced',
              localVersion: 1,
              serverVersion: 1,
              lastSyncedAt: s.updated_at,
              syncError: null,
            },
          };
          await db.put('study_entries', entry);
        }
      }
    }

    // 3. Pull Reading Plans
    const { data: plans, error: planErr } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (!planErr && plans) {
      for (const pl of plans) {
        const local = await db.get('reading_plans', pl.id);
        if (!local || local.sync.syncStatus !== 'pending') {
          const plan: ReadingPlan = {
            id: pl.id,
            userId: pl.user_id,
            name: pl.name,
            description: pl.description || undefined,
            scopeType: pl.scope_type as any,
            status: pl.status as any,
            startDate: pl.start_date,
            targetEndDate: pl.target_end_date,
            timezone: pl.timezone,
            distributionMode: pl.distribution_mode as any,
            readingDays: (pl.reading_days as any) || [0, 1, 2, 3, 4, 5, 6],
            featured: Boolean(pl.featured),
            totalDays: pl.total_days || undefined,
            completedDays: pl.completed_days,
            createdAt: pl.created_at,
            updatedAt: pl.updated_at,
            sync: {
              syncStatus: 'synced',
              localVersion: 1,
              serverVersion: 1,
              lastSyncedAt: pl.updated_at,
              syncError: null,
            },
          };
          await db.put('reading_plans', plan);
        }
      }
    }

    // 4. Pull Reading Plan Assignments
    const { data: assignments, error: assignErr } = await supabase
      .from('reading_plan_assignments')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (!assignErr && assignments) {
      for (const a of assignments) {
        const local = await db.get('reading_plan_assignments', a.id);
        if (!local || local.sync?.syncStatus !== 'pending') {
          const assign: ReadingPlanAssignment = {
            id: a.id,
            userId: a.user_id,
            planId: a.plan_id,
            assignmentDate: a.assignment_date,
            sequence: a.sequence,
            dayNumber: a.day_number,
            passages: (a.passages as any) || [],
            status: a.status as any,
            progress: (a.progress as any) || undefined,
            completedAt: a.completed_at,
            createdAt: a.created_at,
            updatedAt: a.updated_at,
            sync: {
              syncStatus: 'synced',
              localVersion: 1,
              serverVersion: 1,
              lastSyncedAt: a.updated_at,
              syncError: null,
            },
          };
          await db.put('reading_plan_assignments', assign);
        }
      }
    }

    // 5. Pull Activity Logs
    const { data: logs, error: logErr } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (!logErr && logs) {
      for (const l of logs) {
        const local = await db.get('activity_logs', l.id);
        if (!local || local.sync.syncStatus !== 'pending') {
          const log: ActivityLog = {
            id: l.id,
            userId: l.user_id,
            category: l.category as any,
            label: l.label,
            startedAt: l.started_at,
            durationSeconds: l.duration_seconds || undefined,
            note: l.note || undefined,
            createdAt: l.created_at,
            updatedAt: l.updated_at,
            sync: {
              syncStatus: 'synced',
              localVersion: 1,
              serverVersion: 1,
              lastSyncedAt: l.updated_at,
              syncError: null,
            },
          };
          await db.put('activity_logs', log);
        }
      }
    }
  } catch (err) {
    console.warn('[Charis Sync] Inbound pull caught error:', err);
  }
}
