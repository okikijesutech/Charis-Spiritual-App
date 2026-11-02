import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Download, Globe, HardDrive, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { SUPPORTED_TRANSLATIONS } from '../../lib/bible/canon';
import { bibleDownloadManager } from '../../lib/bible/download-manager';

export const OfflineTranslationsSection: React.FC = () => {
  const [installedTranslations, setInstalledTranslations] = useState<string[]>(['web']);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [totalStorageBytes, setTotalStorageBytes] = useState<number>(0);

  const refreshState = useCallback(async () => {
    const summary = await bibleDownloadManager.getDeviceStorageSummary();
    setInstalledTranslations(summary.installedIds);
    setTotalStorageBytes(summary.totalBytes);
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const handleDownload = async (tid: string) => {
    setDownloadingId(tid);
    setDownloadProgress(15);
    try {
      await bibleDownloadManager.downloadTranslation(tid, (state) => {
        setDownloadProgress(state.progressPercent);
      });
      await refreshState();
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  const handleRemoveDownload = async (tid: string) => {
    await bibleDownloadManager.deleteDownload(tid);
    await refreshState();
  };

  const storageUsedMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted">
          Bible Translations (This Device)
        </label>
        <span className="text-[11px] text-charis-text-muted flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-charis-primary" />
          <span>{storageUsedMB} MB used locally</span>
        </span>
      </div>

      <div className="space-y-2 border border-charis-border rounded-xl p-3 bg-charis-surface">
        {SUPPORTED_TRANSLATIONS.map((t) => {
          const isInstalled = installedTranslations.includes(t.id);
          const isDownloading = downloadingId === t.id;

          return (
            <div key={t.id} className="flex items-center justify-between py-2 border-b border-charis-border/40 last:border-0 gap-2">
              <div className="min-w-0 pr-2 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isInstalled ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : t.offlineDownloadable ? (
                    <Download className="w-3.5 h-3.5 text-charis-text-muted shrink-0" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-charis-text truncate">
                    {t.shortName} — {t.name}
                  </span>
                </div>
                {isDownloading && (
                  <div className="w-32 bg-charis-border h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-charis-primary h-full transition-all duration-150"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {t.offlineDownloadable ? (
                  isInstalled ? (
                    <>
                      <Badge variant="sage" size="sm" className="text-[10px] py-0 px-1.5">
                        On this device
                      </Badge>
                      <button
                        onClick={() => handleRemoveDownload(t.id)}
                        className="text-[11px] text-charis-text-muted hover:text-rose-600 inline-flex items-center gap-0.5"
                        title="Remove from this device's storage"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDownload(t.id)}
                      disabled={isDownloading}
                      className="px-2.5 py-1 text-[11px] rounded-lg border border-charis-border hover:bg-charis-border-subtle text-charis-text font-medium cursor-pointer"
                    >
                      {isDownloading ? `${downloadProgress}%` : 'Download'}
                    </button>
                  )
                ) : (
                  <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                    Cloud API
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-charis-text-muted mt-2 leading-relaxed">
        Offline Scripture is saved directly in this device’s browser storage (IndexedDB) for offline reading. It never syncs across devices or consumes cloud quota.
      </p>
    </div>
  );
};
