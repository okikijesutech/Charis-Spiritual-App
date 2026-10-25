/**
 * Client-Side Identifier Generation
 * Generates RFC 4122 v4 UUIDs for offline entity and operation idempotency.
 * Per docs/OFFLINE-SYNC.md Section 8 (stable IDs generated locally).
 */

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older browser runtimes
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
