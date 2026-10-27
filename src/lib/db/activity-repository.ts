/**
 * IndexedDB Activity Repository Implementation
 * Strictly partitions records by authenticated user ID.
 * Supports soft-delete tombstones, version increments, and sync metadata.
 * Per docs/DATA-MODEL.md and docs/PRD.md
 */

import { getDB } from './indexeddb';
import type { IRepository, RepositoryFilter } from './repository';
import type { ActivityLog } from '../../types/activity';

export class IndexedDBActivityRepository implements IRepository<ActivityLog> {
  async getById(id: string, userId: string): Promise<ActivityLog | null> {
    const db = await getDB();
    const entry = await db.get('activity_logs', id);
    if (!entry || entry.userId !== userId) {
      return null;
    }
    return entry;
  }

  async list(userId: string, filter?: RepositoryFilter<ActivityLog>): Promise<ActivityLog[]> {
    const db = await getDB();
    const allUserEntries = await db.getAllFromIndex('activity_logs', 'by-user', userId);

    const filtered = allUserEntries.filter((item) => {
      if (!filter?.includeDeleted && item.deletedAt) {
        return false;
      }
      if (filter?.syncStatus && item.sync.syncStatus !== filter.syncStatus) {
        return false;
      }
      return true;
    });

    const orderDirection = filter?.orderDirection ?? 'desc';
    filtered.sort((a, b) => {
      const aVal = a.startedAt || a.updatedAt;
      const bVal = b.startedAt || b.updatedAt;
      if (orderDirection === 'asc') {
        return aVal.localeCompare(bVal);
      }
      return bVal.localeCompare(aVal);
    });

    if (filter?.offset || filter?.limit) {
      const offset = filter.offset ?? 0;
      const limit = filter.limit ? offset + filter.limit : undefined;
      return filtered.slice(offset, limit);
    }

    return filtered;
  }

  async save(item: ActivityLog): Promise<ActivityLog> {
    if (!item.userId) {
      throw new Error('Cannot persist activity log without an owner userId');
    }

    const now = new Date().toISOString();
    const existing = await this.getById(item.id, item.userId);

    const localVersion = (existing?.sync?.localVersion ?? 0) + 1;
    const syncStatus = item.sync?.syncStatus === 'synced' ? 'pending' : (item.sync?.syncStatus ?? 'local_only');

    const updated: ActivityLog = {
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
    await db.put('activity_logs', updated);
    return updated;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const entry = await this.getById(id, userId);
    if (!entry || entry.deletedAt) return;

    const now = new Date().toISOString();
    const tombstone: ActivityLog = {
      ...entry,
      deletedAt: now,
      updatedAt: now,
      sync: {
        ...entry.sync,
        localVersion: (entry.sync.localVersion ?? 0) + 1,
        syncStatus: 'pending',
      },
    };

    const db = await getDB();
    await db.put('activity_logs', tombstone);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const entry = await this.getById(id, userId);
    if (!entry) return;
    const db = await getDB();
    await db.delete('activity_logs', id);
  }

  async listPendingSync(userId: string): Promise<ActivityLog[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('activity_logs', 'by-user', userId);
    return all.filter(
      (entry) =>
        entry.sync.syncStatus === 'pending' ||
        entry.sync.syncStatus === 'local_only' ||
        entry.sync.syncStatus === 'conflict'
    );
  }

  async markSynced(id: string, userId: string, serverVersion: number): Promise<void> {
    const entry = await this.getById(id, userId);
    if (!entry) return;

    entry.sync = {
      ...entry.sync,
      syncStatus: 'synced',
      serverVersion,
      lastSyncedAt: new Date().toISOString(),
      syncError: null,
    };

    const db = await getDB();
    await db.put('activity_logs', entry);
  }

  async markConflict(
    id: string,
    userId: string,
    serverVersion: number,
    remoteSnapshot: Record<string, unknown>
  ): Promise<void> {
    const entry = await this.getById(id, userId);
    if (!entry) return;

    entry.sync = {
      ...entry.sync,
      syncStatus: 'conflict',
      serverVersion,
      conflictCopy: remoteSnapshot,
      syncError: 'Remote version conflicting with local draft',
    };

    const db = await getDB();
    await db.put('activity_logs', entry);
  }

  async countUnsynced(userId: string): Promise<number> {
    const pending = await this.listPendingSync(userId);
    return pending.length;
  }

  async clearUserData(userId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('activity_logs', 'readwrite');
    const index = tx.store.index('by-user');
    let cursor = await index.openCursor(userId);

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}

export const activityRepository = new IndexedDBActivityRepository();
