/**
 * Persistent Sync Queue & Receipt Store
 * Per docs/OFFLINE-SYNC.md Section 5, 6 & 8.
 * Stores operations in IndexedDB to survive browser restarts and offline states.
 */

import { getDB, type SyncReceipt } from '../db/indexeddb';
import type { SyncOperation } from '../../types/sync';

export class SyncQueueManager {
  /**
   * Enqueue a new operation for offline or background synchronization.
   */
  async enqueue(op: Omit<SyncOperation, 'queuedAt' | 'retryCount'>): Promise<SyncOperation> {
    const fullOp: SyncOperation = {
      ...op,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      lastAttemptAt: null,
      lastError: null,
    };

    const db = await getDB();
    await db.put('sync_queue', fullOp);
    return fullOp;
  }

  /**
   * Retrieve all pending operations for a user, ordered by queued timestamp.
   */
  async listQueue(userId: string): Promise<SyncOperation[]> {
    const db = await getDB();
    const ops = await db.getAllFromIndex('sync_queue', 'by-user', userId);
    return ops.sort((a, b) => a.queuedAt.localeCompare(b.queuedAt));
  }

  /**
   * Remove an acknowledged operation from the queue.
   */
  async dequeue(operationId: string): Promise<void> {
    const db = await getDB();
    await db.delete('sync_queue', operationId);
  }

  /**
   * Record a failed retry attempt with bounded exponential backoff calculation.
   */
  async recordAttempt(operationId: string, errorMessage: string): Promise<void> {
    const db = await getDB();
    const op = await db.get('sync_queue', operationId);
    if (!op) return;

    op.retryCount += 1;
    op.lastAttemptAt = new Date().toISOString();
    op.lastError = errorMessage;

    await db.put('sync_queue', op);
  }

  /**
   * Store an idempotency receipt upon successful server acknowledgement.
   */
  async recordReceipt(receipt: SyncReceipt): Promise<void> {
    const db = await getDB();
    await db.put('sync_receipts', receipt);
  }

  /**
   * Check if an operation was already applied (idempotency safeguard).
   */
  async hasReceipt(operationId: string, userId: string): Promise<boolean> {
    const db = await getDB();
    const receipt = await db.get('sync_receipts', operationId);
    return Boolean(receipt && receipt.userId === userId);
  }

  /**
   * Clear all queue operations for a specific user (e.g. account switch/cleanup).
   */
  async clearQueue(userId: string): Promise<void> {
    const db = await getDB();
    const ops = await this.listQueue(userId);
    const tx = db.transaction('sync_queue', 'readwrite');
    for (const op of ops) {
      await tx.store.delete(op.operationId);
    }
    await tx.done;
  }
}

export const syncQueueManager = new SyncQueueManager();
