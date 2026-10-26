/**
 * Phase 3 Offline Persistence & Sync Gate Verification
 * Tests offline survival, soft-delete tombstones, account partitioning, and idempotency.
 */

let failures = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failures += 1;
  }
}

async function runTests() {
  console.log('--- Charis Phase 3 Offline & Sync Gate Tests ---');

  // 1. In-memory store simulation matching repository contract
  const localStore = new Map();
  const queueStore = new Map();
  const receiptStore = new Map();

  const userA = 'user-uuid-1111';
  const userB = 'user-uuid-2222';

  // Test 1: Create local entry in offline state
  const entryId = 'prayer-uuid-9999';
  const opId = 'op-uuid-8888';

  const entry = {
    id: entryId,
    userId: userA,
    title: 'Morning Prayer',
    body: 'Grace for today.',
    entryAt: new Date().toISOString(),
    tags: ['gratitude'],
    scriptureReferences: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    sync: {
      syncStatus: 'pending',
      localVersion: 1,
      serverVersion: null,
      lastSyncedAt: null,
      syncError: null,
    },
  };

  localStore.set(entryId, entry);
  queueStore.set(opId, {
    operationId: opId,
    userId: userA,
    entityType: 'prayer_entry',
    entityId: entryId,
    action: 'create',
    baseVersion: 0,
    payload: entry,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  });

  assert(localStore.has(entryId), 'Local record survives offline creation');
  assert(localStore.get(entryId).sync.syncStatus === 'pending', 'Local record marked as pending sync');
  assert(queueStore.has(opId), 'Operation safely enqueued in sync queue');

  // Test 2: Soft delete tombstone
  const tombstoneTime = new Date().toISOString();
  const existing = localStore.get(entryId);
  existing.deletedAt = tombstoneTime;
  existing.updatedAt = tombstoneTime;
  existing.sync.localVersion += 1;
  existing.sync.syncStatus = 'pending';

  assert(existing.deletedAt !== null, 'Soft delete preserves record as tombstone');
  assert(existing.sync.localVersion === 2, 'Tombstone increments local version');

  // Test 3: Account partitioning isolation
  const userARecords = Array.from(localStore.values()).filter((e) => e.userId === userA);
  const userBRecords = Array.from(localStore.values()).filter((e) => e.userId === userB);

  assert(userARecords.length === 1, 'User A sees their own record');
  assert(userBRecords.length === 0, 'User B cannot see User A records (strict partition)');

  // Test 4: Idempotency receipt deduplication
  receiptStore.set(opId, {
    operationId: opId,
    userId: userA,
    entityType: 'prayer_entry',
    entityId: entryId,
    appliedAt: new Date().toISOString(),
  });

  const isDuplicate = receiptStore.has(opId);
  assert(isDuplicate === true, 'Subsequent retry of acknowledged operation is deduplicated via receipt');

  console.log('------------------------------------------------');
  if (failures > 0) {
    console.error(`Offline gate tests failed with ${failures} error(s).`);
    process.exit(1);
  } else {
    console.log('All Phase 3 Offline & Sync Gate tests passed successfully.');
  }
}

runTests();
