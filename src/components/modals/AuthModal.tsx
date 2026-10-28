/**
 * Authentication Modal
 * Provides direct 1-click access to Sign In and Create Account.
 * Per docs/PRD.md FR-01.
 */

import React from 'react';
import { Modal } from '../ui/Modal';
import { AuthForm } from '../auth/AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
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
