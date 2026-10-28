/**
 * Data Privacy & Cache Management Section
 * Handles shared device notices, clearing local IndexedDB cache,
 * comprehensive data export, and permanent account deletion.
 * Per docs/PRD.md FR-10, FR-12 and docs/SECURITY.md Section 10.
 */

import React, { useState } from 'react';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { prayerRepository } from '../../lib/db/prayer-repository';
import { studyRepository } from '../../lib/db/study-repository';
import { activityRepository } from '../../lib/db/activity-repository';
import { planRepository } from '../../lib/db/plan-repository';
import { scheduleRepository } from '../../lib/db/schedule-repository';
import { settingsRepository } from '../../lib/db/settings-repository';
import { syncQueueManager } from '../../lib/sync/sync-queue';
import { ExportModal } from '../modals/ExportModal';
import { AccountDeletionModal } from '../modals/AccountDeletionModal';

export const DataPrivacySection: React.FC = () => {
  const { user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';

  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleClearLocalCache = async () => {
    setIsClearing(true);
    await Promise.all([
      prayerRepository.clearUserData(activeUserId),
      studyRepository.clearUserData(activeUserId),
      activityRepository.clearUserData(activeUserId),
      planRepository.clearUserData(activeUserId),
      scheduleRepository.clearUserData(activeUserId),
      settingsRepository.clearUserData(activeUserId),
      syncQueueManager.clearQueue(activeUserId),
    ]);
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
      <div className="p-3 border border-charis-border rounded-xl flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-charis-text block">Local Device Cache</span>
          <span className="text-[11px] text-charis-text-muted leading-relaxed block mt-0.5">
            {clearSuccess
              ? 'Local cache cleared. Synced cloud records remain safe.'
              : 'Clears offline drafts and cached Bible data from this browser. Does not affect synced records in the cloud.'}
          </span>
        </div>
        <button
          onClick={handleClearLocalCache}
          disabled={isClearing}
          className="px-2.5 py-1.5 text-xs rounded-lg border border-charis-border hover:bg-charis-border-subtle text-charis-text transition-colors shrink-0"
        >
          {isClearing ? 'Clearing...' : 'Clear Cache'}
        </button>
      </div>

      {/* Account Deletion / Export Actions */}
      <div className="pt-2 border-t border-charis-border flex items-center justify-between">
        <button
          onClick={() => setIsExportOpen(true)}
          className="text-xs text-charis-text-muted hover:text-charis-text flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-charis-primary" />
          <span>Export Personal Archive (JSON / Markdown)</span>
        </button>

        <button
          onClick={() => setIsDeleteOpen(true)}
          className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account & Data</span>
        </button>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        userId={activeUserId}
      />

      {/* Account Deletion Modal */}
      <AccountDeletionModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        userId={activeUserId}
      />
    </div>
  );
};
