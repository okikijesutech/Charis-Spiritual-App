/**
 * Reading Plan Progress & Assignment Completion Engine
 * Handles transactional local status updates, plan progress counting,
 * sync queue dispatching, and auto-sync triggers.
 * Per docs/PRD.md and docs/OFFLINE-SYNC.md
 */

import { getDB } from '../db/indexeddb';
import { planRepository } from '../db/plan-repository';
import { syncQueueManager } from '../sync/sync-queue';
import { syncEngine } from '../sync/sync-engine';
import { generateUUID } from '../id';
import type { ReadingPlanAssignment } from '../../types/plan';

export async function completeJourneyAssignment(
  assignmentId: string,
  planId: string,
  userId: string
): Promise<void> {
  const now = new Date().toISOString();
  const db = await getDB();

  const assignment = (await db.get('reading_plan_assignments', assignmentId)) as ReadingPlanAssignment | undefined;
  if (assignment) {
    const updated: ReadingPlanAssignment = {
      ...assignment,
      status: 'completed',
      completedAt: now,
      updatedAt: now,
    };
    await planRepository.saveAssignment(updated);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId,
      entityType: 'reading_plan_assignment',
      entityId: assignment.id,
      action: 'update',
      baseVersion: assignment.sync?.localVersion ?? 1,
      payload: updated,
    });
  }

  const plan = await planRepository.getById(planId, userId);
  if (plan) {
    const updatedPlan = {
      ...plan,
      completedDays: Math.max(0, (plan.completedDays || 0) + 1),
      updatedAt: now,
    };
    await planRepository.save(updatedPlan);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId,
      entityType: 'reading_plan',
      entityId: plan.id,
      action: 'update',
      baseVersion: plan.sync?.localVersion ?? 1,
      payload: updatedPlan,
    });
  }

  syncEngine.triggerAutoSync(userId);
}
