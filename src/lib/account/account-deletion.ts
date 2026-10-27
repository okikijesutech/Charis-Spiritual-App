/**
 * Account Deletion & Data Purge Workflow
 * Permanently deletes all user cloud records (enforcing RLS auth.uid() isolation)
 * and purges local IndexedDB stores and cached sessions.
 * Per docs/PRD.md FR-01, FR-12, docs/SECURITY.md Section 10, and docs/DATA-MODEL.md.
 */

import { supabase } from '../supabase/client';
import { prayerRepository } from '../db/prayer-repository';
import { studyRepository } from '../db/study-repository';
import { activityRepository } from '../db/activity-repository';
import { planRepository } from '../db/plan-repository';
import { scheduleRepository } from '../db/schedule-repository';
import { settingsRepository } from '../db/settings-repository';
import { syncQueueManager } from '../sync/sync-queue';
import { STORAGE_KEY as BIBLE_POS_KEY } from '../bible/persistence';

export interface AccountDeletionResult {
  success: boolean;
  cloudDeleted: boolean;
  localPurged: boolean;
  error?: string;
}

export class AccountDeletionManager {
  /**
   * Execute permanent account deletion workflow.
   * Purges cloud Postgres records and wipes local IndexedDB account partition.
   */
  async purgeAccount(userId: string): Promise<AccountDeletionResult> {
    let cloudDeleted = false;
    let localPurged = false;

    // 1. Purge Cloud Records (if connected to Supabase)
    if (supabase) {
      try {
        await Promise.allSettled([
          supabase.from('prayer_entries').delete().eq('user_id', userId),
          supabase.from('study_entries').delete().eq('user_id', userId),
          supabase.from('activity_logs').delete().eq('user_id', userId),
          supabase.from('activity_types').delete().eq('user_id', userId),
          supabase.from('reading_plan_assignments').delete().eq('user_id', userId),
          supabase.from('reading_plans').delete().eq('user_id', userId),
          supabase.from('schedules').delete().eq('user_id', userId),
          supabase.from('schedule_presets').delete().eq('user_id', userId),
          supabase.from('sync_receipts').delete().eq('user_id', userId),
          supabase.from('user_settings').delete().eq('user_id', userId),
          supabase.from('profiles').delete().eq('id', userId),
        ]);
        cloudDeleted = true;
      } catch (err) {
        console.warn('[AccountDeletion] Cloud purge warning:', err);
      }
    }

    // 2. Purge Local IndexedDB Partition
    try {
      await Promise.all([
        prayerRepository.clearUserData(userId),
        studyRepository.clearUserData(userId),
        activityRepository.clearUserData(userId),
        planRepository.clearUserData(userId),
        scheduleRepository.clearUserData(userId),
        settingsRepository.clearUserData(userId),
        syncQueueManager.clearQueue(userId),
      ]);
      localPurged = true;
    } catch (err) {
      console.error('[AccountDeletion] Local purge error:', err);
    }

    // 3. Clear Local Storage Cache Keys
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(BIBLE_POS_KEY);
      }
    } catch {
      // Ignored
    }

    // 4. Revoke and Sign Out Supabase Session
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[AccountDeletion] Sign out warning:', err);
      }
    }

    return {
      success: localPurged,
      cloudDeleted,
      localPurged,
    };
  }
}

export const accountDeletionManager = new AccountDeletionManager();
