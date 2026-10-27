/**
 * Data Privacy & Cache Management Section
 * Handles shared device notices, clearing local IndexedDB cache, and data exports.
 * Per docs/PRD.md FR-10 and docs/SECURITY.md.
 */

import React, { useState } from 'react';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { prayerRepository } from '../../lib/db/prayer-repository';
import { studyRepository } from '../../lib/db/study-repository';
import { activityRepository } from '../../lib/db/activity-repository';
import { planRepository } from '../../lib/db/plan-repository';
import { syncQueueManager } from '../../lib/sync/sync-queue';

export const DataPrivacySection: React.FC = () => {
  const { user } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleClearLocalCache = async () => {
    setIsClearing(true);
    const activeUserId = user?.id || 'demo-user-id';
    await prayerRepository.clearUserData(activeUserId);
    await studyRepository.clearUserData(activeUserId);
    await activityRepository.clearUserData(activeUserId);
    await planRepository.clearUserData(activeUserId);
    await syncQueueManager.clearQueue(activeUserId);
    setIsClearing(false);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Shared Device & Local Privacy Warning */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2 font-semibold mb-1">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Shared Device Notice</span>
        </div>
        <p className="leading-relaxed opacity-90">
          Charis preserves your journal drafts in browser local storage. If sharing this device, please remember to sign out to protect personal reflections.
        </p>
      </div>

      {/* Local Storage & Cache Partition Management */}
      <div className="p-3 border border-charis-border rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-charis-text block">Local Device Cache</span>
          <span className="text-[11px] text-charis-text-muted">
            {clearSuccess
              ? 'Local storage cleared successfully.'
              : 'Remove all offline records for this account from this browser.'}
          </span>
        </div>
        <button
          onClick={handleClearLocalCache}
          disabled={isClearing}
          className="px-2.5 py-1 text-xs rounded-lg border border-charis-border hover:bg-charis-border-subtle text-charis-text transition-colors"
        >
          {isClearing ? 'Clearing...' : 'Clear Cache'}
        </button>
      </div>

      {/* Account Deletion / Export */}
      <div className="pt-2 border-t border-charis-border flex items-center justify-between">
        <button className="text-xs text-charis-text-muted hover:text-charis-text flex items-center gap-1.5 transition-colors">
          <Download className="w-3.5 h-3.5" />
          <span>Export Personal Journals (JSON)</span>
        </button>

        <button className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account & Data</span>
        </button>
      </div>
    </div>
  );
};
