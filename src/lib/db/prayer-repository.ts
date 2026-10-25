/**
 * IndexedDB Prayer Repository Implementation
 * Strictly partitions records by authenticated user ID.
 * Supports soft-delete tombstones, version increments, and sync metadata.
 * Per docs/OFFLINE-SYNC.md and docs/DATA-MODEL.md
 */

import { getDB } from './indexeddb';
import type { IRepository, RepositoryFilter } from './repository';
import type { PrayerEntry } from '../../types/journal';

export class IndexedDBPrayerRepository implements IRepository<PrayerEntry> {
  async getById(id: string, userId: string): Promise<PrayerEntry | null> {
    const db = await getDB();
    const entry = await db.get('prayer_entries', id);
    if (!entry || entry.userId !== userId) {
      return null;
    }
    return entry;
  }

  async list(userId: string, filter?: RepositoryFilter<PrayerEntry>): Promise<PrayerEntry[]> {
    const db = await getDB();
    const allUserEntries = await db.getAllFromIndex('prayer_entries', 'by-user', userId);

    let filtered = allUserEntries.filter((item) => {
      // Exclude soft-deleted tombstones unless explicitly requested
      if (!filter?.includeDeleted && item.deletedAt) {
        return false;
      }
      // Filter by sync status if requested
      if (filter?.syncStatus && item.sync.syncStatus !== filter.syncStatus) {
        return false;
      }
      return true;
    });

    // Sort order (default to updatedAt descending)
    const orderDirection = filter?.orderDirection ?? 'desc';
    filtered.sort((a, b) => {
      const aVal = a.updatedAt;
      const bVal = b.updatedAt;
      if (orderDirection === 'asc') {
        return aVal.localeCompare(bVal);
      }
      return bVal.localeCompare(aVal);
    });

    // Pagination
    if (filter?.offset || filter?.limit) {
      const offset = filter.offset ?? 0;
      const limit = filter.limit ? offset + filter.limit : undefined;
      filtered = filtered.slice(offset, limit);
    }

    return filtered;
  }

  async save(item: PrayerEntry): Promise<PrayerEntry> {
    if (!item.userId) {
      throw new Error('Cannot persist prayer entry without an owner userId');
    }

    const now = new Date().toISOString();
    const existing = await this.getById(item.id, item.userId);

    const localVersion = (existing?.sync?.localVersion ?? 0) + 1;
    // If it was already synced, modifying it turns it back to 'pending'
    const syncStatus = item.sync?.syncStatus === 'synced' ? 'pending' : (item.sync?.syncStatus ?? 'local_only');

    const updated: PrayerEntry = {
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
    await db.put('prayer_entries', updated);
    return updated;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const entry = await this.getById(id, userId);
    if (!entry || entry.deletedAt) {
      return;
    }

    const now = new Date().toISOString();
    const tombstone: PrayerEntry = {
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
    await db.put('prayer_entries', tombstone);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const entry = await this.getById(id, userId);
    if (!entry) {
      return;
    }
    const db = await getDB();
    await db.delete('prayer_entries', id);
  }

  async listPendingSync(userId: string): Promise<PrayerEntry[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('prayer_entries', 'by-user', userId);
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
    await db.put('prayer_entries', entry);
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
    await db.put('prayer_entries', entry);
  }

  async countUnsynced(userId: string): Promise<number> {
    const pending = await this.listPendingSync(userId);
    return pending.length;
  }

  async clearUserData(userId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('prayer_entries', 'readwrite');
    const index = tx.store.index('by-user');
    let cursor = await index.openCursor(userId);

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}

export const prayerRepository = new IndexedDBPrayerRepository();
