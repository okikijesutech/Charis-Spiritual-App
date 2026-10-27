/**
 * User-Facing Privacy Policy & Commitment Modal
 * Explains local-first storage, zero-tracking, RLS encryption, and data rights.
 * Per docs/PRD.md FR-12, docs/SECURITY.md, and docs/IMPLEMENTATION-PLAN.md Section 11.
 */

import React from 'react';
import { ShieldCheck, Lock, HardDrive, BellOff, Trash2, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy & Commitment"
      description="Grace over surveillance. How Charis protects your private walk."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs text-charis-text max-h-[70vh] overflow-y-auto pr-1">
        {/* Core Guarantee Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-xs block mb-0.5">Your Sanctuary is Sacred</span>
            <p className="opacity-90 leading-relaxed text-[11px]">
              Charis was created as a peaceful digital monastery. We believe your prayer confessions, private tears, and theological questions belong solely between you and God.
            </p>
          </div>
        </div>

        {/* Section 1: Local-First Storage */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-charis-text">
            <HardDrive className="w-4 h-4 text-charis-primary" />
            <span>1. Local-First Browser Persistence</span>
          </div>
          <p className="text-charis-text-muted leading-relaxed">
            By default, your prayers, study notes, and reading plans reside directly in your device’s browser storage (IndexedDB). They are available 100% offline without any network connection.
          </p>
        </div>

        {/* Section 2: Isolated Cloud Synchronization */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-charis-text">
            <Lock className="w-4 h-4 text-charis-primary" />
            <span>2. Strict Row-Level Security (RLS)</span>
          </div>
          <p className="text-charis-text-muted leading-relaxed">
            When you choose to sign in to sync across devices, your data is isolated using PostgreSQL Row-Level Security. Every read, write, and delete request is cryptographically enforced to your personal user ID (<code className="font-mono text-[10px] bg-charis-border-subtle px-1 py-0.5 rounded">auth.uid() = user_id</code>). No other user can access your data.
          </p>
        </div>

        {/* Section 3: Generic Notifications Only */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-charis-text">
            <BellOff className="w-4 h-4 text-charis-primary" />
            <span>3. Zero Notification Leaks</span>
          </div>
          <p className="text-charis-text-muted leading-relaxed">
            Push notifications and daily rhythm alarms contain only peaceful, generic reminder copy (e.g. <em>“Daily Scripture reading awaits”</em>). Personal prayer requests or study observations are never placed into push payloads.
          </p>
        </div>

        {/* Section 4: Zero Tracking & Telemetry */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-charis-text">
            <CheckCircle2 className="w-4 h-4 text-charis-primary" />
            <span>4. No Analytics or Advertising</span>
          </div>
          <p className="text-charis-text-muted leading-relaxed">
            Charis does not include Google Analytics, Facebook Pixels, or marketing trackers. We do not profile your religious habits, sell data, or display advertisements.
          </p>
        </div>

        {/* Section 5: Full Portability & Account Deletion */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-charis-text">
            <Trash2 className="w-4 h-4 text-charis-primary" />
            <span>5. Complete Export & Instant Deletion</span>
          </div>
          <p className="text-charis-text-muted leading-relaxed">
            You may export your complete data history at any time in open JSON or Markdown format. If you choose to delete your account, all cloud rows and local device partitions are permanently erased immediately.
          </p>
        </div>

        <div className="pt-2 border-t border-charis-border/60 flex items-center justify-between text-[11px] text-charis-text-muted">
          <span>Effective Date: October 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-charis-primary text-white font-medium hover:bg-charis-primary/90 transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </Modal>
  );
};
