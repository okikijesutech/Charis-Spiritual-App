/**
 * Account Deletion & Permanent Purge Modal
 * Requires explicit typed confirmation ("DELETE") before deleting all cloud records
 * and wiping local device partitions.
 * Per docs/PRD.md FR-01, FR-12 and docs/SECURITY.md Section 10.
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { accountDeletionManager } from '../../lib/account/account-deletion';
import { useAuth } from '../../context/AuthContext';

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const { signOut } = useAuth();
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConfirmed = confirmationInput.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await accountDeletionManager.purgeAccount(userId);
      if (res.success) {
        await signOut();
        onClose();
      } else {
        setErrorMessage('Failed to purge all data completely. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during account deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account & Data"
      description="Permanent removal of your account, journal entries, and local cache."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-sm">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2 font-semibold text-xs mb-1">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>Irreversible Action</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Deleting your account will immediately and permanently erase all your cloud data, prayer journal reflections, Bible study SOAP notes, activity history, and reading plans.
          </p>
        </div>

        {/* Typed Confirmation Prompt */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-charis-text block">
            To confirm deletion, please type <strong className="text-rose-600 dark:text-rose-400 font-mono">DELETE</strong> below:
          </label>
          <input
            type="text"
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            placeholder="Type DELETE"
            disabled={isDeleting}
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-charis-text text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-rose-500"
          />
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {errorMessage}
          </p>
        )}

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-charis-border/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-1.5 rounded-xl border border-charis-border text-xs font-medium text-charis-text hover:bg-charis-border-subtle transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
            className="px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors shadow-subtle"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting Account...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
