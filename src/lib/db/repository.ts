/**
 * Abstract Repository Interface
 * Defines persistence, querying, soft deletion (tombstones),
 * sync metadata tracking, and account partitioning.
 * Per docs/OFFLINE-SYNC.md Section 2 & Section 9.
 */

import type { BaseEntity, SyncStatus } from '../../types/sync';

export interface RepositoryFilter<T> {
  includeDeleted?: boolean;
  syncStatus?: SyncStatus;
  limit?: number;
  offset?: number;
  orderBy?: keyof T;
  orderDirection?: 'asc' | 'desc';
}

export interface IRepository<T extends BaseEntity> {
  /**
   * Retrieve single entity by ID within the user's partition.
   */
  getById(id: string, userId: string): Promise<T | null>;

  /**
   * List entities belonging to the specified user partition.
   */
  list(userId: string, filter?: RepositoryFilter<T>): Promise<T[]>;

  /**
   * Save (insert or update) an entity locally.
   */
  save(item: T): Promise<T>;

  /**
   * Soft-delete with tombstone timestamp.
   * Preserves record locally so the deletion can be queued and synced.
   */
  softDelete(id: string, userId: string): Promise<void>;

  /**
   * Hard-delete a record permanently from local storage.
   */
  hardDelete(id: string, userId: string): Promise<void>;

  /**
   * List all entities pending synchronization for a user.
   */
  listPendingSync(userId: string): Promise<T[]>;

  /**
   * Mark entity as acknowledged by server.
   */
  markSynced(id: string, userId: string, serverVersion: number): Promise<void>;

  /**
   * Mark entity as conflicting with a remote version.
   */
  markConflict(
    id: string,
    userId: string,
    serverVersion: number,
    remoteSnapshot: Record<string, unknown>
  ): Promise<void>;

  /**
   * Count un-synchronized changes for account-switch warning.
   */
  countUnsynced(userId: string): Promise<number>;

  /**
   * Delete all local data for this user (e.g. on clean sign-out).
   */
  clearUserData(userId: string): Promise<void>;
}
