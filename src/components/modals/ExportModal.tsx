/**
 * Comprehensive Data Export Modal
 * Allows downloading all personal reflections, studies, and rhythms
 * as JSON or Markdown archives.
 * Per docs/PRD.md FR-12 and docs/SECURITY.md Section 10.
 */

import React, { useState } from 'react';
import { Download, FileJson, FileText, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { exportManager, type CharisDataExport } from '../../lib/export/export-manager';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState<CharisDataExport | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handlePrepareExport = async () => {
    setIsLoading(true);
    try {
      const data = await exportManager.generateFullExport(userId);
      setExportData(data);
    } catch (err) {
      console.error('[ExportModal] Error preparing export:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      handlePrepareExport();
      setDownloadSuccess(null);
    }
  }, [isOpen, userId]);

  const handleDownloadJson = () => {
    if (!exportData) return;
    exportManager.downloadJson(exportData);
    setDownloadSuccess('JSON archive downloaded.');
  };

  const handleDownloadMarkdown = () => {
    if (!exportData) return;
    exportManager.downloadMarkdown(exportData);
    setDownloadSuccess('Markdown archive downloaded.');
  };

  const summary = exportData?.exportMetadata.summary;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Personal Archive"
      description="Download your complete prayer journal, inductive studies, and rhythms."
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-sm">
        {/* Loading State */}
        {isLoading && (
          <div className="p-8 flex flex-col items-center justify-center text-charis-primary">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <span className="text-xs">Assembling your spiritual reflections...</span>
          </div>
        )}

        {/* Content Summary */}
        {!isLoading && summary && (
          <div className="p-3.5 rounded-xl bg-charis-border-subtle/50 border border-charis-border space-y-1.5">
            <span className="text-xs font-semibold text-charis-text uppercase tracking-wider block mb-1">
              Included in Archive:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-charis-text-muted">
              <div>• <strong>{summary.prayerCount}</strong> Prayers</div>
              <div>• <strong>{summary.studyCount}</strong> Study Notes</div>
              <div>• <strong>{summary.activityCount}</strong> Rhythms Logged</div>
              <div>• <strong>{summary.planCount}</strong> Reading Plans</div>
            </div>
          </div>
        )}

        {/* Plain Text Security Notice */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed text-[11px] opacity-90">
            <strong>Security Notice:</strong> Exported files contain personal reflections in unencrypted plain text. Please store them securely on your local device.
          </p>
        </div>

        {/* Download Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleDownloadJson}
            disabled={isLoading || !exportData}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors group shadow-subtle"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <FileJson className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-charis-text block">
                  Machine-Readable JSON Archive
                </span>
                <span className="text-[11px] text-charis-text-muted">
                  Full structured backup of all data tables and settings
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-charis-text-muted group-hover:text-charis-primary transition-colors" />
          </button>

          <button
            onClick={handleDownloadMarkdown}
            disabled={isLoading || !exportData}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors group shadow-subtle"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-700 dark:text-indigo-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-charis-text block">
                  Formatted Markdown Archive
                </span>
                <span className="text-[11px] text-charis-text-muted">
                  Clean, human-readable journal entries with SOAP notes
                </span>
              </div>
            </div>
            <Download className="w-4 h-4 text-charis-text-muted group-hover:text-charis-primary transition-colors" />
          </button>
        </div>

        {/* Success Feedback */}
        {downloadSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 justify-center pt-1 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        <div className="pt-2 border-t border-charis-border/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-charis-border text-xs font-medium text-charis-text hover:bg-charis-border-subtle transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
