/**
 * Account & Profile Settings Section
 * Manages identity display, demo mode badge, and sign out with unsynced warning.
 * Per docs/PRD.md FR-01 and docs/SECURITY.md.
 */

import React, { useState } from 'react';
import { 
  LogOut, 
  UserCheck, 
  Globe, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockUserProfile } from '../../data/mockData';
import { Badge } from '../ui/Badge';
import { AuthForm } from '../auth/AuthForm';
import { prayerRepository } from '../../lib/db/prayer-repository';
import { studyRepository } from '../../lib/db/study-repository';
import { activityRepository } from '../../lib/db/activity-repository';
import { planRepository } from '../../lib/db/plan-repository';
import { syncQueueManager } from '../../lib/sync/sync-queue';

export const AccountSection: React.FC = () => {
  const { user, profile, settings, isConfigured, signOut } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [unsyncedWarning, setUnsyncedWarning] = useState<number | null>(null);

  const displayName = profile?.display_name || user?.user_metadata?.full_name || mockUserProfile.name;
  const displayEmail = user?.email || mockUserProfile.email;
  const displayTimeZone = settings?.timezone || mockUserProfile.timeZone;

  const handleSignOutClick = async () => {
    const activeUserId = user?.id || 'demo-user-id';
    const count = await prayerRepository.countUnsynced(activeUserId);
    if (count > 0) {
      setUnsyncedWarning(count);
    } else {
      await signOut();
      setShowAuthForm(true);
    }
  };

  const handleConfirmSignOut = async (wipeLocal: boolean) => {
    const activeUserId = user?.id || 'demo-user-id';
    if (wipeLocal) {
      await prayerRepository.clearUserData(activeUserId);
      await studyRepository.clearUserData(activeUserId);
      await activityRepository.clearUserData(activeUserId);
      await planRepository.clearUserData(activeUserId);
      await syncQueueManager.clearQueue(activeUserId);
    }
    await signOut();
    setUnsyncedWarning(null);
    setShowAuthForm(true);
  };

  return (
    <div className="p-4 rounded-xl border border-charis-border bg-charis-border-subtle/40">
      {showAuthForm && !user ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-charis-primary">
              Authentication
            </span>
            <button
              onClick={() => setShowAuthForm(false)}
              className="text-xs text-charis-text-muted hover:text-charis-text"
            >
              Cancel
            </button>
          </div>
          <AuthForm onSuccess={() => setShowAuthForm(false)} />
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-charis-primary/10 text-charis-primary border border-charis-primary/20 flex items-center justify-center font-serif font-bold text-base">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-semibold text-charis-text-muted uppercase tracking-wider block">
                  Account
                </span>
                <h3 className="font-serif font-bold text-base text-charis-text mt-0.5">
                  {displayName}
                </h3>
                <p className="text-xs text-charis-text-muted">{displayEmail}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <Badge variant="sage" size="sm" className="gap-1">
                <UserCheck className="w-3 h-3" />
                <span>{isConfigured ? 'Supabase Sync' : 'Demo Session'}</span>
              </Badge>
              <button
                onClick={handleSignOutClick}
                className="text-xs text-charis-text-muted hover:text-rose-600 flex items-center gap-1 transition-colors mt-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Unsynced Changes Confirmation Warning */}
          {unsyncedWarning !== null && (
            <div className="mt-3 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{unsyncedWarning} Unsaved Local Draft(s)</span>
              </div>
              <p className="text-xs mb-2.5 opacity-90">
                You have notes saved on this device that have not yet uploaded to the cloud. What would you like to do before signing out?
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleConfirmSignOut(false)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-charis-surface border border-charis-border font-medium text-charis-text hover:bg-charis-border-subtle"
                >
                  Keep drafts & Sign Out
                </button>
                <button
                  onClick={() => handleConfirmSignOut(true)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700"
                >
                  Wipe drafts & Sign Out
                </button>
                <button
                  onClick={() => setUnsyncedWarning(null)}
                  className="text-xs text-charis-text-muted hover:underline ml-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-charis-border/60 flex items-center justify-between text-xs text-charis-text-muted">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {displayTimeZone}
            </span>
            <button
              onClick={() => setShowAuthForm(true)}
              className="text-charis-primary font-medium hover:underline"
            >
              Switch Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
