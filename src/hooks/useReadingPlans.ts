/**
 * Reading Plans Hook
 * Manages active plans, assignments, progress, safe rescheduling, and sync.
 * Per docs/IMPLEMENTATION-PLAN.md Section 9 and docs/PRD.md
 */

import { useState, useEffect, useCallback } from 'react';
import { planRepository } from '../lib/db/plan-repository';
import { syncQueueManager } from '../lib/sync/sync-queue';
import { syncEngine } from '../lib/sync/sync-engine';
import { generateUUID } from '../lib/id';
import { generatePlanAssignments, reschedulePlan } from '../lib/plans/plan-generator';
import type { 
  ReadingPlan, 
  ReadingPlanAssignment, 
  PlanScopeType 
} from '../types/plan';

export function useReadingPlans(userId: string) {
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<ReadingPlanAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user plans
  const loadPlans = useCallback(async () => {
    try {
      const allPlans = await planRepository.list(userId);
      setPlans(allPlans);

      if (allPlans.length > 0) {
        // Select featured plan or first plan
        const featured = allPlans.find((p) => p.featured);
        const targetId = activePlanId && allPlans.some((p) => p.id === activePlanId)
          ? activePlanId
          : (featured?.id || allPlans[0].id);
        setActivePlanId(targetId);
      } else {
        setActivePlanId(null);
        setAssignments([]);
      }
    } catch (err) {
      console.error('[Charis Plans] Failed to load plans:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, activePlanId]);

  // Load assignments when active plan changes
  useEffect(() => {
    if (!activePlanId) {
      setAssignments([]);
      return;
    }
    let isCurrent = true;
    planRepository.listAssignments(activePlanId, userId).then((items) => {
      if (isCurrent) setAssignments(items);
    });
    return () => {
      isCurrent = false;
    };
  }, [activePlanId, userId]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Create new plan
  const createPlan = async (options: {
    name: string;
    description?: string;
    scopeType: PlanScopeType;
    durationDays: number;
    startDate?: string;
  }) => {
    const planId = generateUUID();
    const now = new Date().toISOString();
    const startDate = options.startDate || now.slice(0, 10);

    const { assignments: generatedAssignments, totalChapters } = generatePlanAssignments({
      planId,
      userId,
      startDate,
      targetDays: options.durationDays,
      scopeType: options.scopeType,
    });

    const isFirstPlan = plans.length === 0;

    const newPlan: ReadingPlan = {
      id: planId,
      userId,
      name: options.name,
      description: options.description || undefined,
      scopeType: options.scopeType,
      status: 'active',
      startDate,
      targetEndDate: generatedAssignments[generatedAssignments.length - 1]?.assignmentDate || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      distributionMode: 'automatic',
      readingDays: [0, 1, 2, 3, 4, 5, 6],
      featured: isFirstPlan,
      totalDays: generatedAssignments.length,
      completedDays: 0,
      createdAt: now,
      updatedAt: now,
      sync: {
        syncStatus: 'pending',
        localVersion: 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    };

    await planRepository.save(newPlan);
    await planRepository.saveAssignmentsBatch(generatedAssignments);

    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId,
      entityType: 'reading_plan',
      entityId: planId,
      action: 'create',
      baseVersion: 0,
      payload: newPlan,
    });

    setActivePlanId(planId);
    await loadPlans();
    syncEngine.processQueue(userId).catch(() => {});
    return totalChapters;
  };

  // Toggle assignment completed state
  const toggleAssignment = async (assignment: ReadingPlanAssignment) => {
    const isNowCompleted = assignment.status !== 'completed';
    const now = new Date().toISOString();

    const updated: ReadingPlanAssignment = {
      ...assignment,
      status: isNowCompleted ? 'completed' : 'pending',
      completedAt: isNowCompleted ? now : null,
      updatedAt: now,
    };

    await planRepository.saveAssignment(updated);

    // Update assignment in state
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? updated : a))
    );

    // Update plan completed count
    const activePlan = plans.find((p) => p.id === assignment.planId);
    if (activePlan) {
      const newCompletedCount = (activePlan.completedDays || 0) + (isNowCompleted ? 1 : -1);
      const updatedPlan: ReadingPlan = {
        ...activePlan,
        completedDays: Math.max(0, newCompletedCount),
        updatedAt: now,
      };
      await planRepository.save(updatedPlan);
      setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? updatedPlan : p)));

      await syncQueueManager.enqueue({
        operationId: generateUUID(),
        userId,
        entityType: 'reading_plan',
        entityId: activePlan.id,
        action: 'update',
        baseVersion: activePlan.sync?.localVersion ?? 1,
        payload: updatedPlan,
      });
    }

    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId,
      entityType: 'reading_plan_assignment',
      entityId: assignment.id,
      action: 'update',
      baseVersion: assignment.sync?.localVersion ?? 1,
      payload: updated,
    });

    syncEngine.processQueue(userId).catch(() => {});
  };

  // Set featured plan
  const setFeatured = async (planId: string) => {
    await planRepository.setFeaturedPlan(planId, userId);
    await loadPlans();
  };

  // Safe rescheduling ("Grace Over Streaks")
  const reschedule = async (additionalDays: number) => {
    if (!activePlanId || assignments.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const updatedAssignments = reschedulePlan(assignments, today, additionalDays);

    await planRepository.saveAssignmentsBatch(updatedAssignments);
    setAssignments(updatedAssignments);

    const activePlan = plans.find((p) => p.id === activePlanId);
    if (activePlan) {
      const updatedPlan: ReadingPlan = {
        ...activePlan,
        totalDays: updatedAssignments.length,
        targetEndDate: updatedAssignments[updatedAssignments.length - 1]?.assignmentDate || null,
        updatedAt: new Date().toISOString(),
      };
      await planRepository.save(updatedPlan);
      setPlans((prev) => prev.map((p) => (p.id === activePlan.id ? updatedPlan : p)));
    }
  };

  // Delete plan
  const deletePlan = async (planId: string) => {
    await planRepository.softDelete(planId, userId);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId,
      entityType: 'reading_plan',
      entityId: planId,
      action: 'delete',
      baseVersion: 1,
    });
    await loadPlans();
    syncEngine.processQueue(userId).catch(() => {});
  };

  return {
    plans,
    activePlan: plans.find((p) => p.id === activePlanId) || null,
    activePlanId,
    setActivePlanId,
    assignments,
    isLoading,
    createPlan,
    toggleAssignment,
    setFeatured,
    reschedule,
    deletePlan,
    loadPlans,
  };
}
