import { useState, useEffect, useCallback } from 'react';
import { studyRepository } from '../lib/db/study-repository';
import { syncQueueManager } from '../lib/sync/sync-queue';
import { syncEngine } from '../lib/sync/sync-engine';
import { generateUUID } from '../lib/id';
import type { StudyEntry, ScriptureReference } from '../types/journal';

export function useStudyJournal(activeUserId: string) {
  const [studies, setStudies] = useState<StudyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conflictStudy, setConflictStudy] = useState<StudyEntry | null>(null);

  const loadStudies = useCallback(async () => {
    try {
      const items = await studyRepository.list(activeUserId);
      setStudies(items);
    } catch (err) {
      console.error('[Charis Study] Failed to load study entries:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  const saveStudy = async (data: {
    id?: string;
    title: string;
    scriptureRef: string;
    observations: string;
    questionsContext: string;
    interpretation: string;
    application: string;
    notes: string;
    crossReferences: ScriptureReference[];
  }) => {
    const isNew = !data.id;
    const now = new Date().toISOString();
    const entryId = data.id || generateUUID();

    const passageRef: ScriptureReference = {
      bookId: '',
      bookName: '',
      chapter: 1,
      formatted: data.scriptureRef || 'General Reflection',
    };

    const entry: StudyEntry = {
      id: entryId,
      userId: activeUserId,
      title: data.title || `Study on ${passageRef.formatted}`,
      passageRef,
      observations: data.observations || undefined,
      questionsContext: data.questionsContext || undefined,
      interpretation: data.interpretation || undefined,
      application: data.application || undefined,
      notes: data.notes || undefined,
      crossReferences: data.crossReferences,
      createdAt: isNew ? now : (studies.find((s) => s.id === entryId)?.createdAt || now),
      updatedAt: now,
      sync: {
        syncStatus: 'pending',
        localVersion: 1,
        serverVersion: null,
        lastSyncedAt: null,
        syncError: null,
      },
    };

    await studyRepository.save(entry);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: activeUserId,
      entityType: 'study_entry',
      entityId: entryId,
      action: isNew ? 'create' : 'update',
      baseVersion: 0,
      payload: entry,
    });

    await loadStudies();
    syncEngine.processQueue(activeUserId).catch(() => {});
  };

  const deleteStudy = async (id: string) => {
    await studyRepository.softDelete(id, activeUserId);
    await syncQueueManager.enqueue({
      operationId: generateUUID(),
      userId: activeUserId,
      entityType: 'study_entry',
      entityId: id,
      action: 'delete',
      baseVersion: 1,
    });

    await loadStudies();
    syncEngine.processQueue(activeUserId).catch(() => {});
  };

  const resolveConflict = async (resolution: 'local' | 'remote' | 'merge') => {
    if (!conflictStudy) return;

    if (resolution === 'local') {
      const resolved: StudyEntry = {
        ...conflictStudy,
        sync: {
          ...conflictStudy.sync,
          syncStatus: 'pending',
          localVersion: (conflictStudy.sync.localVersion ?? 1) + 1,
          conflictCopy: undefined,
          syncError: null,
        },
      };
      await studyRepository.save(resolved);
    } else if (resolution === 'remote' && conflictStudy.sync.conflictCopy) {
      const remote = conflictStudy.sync.conflictCopy as Record<string, unknown>;
      const resolved: StudyEntry = {
        ...conflictStudy,
        title: typeof remote.title === 'string' ? remote.title : conflictStudy.title,
        observations: typeof remote.observations === 'string' ? remote.observations : conflictStudy.observations,
        interpretation: typeof remote.interpretation === 'string' ? remote.interpretation : conflictStudy.interpretation,
        application: typeof remote.application === 'string' ? remote.application : conflictStudy.application,
        updatedAt: typeof remote.updated_at === 'string' ? remote.updated_at : conflictStudy.updatedAt,
        sync: {
          ...conflictStudy.sync,
          syncStatus: 'synced',
          conflictCopy: undefined,
          syncError: null,
        },
      };
      await studyRepository.save(resolved);
    } else if (resolution === 'merge' && conflictStudy.sync.conflictCopy) {
      const remote = conflictStudy.sync.conflictCopy as Record<string, unknown>;
      const remoteApp = typeof remote.application === 'string' ? remote.application : '';
      const merged: StudyEntry = {
        ...conflictStudy,
        application: `${conflictStudy.application || ''}\n\n--- [Cloud Application] ---\n${remoteApp}`,
        sync: {
          ...conflictStudy.sync,
          syncStatus: 'pending',
          localVersion: (conflictStudy.sync.localVersion ?? 1) + 1,
          conflictCopy: undefined,
          syncError: null,
        },
      };
      await studyRepository.save(merged);
    }

    setConflictStudy(null);
    await loadStudies();
  };

  return {
    studies,
    isLoading,
    saveStudy,
    deleteStudy,
    conflictStudy,
    setConflictStudy,
    resolveConflict,
    loadStudies,
  };
}
