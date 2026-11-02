/**
 * Bible Translation Selector & Device Offline Storage Modal
 * Contextual translation switching with per-device offline management.
 * Conforms to docs/BIBLE-TRANSLATIONS-RIGHTS.md and Jakob's Law.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Check, 
  Download, 
  CheckCircle2, 
  Globe, 
  HardDrive, 
  Trash2, 
  Info
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { SUPPORTED_TRANSLATIONS } from '../../lib/bible/canon';
import { bibleDownloadManager } from '../../lib/bible/download-manager';

interface TranslationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTranslation: string;
  onSelectTranslation: (translationId: string) => void;
}

export const TranslationPickerModal: React.FC<TranslationPickerModalProps> = ({
  isOpen,
  onClose,
  selectedTranslation,
  onSelectTranslation,
}) => {
  const [installedTranslations, setInstalledTranslations] = useState<string[]>(['web']);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [deviceStorageBytes, setDeviceStorageBytes] = useState<number>(0);

  const refreshInstalled = useCallback(async () => {
    const summary = await bibleDownloadManager.getDeviceStorageSummary();
    setInstalledTranslations(summary.installedIds);
    setDeviceStorageBytes(summary.totalBytes);
  }, []);

  useEffect(() => {
    if (isOpen) {
      refreshInstalled();
    }
  }, [isOpen, refreshInstalled]);

  const handleDownload = async (e: React.MouseEvent, tid: string) => {
    e.stopPropagation();
    setDownloadingId(tid);
    setDownloadProgress(15);
    try {
      await bibleDownloadManager.downloadTranslation(tid, (state) => {
        setDownloadProgress(state.progressPercent);
      });
      await refreshInstalled();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  const handleRemove = async (e: React.MouseEvent, tid: string) => {
    e.stopPropagation();
    await bibleDownloadManager.deleteDownload(tid);
    await refreshInstalled();
  };

  const offlineCapable = SUPPORTED_TRANSLATIONS.filter((t) => t.offlineDownloadable);
  const cloudStreaming = SUPPORTED_TRANSLATIONS.filter((t) => !t.offlineDownloadable);

  const storageUsedMB = (deviceStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bible Translations"
      description="Choose a translation. Downloaded versions work completely offline on this device."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-sm">
        {/* Device-Specific Storage Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-charis-border-subtle/50 border border-charis-border/70 text-xs">
          <HardDrive className="w-4 h-4 text-charis-primary shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-charis-text">
                Device Storage: {storageUsedMB} MB
              </span>
              <span className="text-[10px] text-charis-text-muted">
                {installedTranslations.length} saved offline
              </span>
            </div>
            <p className="text-[11px] text-charis-text-muted mt-0.5 leading-relaxed">
              Offline translations are saved locally to this device’s browser storage and work without internet. They never consume cloud sync quota.
            </p>
          </div>
        </div>

        {/* 1. Offline Capable Translations (Public Domain) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted">
              Offline Capable (Public Domain)
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Free & Open
            </span>
          </div>

          <div className="space-y-2">
            {offlineCapable.map((t) => {
              const isSelected = selectedTranslation.toLowerCase() === t.id.toLowerCase();
              const isInstalled = installedTranslations.includes(t.id.toLowerCase());
              const isDownloading = downloadingId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTranslation(t.id);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-charis-primary/5 border-charis-primary/40 ring-1 ring-charis-primary/30'
                      : 'bg-charis-surface border-charis-border hover:bg-charis-border-subtle/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected
                        ? 'bg-charis-primary border-charis-primary text-white'
                        : 'border-charis-border bg-charis-surface text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-charis-text">
                          {t.shortName}
                        </span>
                        <span className="text-xs text-charis-text-muted truncate">
                          — {t.name}
                        </span>
                        {isInstalled ? (
                          <Badge variant="sage" size="sm" className="gap-1 text-[10px] py-0 px-1.5">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>On this device</span>
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5">
                            Online
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-charis-text-muted mt-0.5 line-clamp-1">
                        {t.attribution}
                      </p>

                      {isDownloading && (
                        <div className="w-full max-w-xs bg-charis-border h-1.5 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-charis-primary h-full transition-all duration-150"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Device Offline Action Button */}
                  <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-auto pl-8 sm:pl-0">
                    {isInstalled ? (
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, t.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-charis-text-muted hover:text-rose-600 px-2 py-1 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
                        title="Remove from this device's storage"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, t.id)}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-lg bg-charis-surface border border-charis-border hover:bg-charis-border-subtle text-charis-text font-medium shadow-subtle transition-all cursor-pointer"
                        title="Download for offline reading on this device"
                      >
                        <Download className="w-3 h-3 text-charis-primary" />
                        <span>{isDownloading ? `${downloadProgress}%` : 'Download'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Modern Authorized Translations (Cloud Streaming) */}
        <div className="pt-2 border-t border-charis-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted">
              Modern Authorized Translations
            </span>
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
              Cloud Streaming
            </span>
          </div>

          <div className="space-y-2">
            {cloudStreaming.map((t) => {
              const isSelected = selectedTranslation.toLowerCase() === t.id.toLowerCase();

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTranslation(t.id);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                    isSelected
                      ? 'bg-charis-primary/5 border-charis-primary/40 ring-1 ring-charis-primary/30'
                      : 'bg-charis-surface border-charis-border hover:bg-charis-border-subtle/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                      isSelected
                        ? 'bg-charis-primary border-charis-primary text-white'
                        : 'border-charis-border bg-charis-surface text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-charis-text">
                          {t.shortName}
                        </span>
                        <span className="text-xs text-charis-text-muted truncate">
                          — {t.name}
                        </span>
                        <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5 gap-1">
                          <Globe className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                          <span>Cloud API</span>
                        </Badge>
                      </div>
                      <p className="text-[11px] text-charis-text-muted mt-0.5 line-clamp-1">
                        {t.attribution}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-charis-text-muted/80 leading-relaxed pt-1">
          <Info className="w-3 h-3 inline mr-1 text-charis-primary" />
          Public domain translations download fully for offline immersion. Proprietary translations stream on demand per publisher digital rights.
        </p>
      </div>
    </Modal>
  );
};
