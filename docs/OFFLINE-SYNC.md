# Offline Storage and Synchronisation Specification

**Product:** Spiritual-discipline PWA  
**Version:** 1.0  
**Status:** Required design contract before implementation

## 1. Objective

After initial setup and relevant content downloads, users should be able to read downloaded Scripture, journal, study, record activities, review plans, and edit schedules without a network connection. Changes must remain visible locally and synchronise safely when connectivity returns.

Offline support does not mean every remote operation is available offline. New login, password recovery, provider-backed online search, and server-confirmed account deletion may require connectivity.

## 2. Storage responsibilities

### Cache Storage / service worker
Use for:
- Versioned application shell and static assets.
- Approved public fonts/icons/assets.
- Explicitly approved public resources.

Do not cache authenticated API responses or private journal pages by default. Use a narrow, documented allowlist for any runtime caching.

### IndexedDB
Use for:
- Downloaded Bible translation data and indexes where licensed.
- Prayer and study entries.
- Bookmarks and highlights.
- Reading plans and assignments.
- Activity types and logs.
- Schedules and presets.
- User preferences needed offline.
- Sync queue, tombstones, local version metadata, and conflict copies.

Use a small, maintained IndexedDB wrapper only if it simplifies migrations and transactions. Keep the persistence API behind a repository boundary.

## 3. Local data model

Every local user-owned record should include:
- Stable record UUID.
- `ownerUserId`.
- Local schema version or migration support.
- `createdAt` and `updatedAt`.
- `syncStatus` or equivalent metadata.
- Remote version/base version when known.
- Deletion tombstone metadata when deleted offline.

Do not treat local timestamps as a security authority. The server validates ownership and final writes.

## 4. State machine

Recommended sync states:
- `local_only`: saved locally, not yet accepted by server.
- `pending`: queued for upload.
- `syncing`: currently being processed.
- `synced`: server acknowledged the latest local version.
- `conflict`: remote and local versions both changed since the base version.
- `failed`: retryable or non-retryable failure; expose a useful action.

Keep user-facing language simple:
- “Saved on this device”
- “Syncing”
- “Synced”
- “Needs attention”

Do not display raw server stack traces.

## 5. Write workflow

1. Validate user input locally.
2. Persist the record in IndexedDB in a transaction.
3. Update the UI from local state immediately.
4. Enqueue an operation with a stable operation ID and base version.
5. If online, attempt sync; otherwise leave it queued.
6. Server validates auth, ownership, schema, parent relationships, and operation ID.
7. Server applies the change idempotently or returns a conflict.
8. Mark synced only after acknowledgement.
9. On transient failure, retain the queue item and retry with bounded exponential backoff when the app is active/allowed to run.
10. On permanent validation/auth failure, retain the local content and present a recovery action.

Never delete the local draft merely because an upload attempt failed.

## 6. Idempotency and server protocol

The implementation must choose and document one concrete protocol before building sync:
- A server-side RPC/mutation endpoint that records operation IDs and applies validated changes transactionally; or
- A carefully designed direct-table upsert protocol with unique operation receipts and equivalent conflict checks.

Do not assume a client retry is harmless without an idempotency design.

An operation receipt may contain:
- `operation_id`
- `user_id`
- entity type and ID
- result status
- applied server version/timestamp
- created timestamp

Receipts must be private to the owning user and retained long enough to cover retries. Never include tokens or full journal content in receipt logs.

## 7. Conflict policy

### Non-conflicting updates
If the remote record has not changed since the local base version, apply the local change.

### Concurrent journal edits
Do not silently use last-write-wins. Preserve both versions and provide a comparison/recovery UI. The user may:
- Keep local version.
- Keep remote version.
- Copy/merge content into a new version.
- Cancel and revisit later.

### Independent fields
Field-level merging may be used only when the implementation can prove the fields changed independently and the result remains valid. Avoid complex rich-text merge in v1.

### Plan assignments
A change to future assignments must not erase completed assignments. Use transactions and stable assignment IDs. If both devices reschedule the same future assignment, present a conflict or apply a documented deterministic rule that preserves user intent.

### Deletions
Use tombstones for offline deletions. The server acknowledges deletion; other devices receive the tombstone before it is purged. A stale device must not resurrect a deleted record simply by syncing an old copy.

## 8. Sync ordering

- Process operations per entity in a safe order.
- Create parent records before dependent child records.
- Do not upload a child with a missing or unauthorised parent.
- Defer deletes until required child operations are handled or use a transactional server delete.
- Use stable IDs generated locally so records can be referenced offline.
- A retry must not create a new ID for the same user action.
- Allow unrelated entities to sync independently where safe.

## 9. Account switching and sign-out

- Partition all local user data by authenticated user ID.
- Never display one user's local records in another user's session.
- Before clearing local data, identify unsynced changes and ask the user what to do.
- Provide an explicit “clear this account's local data” action.
- On account deletion, clear local records after the deletion workflow is confirmed, with clear warning about unsynced content.
- Do not store auth tokens in application records or sync payloads.
- Handle expired sessions without discarding local content; pause sync until re-authentication.

## 10. Bible download workflow

1. Display translation name, language, size if known, and licence/attribution details.
2. Verify offline use is permitted.
3. Fetch a manifest and translation data from an approved source.
4. Validate schema, expected book/chapter structure, and response integrity.
5. Write data transactionally or stage it before making the download available.
6. Show progress and support retry/cancel.
7. Mark a translation available offline only when all required data is committed.
8. Preserve already downloaded translations if another download fails.
9. Provide delete-download action and show approximate storage usage where supported.
10. Build or update a local search index only if the translation's rights and device constraints allow it.

Do not present partial/corrupt translation data as a completed download.

## 11. Local search

- Search only downloaded translations and indexes when offline.
- Clearly label which translation(s) were searched.
- Use a debounced search UI.
- Bound result counts and avoid blocking the UI thread for large indexes; consider a worker only if measurement justifies it.
- Do not promise fuzzy/semantic search in v1 unless implemented and tested.
- Online Open Bible search must fail gracefully and offer local search where available.

## 12. PWA lifecycle

- Version the service worker and local database schema independently.
- Use safe migrations for IndexedDB; do not delete user content during an upgrade.
- Handle an update waiting to activate without unexpectedly interrupting an editor.
- Test install, update, offline launch, cache invalidation, and storage quota failures.
- Treat background sync as best-effort, not guaranteed.
- Provide an app-visible retry/sync action.

## 13. Acceptance tests

- [ ] Create and reopen a prayer entry in airplane mode.
- [ ] Create and reopen a study entry in airplane mode.
- [ ] Record multiple activity sessions offline.
- [ ] Mark a reading partial/complete offline and sync it.
- [ ] Edit a schedule offline and sync it.
- [ ] Retry an upload multiple times without duplicate records.
- [ ] Simulate concurrent edits and verify both versions survive.
- [ ] Delete offline and verify stale devices do not resurrect the record.
- [ ] Switch accounts without cross-account local data leakage.
- [ ] Expire a session while offline and retain drafts.
- [ ] Simulate storage quota failure and preserve the last valid copy.
- [ ] Download interruption never marks a partial Bible as complete.
- [ ] App shell launches offline after a successful install/cache.
- [ ] Service worker does not expose private responses to another session.
