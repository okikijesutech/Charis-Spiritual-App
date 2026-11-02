/**
 * Sync Context & Hook
 * Exposes real-time sync state, offline status, and manual sync triggers.
 * Per docs/OFFLINE-SYNC.md Section 4 ("Keep user-facing language simple").
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { syncEngine, type SyncEngineStatus } from '../lib/sync/sync-engine';
import { migrateDemoDataToUser } from '../lib/sync/data-migration';
import { useAuth } from './AuthContext';

interface SyncContextValue extends SyncEngineStatus {
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SyncEngineStatus>(() => syncEngine.getStatus());

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  // When user signs in or changes, migrate local demo drafts and run bidirectional sync
  useEffect(() => {
    if (user?.id) {
      migrateDemoDataToUser(user.id).then(() => {
        syncEngine.sync(user.id).catch(() => {});
      });
    }
  }, [user?.id]);

  const triggerSync = async () => {
    if (user?.id) {
      await migrateDemoDataToUser(user.id);
      await syncEngine.sync(user.id);
    }
  };

  const value = useMemo<SyncContextValue>(
    () => ({
      ...status,
      triggerSync,
    }),
    [status, user?.id]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
