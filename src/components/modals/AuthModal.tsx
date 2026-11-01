/**
 * Authentication & Account Profile Modal
 * When signed out: provides direct access to Sign In or Create Account.
 * When signed in: displays account identity, cloud sync status, and secure sign-out controls.
 * Per docs/PRD.md FR-01 and docs/SECURITY.md.
 */

import React, { useState } from 'react';
import { UserCheck, LogOut, ShieldCheck, Mail, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { AuthForm } from '../auth/AuthForm';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { prayerRepository } from '../../lib/db/prayer-repository';
import { studyRepository } from '../../lib/db/study-repository';
import { activityRepository } from '../../lib/db/activity-repository';
import { planRepository } from '../../lib/db/plan-repository';
import { syncQueueManager } from '../../lib/sync/sync-queue';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const { user, profile, isConfigured, signOut } = useAuth();
  const [unsyncedWarning, setUnsyncedWarning] = useState<number | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Fellow Pilgrim';

  const handleSignOutClick = async () => {
    if (!user) return;
    const count = await prayerRepository.countUnsynced(user.id);
    if (count > 0) {
      setUnsyncedWarning(count);
    } else {
      setIsSigningOut(true);
      await signOut();
      setIsSigningOut(false);
      onClose();
    }
  };

  const handleConfirmSignOut = async (wipeLocal: boolean) => {
    if (!user) return;
    setIsSigningOut(true);
    if (wipeLocal) {
      await prayerRepository.clearUserData(user.id);
      await studyRepository.clearUserData(user.id);
      await activityRepository.clearUserData(user.id);
      await planRepository.clearUserData(user.id);
      await syncQueueManager.clearQueue(user.id);
    }
    await signOut();
    setIsSigningOut(false);
    setUnsyncedWarning(null);
    onClose();
  };

  if (user) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Account Profile"
        description="Your personal sanctuary identity and cloud synchronization status."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 pt-1 text-sm text-charis-text">
          {/* Identity Card */}
          <div className="p-4 rounded-2xl bg-charis-border-subtle/40 border border-charis-border flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-charis-primary/10 text-charis-primary border border-charis-primary/20 flex items-center justify-center font-serif font-bold text-lg shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-charis-primary uppercase tracking-wider block">
                  Signed In
                </span>
                <h3 className="font-serif font-bold text-base text-charis-text truncate">
                  {displayName}
                </h3>
                <p className="text-xs text-charis-text-muted flex items-center gap-1 mt-0.5 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>

            <Badge variant="sage" size="sm" className="gap-1 shrink-0">
              <UserCheck className="w-3 h-3" />
              <span>{isConfigured ? 'Cloud Sync' : 'Local'}</span>
            </Badge>
          </div>

          {/* Security & Sync Info Note */}
          <div className="p-3 rounded-xl bg-charis-surface border border-charis-border/80 flex items-start gap-2.5 text-xs text-charis-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              Your reflections, journals, and reading history are protected by Postgres Row Level Security (RLS) and encrypted in transit.
            </p>
          </div>

          {/* Unsynced Warning Banner */}
          {unsyncedWarning !== null && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{unsyncedWarning} offline item(s) pending sync</span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                Signing out before syncing may leave unsaved reflections on this device.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleConfirmSignOut(false)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
                >
                  Keep on device & Sign Out
                </button>
                <button
                  onClick={() => setUnsyncedWarning(null)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-charis-border-subtle text-charis-text hover:bg-charis-border transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-charis-border/60">
            {onOpenSettings ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-xs text-charis-primary hover:text-charis-primary-hover font-medium transition-colors"
              >
                Open Full Settings &rarr;
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleSignOutClick}
              disabled={isSigningOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // Signed out state: Show Sign In or Create Account form
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign In or Create Account"
      description="Access your personal sanctuary and sync seamlessly across devices."
      maxWidth="max-w-md"
    >
      <div className="pt-1">
        <AuthForm onSuccess={onClose} />
      </div>
    </Modal>
  );
};
