/**
 * Synchronization and Offline Data Types
 * Per docs/OFFLINE-SYNC.md and docs/DATA-MODEL.md
 */

export type SyncStatus =
  | 'local_only' // Created locally, not yet queued or synced
  | 'pending'    // Enqueued for upload
  | 'syncing'    // Currently being uploaded
  | 'synced'     // Server acknowledged latest local change
  | 'conflict'   // Concurrent edit detected between local and remote
  | 'failed';    // Permanent or bounded retry limit exceeded

export interface SyncMetadata {
  syncStatus: SyncStatus;
  localVersion: number;
  serverVersion?: number | null;
  lastSyncedAt?: string | null;
  syncError?: string | null;
  conflictCopy?: Record<string, unknown> | null;
}

export type SyncOperationAction = 'create' | 'update' | 'delete';

export interface SyncOperation<T = unknown> {
  operationId: string;       // Unique UUID for server idempotency
  userId: string;            // User ownership boundary
  entityType: string;        // 'prayer_entry' | 'study_entry' | 'activity_log' | etc.
  entityId: string;          // Target record UUID
  action: SyncOperationAction;
  baseVersion: number;       // The version this modification was based upon
  payload?: T | null;        // Snapshot of data to upsert or null for deletion
  queuedAt: string;          // ISO 8601 UTC timestamp
  retryCount: number;
  lastAttemptAt?: string | null;
  lastError?: string | null;
}

export interface BaseEntity {
  id: string;                // Client-generated UUID v4
  userId: string;            // Authenticated user ID partition key
  createdAt: string;         // ISO 8601 UTC timestamp
  updatedAt: string;         // ISO 8601 UTC timestamp
  deletedAt?: string | null; // ISO 8601 UTC tombstone for offline deletions
  sync: SyncMetadata;
}
