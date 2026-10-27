/**
 * IndexedDB Schedule Repository Implementation
 * Manages prayer and health-neutral contemplative fasting schedules.
 * Per docs/DATA-MODEL.md and docs/PRD.md
 */

import { getDB } from './indexeddb';
import type { IRepository, RepositoryFilter } from './repository';
import type { Schedule, SchedulePreset, ScheduleKind } from '../../types/schedule';

export const STARTER_PRESETS: Omit<SchedulePreset, 'userId'>[] = [
  {
    id: 'preset-fast-sunrise',
    kind: 'fasting',
    name: 'Sunrise to Sunset Fast',
    description: 'Quiet abstinence from morning dawn to evening dusk (approx 12 hours) accompanied by stillness and Scripture.',
    targetHours: 12,
    configuration: { hours: 12, focus: 'prayer_and_scripture' },
    createdAt: '2026-10-27T00:00:00Z',
    updatedAt: '2026-10-27T00:00:00Z',
  },
  {
    id: 'preset-fast-24h',
    kind: 'fasting',
    name: '24-Hour Day of Quiet',
    description: 'A full day dedicated to unhurried prayer, spiritual re-centering, and listening in God’s presence.',
    targetHours: 24,
    configuration: { hours: 24, focus: 'contemplation' },
    createdAt: '2026-10-27T00:00:00Z',
    updatedAt: '2026-10-27T00:00:00Z',
  },
  {
    id: 'preset-fast-partial',
    kind: 'fasting',
    name: 'Partial Contemplative Fast',
    description: 'Modest, simple nourishment (approx 16 hours) focusing on prayerful clarity rather than physical austerity.',
    targetHours: 16,
    configuration: { hours: 16, focus: 'clarity' },
    createdAt: '2026-10-27T00:00:00Z',
    updatedAt: '2026-10-27T00:00:00Z',
  },
  {
    id: 'preset-prayer-morning',
    kind: 'prayer',
    name: 'Morning Stillness (Lauds)',
    description: 'Quiet contemplation, Psalm reading, and gratitude at the beginning of the day.',
    configuration: { localTime: '07:00' },
    createdAt: '2026-10-27T00:00:00Z',
    updatedAt: '2026-10-27T00:00:00Z',
  },
  {
    id: 'preset-prayer-midday',
    kind: 'prayer',
    name: 'Midday Pause (Sext)',
    description: 'A gentle 10-minute pause amidst the day to re-center in Christ.',
    configuration: { localTime: '12:30' },
    createdAt: '2026-10-27T00:00:00Z',
    updatedAt: '2026-10-27T00:00:00Z',
  },
  {
    id: 'preset-prayer-evening',
    kind: 'prayer',
    name: 'Evening Compline',
    description: 'End-of-day surrender, thanksgiving, and quiet restful reflection.',
    configuration: { localTime: '21:00' },
    createdAt: '2026-10-27T00:00:00Z',
    updatedAt: '2026-10-27T00:00:00Z',
  },
];

export class IndexedDBScheduleRepository implements IRepository<Schedule> {
  async getById(id: string, userId: string): Promise<Schedule | null> {
    const db = await getDB();
    const entry = await db.get('schedules', id);
    if (!entry || entry.userId !== userId) return null;
    return entry;
  }

  async list(userId: string, filter?: RepositoryFilter<Schedule>): Promise<Schedule[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('schedules', 'by-user', userId);

    const filtered = all.filter((item) => {
      if (!filter?.includeDeleted && item.deletedAt) return false;
      if (filter?.syncStatus && item.sync.syncStatus !== filter.syncStatus) return false;
      return true;
    });

    const orderDirection = filter?.orderDirection ?? 'desc';
    filtered.sort((a, b) => {
      const aVal = a.startAt || a.updatedAt;
      const bVal = b.startAt || b.updatedAt;
      if (orderDirection === 'asc') return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    });

    return filtered;
  }

  async getActiveFasting(userId: string): Promise<Schedule | null> {
    const all = await this.list(userId);
    return all.find((s) => s.kind === 'fasting' && s.status === 'active') || null;
  }

  async save(item: Schedule): Promise<Schedule> {
    if (!item.userId) throw new Error('Cannot persist schedule without userId');

    const now = new Date().toISOString();
    const existing = await this.getById(item.id, item.userId);
    const localVersion = (existing?.sync?.localVersion ?? 0) + 1;
    const syncStatus = item.sync?.syncStatus === 'synced' ? 'pending' : (item.sync?.syncStatus ?? 'local_only');

    const updated: Schedule = {
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
    await db.put('schedules', updated);
    return updated;
  }

  async endSchedule(id: string, userId: string, status: 'completed' | 'cancelled'): Promise<void> {
    const item = await this.getById(id, userId);
    if (!item) return;

    const now = new Date().toISOString();
    const updated: Schedule = {
      ...item,
      status,
      endAt: now,
      updatedAt: now,
      sync: {
        ...item.sync,
        localVersion: (item.sync.localVersion ?? 0) + 1,
        syncStatus: 'pending',
      },
    };

    const db = await getDB();
    await db.put('schedules', updated);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const item = await this.getById(id, userId);
    if (!item || item.deletedAt) return;

    const now = new Date().toISOString();
    const tombstone: Schedule = {
      ...item,
      deletedAt: now,
      updatedAt: now,
      sync: {
        ...item.sync,
        localVersion: (item.sync.localVersion ?? 0) + 1,
        syncStatus: 'pending',
      },
    };

    const db = await getDB();
    await db.put('schedules', tombstone);
  }

  async hardDelete(id: string, userId: string): Promise<void> {
    const item = await this.getById(id, userId);
    if (!item) return;
    const db = await getDB();
    await db.delete('schedules', id);
  }

  async listPendingSync(userId: string): Promise<Schedule[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('schedules', 'by-user', userId);
    return all.filter((s) => s.sync.syncStatus === 'pending' || s.sync.syncStatus === 'local_only');
  }

  async markSynced(id: string, userId: string, serverVersion: number): Promise<void> {
    const item = await this.getById(id, userId);
    if (!item) return;

    item.sync = {
      ...item.sync,
      syncStatus: 'synced',
      serverVersion,
      lastSyncedAt: new Date().toISOString(),
      syncError: null,
    };

    const db = await getDB();
    await db.put('schedules', item);
  }

  async markConflict(
    id: string,
    userId: string,
    serverVersion: number,
    remoteSnapshot: Record<string, unknown>
  ): Promise<void> {
    const item = await this.getById(id, userId);
    if (!item) return;

    item.sync = {
      ...item.sync,
      syncStatus: 'conflict',
      serverVersion,
      conflictCopy: remoteSnapshot,
      syncError: 'Remote version conflict',
    };

    const db = await getDB();
    await db.put('schedules', item);
  }

  async countUnsynced(userId: string): Promise<number> {
    const pending = await this.listPendingSync(userId);
    return pending.length;
  }

  async listPresets(userId: string, kind?: ScheduleKind): Promise<SchedulePreset[]> {
    const db = await getDB();
    const userPresets = await db.getAllFromIndex('schedule_presets', 'by-user', userId);

    const merged = [
      ...userPresets,
      ...STARTER_PRESETS.map((p) => ({
        ...p,
        userId,
      })),
    ];

    if (kind) {
      return merged.filter((p) => p.kind === kind);
    }
    return merged;
  }

  async clearUserData(userId: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('schedules', 'readwrite');
    let cursor = await tx.store.index('by-user').openCursor(userId);
    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}

export const scheduleRepository = new IndexedDBScheduleRepository();
