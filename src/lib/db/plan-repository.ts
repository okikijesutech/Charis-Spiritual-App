/**
 * IndexedDB Plan Repository Implementation
 * Manages ReadingPlans and ReadingPlanAssignments.
 * Supports multiple active plans, featured plan selection, and assignment completion.
 * Per docs/DATA-MODEL.md and docs/PRD.md
 */

import { getDB } from './indexeddb';
import type { IRepository, RepositoryFilter } from './repository';
import type { ReadingPlan, ReadingPlanAssignment } from '../../types/plan';

export class IndexedDBPlanRepository implements IRepository<ReadingPlan> {
  async getById(id: string, userId: string): Promise<ReadingPlan | null> {
    const db = await getDB();
    const plan = await db.get('reading_plans', id);
    if (!plan || plan.userId !== userId) {
      return null;
    }
    return plan;
  }

  async list(userId: string, filter?: RepositoryFilter<ReadingPlan>): Promise<ReadingPlan[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('reading_plans', 'by-user', userId);

    const filtered = all.filter((item) => {
      if (!filter?.includeDeleted && item.deletedAt) return false;
      if (filter?.syncStatus && item.sync.syncStatus !== filter.syncStatus) return false;
      return true;
    });

    const orderDirection = filter?.orderDirection ?? 'desc';
    filtered.sort((a, b) => {
      const aVal = a.updatedAt;
      const bVal = b.updatedAt;
      if (orderDirection === 'asc') return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    });

    return filtered;
  }

  async save(item: ReadingPlan): Promise<ReadingPlan> {
    if (!item.userId) throw new Error('Cannot persist plan without userId');

    const now = new Date().toISOString();
    const existing = await this.getById(item.id, item.userId);
    const localVersion = (existing?.sync?.localVersion ?? 0) + 1;
    const syncStatus = item.sync?.syncStatus === 'synced' ? 'pending' : (item.sync?.syncStatus ?? 'local_only');

    const updated: ReadingPlan = {
      ...item,
      updatedAt: now,
      createdAt: item.createdAt || now,
      sync: {
        ...item.sync,
        localVersion,
        syncStatus,
        syncError: null,
      },
    };

    const db = await getDB();
    await db.put('reading_plans', updated);
    return updated;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const plan = await this.getById(id, userId);
    if (!plan || plan.deletedAt) return;

    const now = new Date().toISOString();
    const tombstone: ReadingPlan = {
      ...plan,
      deletedAt: now,
      updatedAt: now,
      sync: {
        ...plan.sync,
        localVersion: (plan.sync.localVersion ?? 0) + 1,
        syncStatus: 'pending',
      },
    };

    const db = await getDB();
    await db.put('reading_plans', tombstone);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const plan = await this.getById(id, userId);
    if (!plan) return;
    const db = await getDB();
    await db.delete('reading_plans', id);
  }

  async listPendingSync(userId: string): Promise<ReadingPlan[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('reading_plans', 'by-user', userId);
    return all.filter((p) => p.sync.syncStatus === 'pending' || p.sync.syncStatus === 'local_only');
  }

  async markSynced(id: string, userId: string, serverVersion: number): Promise<void> {
    const plan = await this.getById(id, userId);
    if (!plan) return;

    plan.sync = {
      ...plan.sync,
      syncStatus: 'synced',
      serverVersion,
      lastSyncedAt: new Date().toISOString(),
      syncError: null,
    };

    const db = await getDB();
    await db.put('reading_plans', plan);
  }

  async markConflict(
    id: string,
    userId: string,
    serverVersion: number,
    remoteSnapshot: Record<string, unknown>
  ): Promise<void> {
    const plan = await this.getById(id, userId);
    if (!plan) return;

    plan.sync = {
      ...plan.sync,
      syncStatus: 'conflict',
      serverVersion,
      conflictCopy: remoteSnapshot,
      syncError: 'Remote version conflict',
    };

    const db = await getDB();
    await db.put('reading_plans', plan);
  }

  async countUnsynced(userId: string): Promise<number> {
    const pending = await this.listPendingSync(userId);
    return pending.length;
  }

  // --- Assignments Operations ---

  async listAssignments(planId: string, userId: string): Promise<ReadingPlanAssignment[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('reading_plan_assignments', 'by-plan', planId);
    return all
      .filter((a) => a.userId === userId && !a.deletedAt)
      .sort((a, b) => a.sequence - b.sequence);
  }

  async saveAssignment(assignment: ReadingPlanAssignment): Promise<ReadingPlanAssignment> {
    const now = new Date().toISOString();
    const updated: ReadingPlanAssignment = {
      ...assignment,
      updatedAt: now,
      sync: {
        ...assignment.sync,
        localVersion: (assignment.sync.localVersion ?? 0) + 1,
        syncStatus: 'pending',
      },
    };

    const db = await getDB();
    await db.put('reading_plan_assignments', updated);
    return updated;
  }

  async saveAssignmentsBatch(assignments: ReadingPlanAssignment[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('reading_plan_assignments', 'readwrite');
    for (const a of assignments) {
      await tx.store.put(a);
    }
    await tx.done;
  }

  async setFeaturedPlan(planId: string, userId: string): Promise<void> {
    const db = await getDB();
    const plans = await this.list(userId);

    const tx = db.transaction('reading_plans', 'readwrite');
    for (const p of plans) {
      const isTarget = p.id === planId;
      if (p.featured !== isTarget) {
        await tx.store.put({
          ...p,
          featured: isTarget,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    await tx.done;
  }

  async clearUserData(userId: string): Promise<void> {
    const db = await getDB();
    // 1. Clear plans
    const txPlans = db.transaction('reading_plans', 'readwrite');
    let cursorP = await txPlans.store.index('by-user').openCursor(userId);
    while (cursorP) {
      await cursorP.delete();
      cursorP = await cursorP.continue();
    }
    await txPlans.done;

    // 2. Clear assignments
    const txAssign = db.transaction('reading_plan_assignments', 'readwrite');
    let cursorA = await txAssign.store.openCursor();
    while (cursorA) {
      if (cursorA.value.userId === userId) {
        await cursorA.delete();
      }
      cursorA = await cursorA.continue();
    }
    await txAssign.done;
  }
}

export const planRepository = new IndexedDBPlanRepository();
