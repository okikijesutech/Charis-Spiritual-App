/**
 * Pre-Login Local Drafts Migration
 * Claims local entries created under 'demo-user-id' and associates them
 * with the newly authenticated user upon sign-in.
 * Per docs/DATA-MODEL.md and docs/OFFLINE-SYNC.md Section 8.
 */

import { getDB } from '../db/indexeddb';
import { syncQueueManager } from './sync-queue';
import { generateUUID } from '../id';
import type { PrayerEntry, StudyEntry } from '../../types/journal';
import type { ReadingPlan, ReadingPlanAssignment } from '../../types/plan';

export async function migrateDemoDataToUser(authenticatedUserId: string): Promise<number> {
  if (!authenticatedUserId || authenticatedUserId === 'demo-user-id') {
    return 0;
  }

  const db = await getDB();
  let migratedCount = 0;

  // 1. Migrate Prayer Entries
  const demoPrayers = await db.getAllFromIndex('prayer_entries', 'by-user', 'demo-user-id');
  for (const prayer of demoPrayers) {
    const updated: PrayerEntry = {
      ...prayer,
      userId: authenticatedUserId,
      sync: {
        syncStatus: 'pending',
        localVersion: (prayer.sync?.localVersion ?? 0) + 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    };
    await db.put('prayer_entries', updated);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: authenticatedUserId,
      entityType: 'prayer_entry',
      entityId: updated.id,
      action: 'create',
      baseVersion: 0,
      payload: updated,
    });
    migratedCount++;
  }

  // 2. Migrate Study Entries
  const demoStudies = await db.getAllFromIndex('study_entries', 'by-user', 'demo-user-id');
  for (const study of demoStudies) {
    const updated: StudyEntry = {
      ...study,
      userId: authenticatedUserId,
      sync: {
        syncStatus: 'pending',
        localVersion: (study.sync?.localVersion ?? 0) + 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    };
    await db.put('study_entries', updated);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: authenticatedUserId,
      entityType: 'study_entry',
      entityId: updated.id,
      action: 'create',
      baseVersion: 0,
      payload: updated,
    });
    migratedCount++;
  }

  // 3. Migrate Reading Plans & Assignments
  const demoPlans = await db.getAllFromIndex('reading_plans', 'by-user', 'demo-user-id');
  for (const plan of demoPlans) {
    const updatedPlan: ReadingPlan = {
      ...plan,
      userId: authenticatedUserId,
      sync: {
        syncStatus: 'pending',
        localVersion: (plan.sync?.localVersion ?? 0) + 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    };
    await db.put('reading_plans', updatedPlan);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: authenticatedUserId,
      entityType: 'reading_plan',
      entityId: updatedPlan.id,
      action: 'create',
      baseVersion: 0,
      payload: updatedPlan,
    });
    migratedCount++;

    // Migrate plan assignments
    const demoAssignments = await db.getAllFromIndex('reading_plan_assignments', 'by-plan', plan.id);
    for (const assignment of demoAssignments) {
      const updatedAssignment: ReadingPlanAssignment = {
        ...assignment,
        userId: authenticatedUserId,
      };
      await db.put('reading_plan_assignments', updatedAssignment);
    }
  }

  // 4. Purge demo queue entries to prevent foreign key errors on Supabase
  await syncQueueManager.clearQueue('demo-user-id');

  return migratedCount;
}
