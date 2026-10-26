import React from 'react';
import { AlertTriangle, Cloud, HardDrive, Check, Copy } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  localContent: {
    title?: string;
    body: string;
    updatedAt: string;
  };
  remoteContent: {
    title?: string;
    body: string;
    updatedAt: string;
  };
  onKeepLocal: () => void;
  onKeepRemote: () => void;
  onMergeBoth: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  title,
  localContent,
  remoteContent,
  onKeepLocal,
  onKeepRemote,
  onMergeBoth,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Sync Conflict"
      description={`Changes to "${title}" were made both on this device and on another device.`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Both versions have been preserved safely without loss. Choose which version to keep or merge both together.</span>
        </div>

        {/* Side-by-side or stacked comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Local Version */}
          <div className="p-4 rounded-xl border border-charis-border bg-charis-surface space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-charis-primary">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                This Device (Local)
              </span>
              <span className="text-[11px] text-charis-text-muted">
                {new Date(localContent.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {localContent.title && (
              <h4 className="font-serif font-bold text-sm text-charis-text">
                {localContent.title}
              </h4>
            )}
            <p className="font-serif text-xs text-charis-text-muted line-clamp-6 whitespace-pre-wrap">
              {localContent.body || '(Empty)'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onKeepLocal}
              className="w-full gap-1 text-xs mt-2"
            >
              <Check className="w-3.5 h-3.5" />
              Keep Local Version
            </Button>
          </div>

          {/* Remote Version */}
          <div className="p-4 rounded-xl border border-charis-border bg-charis-surface space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-charis-primary">
              <span className="flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5" />
                Cloud Version (Remote)
              </span>
              <span className="text-[11px] text-charis-text-muted">
                {new Date(remoteContent.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {remoteContent.title && (
              <h4 className="font-serif font-bold text-sm text-charis-text">
                {remoteContent.title}
              </h4>
            )}
            <p className="font-serif text-xs text-charis-text-muted line-clamp-6 whitespace-pre-wrap">
              {remoteContent.body || '(Empty)'}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={onKeepRemote}
              className="w-full gap-1 text-xs mt-2"
            >
              <Check className="w-3.5 h-3.5" />
              Keep Cloud Version
            </Button>
          </div>
        </div>

        {/* Merge Both Action */}
        <div className="pt-3 border-t border-charis-border flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
          >
            Decide Later
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={onMergeBoth}
            className="gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            Merge Both Contents
          </Button>
        </div>
      </div>
    </Modal>
  );
};
