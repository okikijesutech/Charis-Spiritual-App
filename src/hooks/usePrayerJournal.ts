import { useState, useEffect, useCallback } from 'react';
import { prayerRepository } from '../lib/db/prayer-repository';
import { syncQueueManager } from '../lib/sync/sync-queue';
import { syncEngine } from '../lib/sync/sync-engine';
import { generateUUID } from '../lib/id';
import type { PrayerEntry } from '../types/journal';

export function usePrayerJournal(activeUserId: string) {
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conflictPrayer, setConflictPrayer] = useState<PrayerEntry | null>(null);

  const loadPrayers = useCallback(async () => {
    try {
      const items = await prayerRepository.list(activeUserId);
      setPrayers(items);
    } catch (err) {
      console.error('[Charis Prayer] Failed to load prayers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  const savePrayer = async (data: {
    id?: string;
    title: string;
    body: string;
    tags: string[];
    scriptureRef: string;
    isAnswered?: boolean;
    answeredNote?: string;
  }) => {
    const isNew = !data.id;
    const now = new Date().toISOString();
    const entryId = data.id || generateUUID();

    const scriptureReferences = data.scriptureRef
      ? [{ bookId: '', bookName: '', chapter: 1, formatted: data.scriptureRef }]
      : [];

    const entry: PrayerEntry = {
      id: entryId,
      userId: activeUserId,
      title: data.title || undefined,
      body: data.body,
      entryAt: now,
      tags: data.tags,
      scriptureReferences,
      isAnswered: data.isAnswered,
      answeredAt: data.isAnswered ? now : null,
      answeredNote: data.answeredNote,
      createdAt: isNew ? now : (prayers.find((p) => p.id === entryId)?.createdAt || now),
      updatedAt: now,
      sync: {
        syncStatus: 'pending',
        localVersion: 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    };

    await prayerRepository.save(entry);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: activeUserId,
      entityType: 'prayer_entry',
      entityId: entryId,
      action: isNew ? 'create' : 'update',
      baseVersion: 0,
      payload: entry,
    });

    await loadPrayers();
    syncEngine.processQueue(activeUserId).catch(() => {});
  };

  const toggleAnswered = async (prayer: PrayerEntry) => {
    const now = new Date().toISOString();
    const willBeAnswered = !prayer.isAnswered;
    const updated: PrayerEntry = {
      ...prayer,
      isAnswered: willBeAnswered,
      answeredAt: willBeAnswered ? now : null,
      updatedAt: now,
    };

    await prayerRepository.save(updated);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: activeUserId,
      entityType: 'prayer_entry',
      entityId: prayer.id,
      action: 'update',
      baseVersion: prayer.sync?.localVersion ?? 1,
      payload: updated,
    });

    await loadPrayers();
    syncEngine.processQueue(activeUserId).catch(() => {});
  };

  const deletePrayer = async (id: string) => {
    await prayerRepository.softDelete(id, activeUserId);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: activeUserId,
      entityType: 'prayer_entry',
      entityId: id,
      action: 'delete',
      baseVersion: 1,
    });

    await loadPrayers();
    syncEngine.processQueue(activeUserId).catch(() => {});
  };

  const resolveConflict = async (resolution: 'local' | 'remote' | 'merge') => {
    if (!conflictPrayer) return;

    if (resolution === 'local') {
      const resolved: PrayerEntry = {
        ...conflictPrayer,
        sync: {
          ...conflictPrayer.sync,
          syncStatus: 'pending',
          localVersion: (conflictPrayer.sync.localVersion ?? 1) + 1,
          conflictCopy: undefined,
          syncError: null,
        },
      };
      await prayerRepository.save(resolved);
    } else if (resolution === 'remote' && conflictPrayer.sync.conflictCopy) {
      const remote = conflictPrayer.sync.conflictCopy as Record<string, unknown>;
      const resolved: PrayerEntry = {
        ...conflictPrayer,
        title: typeof remote.title === 'string' ? remote.title : conflictPrayer.title,
        body: typeof remote.body === 'string' ? remote.body : conflictPrayer.body,
        updatedAt: typeof remote.updated_at === 'string' ? remote.updated_at : conflictPrayer.updatedAt,
        sync: {
          ...conflictPrayer.sync,
          syncStatus: 'synced',
          conflictCopy: undefined,
          syncError: null,
        },
      };
      await prayerRepository.save(resolved);
    } else if (resolution === 'merge' && conflictPrayer.sync.conflictCopy) {
      const remote = conflictPrayer.sync.conflictCopy as Record<string, unknown>;
      const remoteBody = typeof remote.body === 'string' ? remote.body : '';
      const merged: PrayerEntry = {
        ...conflictPrayer,
        body: `${conflictPrayer.body}\n\n--- [Cloud Version] ---\n${remoteBody}`,
        sync: {
          ...conflictPrayer.sync,
          syncStatus: 'pending',
          localVersion: (conflictPrayer.sync.localVersion ?? 1) + 1,
          conflictCopy: undefined,
          syncError: null,
        },
      };
      await prayerRepository.save(merged);
    }

    setConflictPrayer(null);
    await loadPrayers();
  };

  return {
    prayers,
    isLoading,
    savePrayer,
    toggleAnswered,
    deletePrayer,
    conflictPrayer,
    setConflictPrayer,
    resolveConflict,
    loadPrayers,
  };
}
