/**
 * IndexedDB Schema & Database Connection
 * Per docs/OFFLINE-SYNC.md and docs/DATA-MODEL.md
 * Uses 'idb' for promise-wrapped transactional storage.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { PrayerEntry, StudyEntry } from '../../types/journal';
import type { SyncOperation } from '../../types/sync';
import type { BibleChapter } from '../../types/bible';

export const DB_NAME = 'charis_local_db';
export const DB_VERSION = 2;

export interface InstalledTranslation {
  translationId: string;
  installedAt: string;
  sizeBytes: number;
}

export interface SyncReceipt {
  operationId: string;
  userId: string;
  entityType: string;
  entityId: string;
  serverVersion?: number;
  appliedAt: string;
}

export interface CharisDBSchema extends DBSchema {
  prayer_entries: {
    key: string;
    value: PrayerEntry;
    indexes: {
      'by-user': string;
      'by-user-updated': [string, string];
      'by-user-sync': [string, string];
    };
  };
  study_entries: {
    key: string;
    value: StudyEntry;
    indexes: {
      'by-user': string;
      'by-user-updated': [string, string];
      'by-user-sync': [string, string];
    };
  };
  sync_queue: {
    key: string;
    value: SyncOperation;
    indexes: {
      'by-user': string;
      'by-queued-at': string;
    };
  };
  sync_receipts: {
    key: string;
    value: SyncReceipt;
    indexes: {
      'by-user': string;
      'by-user-applied': [string, string];
    };
  };
  bible_chapters: {
    key: string; // e.g. 'web:PSA:23'
    value: BibleChapter;
    indexes: {
      'by-translation': string;
    };
  };
  installed_translations: {
    key: string; // translationId
    value: InstalledTranslation;
  };
}

let dbInstance: IDBPDatabase<CharisDBSchema> | null = null;

/**
 * Open or retrieve the cached IndexedDB database instance.
 * Applies schema migrations safely without data loss.
 */
export async function getDB(): Promise<IDBPDatabase<CharisDBSchema>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<CharisDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Version 1: Initial schema for Prayer, Study, and Sync Queue
      if (oldVersion < 1) {
        // 1. Prayer Entries Store
        if (!db.objectStoreNames.contains('prayer_entries')) {
          const prayerStore = db.createObjectStore('prayer_entries', { keyPath: 'id' });
          prayerStore.createIndex('by-user', 'userId', { unique: false });
          prayerStore.createIndex('by-user-updated', ['userId', 'updatedAt'], { unique: false });
          prayerStore.createIndex('by-user-sync', ['userId', 'sync.syncStatus'], { unique: false });
        }

        // 2. Study Entries Store
        if (!db.objectStoreNames.contains('study_entries')) {
          const studyStore = db.createObjectStore('study_entries', { keyPath: 'id' });
          studyStore.createIndex('by-user', 'userId', { unique: false });
          studyStore.createIndex('by-user-updated', ['userId', 'updatedAt'], { unique: false });
          studyStore.createIndex('by-user-sync', ['userId', 'sync.syncStatus'], { unique: false });
        }

        // 3. Sync Queue Store (FIFO queue with operation IDs)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'operationId' });
          queueStore.createIndex('by-user', 'userId', { unique: false });
          queueStore.createIndex('by-queued-at', 'queuedAt', { unique: false });
        }

        // 4. Sync Receipts Store (for client idempotency verification)
        if (!db.objectStoreNames.contains('sync_receipts')) {
          const receiptStore = db.createObjectStore('sync_receipts', { keyPath: 'operationId' });
          receiptStore.createIndex('by-user', 'userId', { unique: false });
          receiptStore.createIndex('by-user-applied', ['userId', 'appliedAt'], { unique: false });
        }
      }

      // Version 2: Downloaded Bible Chapters cache & installed translations
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('bible_chapters')) {
          const chapterStore = db.createObjectStore('bible_chapters', { keyPath: 'id' });
          chapterStore.createIndex('by-translation', 'translationId', { unique: false });
        }
        if (!db.objectStoreNames.contains('installed_translations')) {
          db.createObjectStore('installed_translations', { keyPath: 'translationId' });
        }
      }
    },
    blocked() {
      console.warn('[Charis DB] IndexedDB upgrade blocked by open tabs.');
    },
    blocking() {
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
      }
    },
  });

  return dbInstance;
}

/**
 * Close database connection (useful for account clearing or testing).
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
