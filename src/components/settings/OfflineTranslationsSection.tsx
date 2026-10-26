import React, { useState, useEffect } from 'react'
import { CheckCircle2, Download, Globe } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { SUPPORTED_TRANSLATIONS } from '../../lib/bible/canon'
import { bibleDownloadManager } from '../../lib/bible/download-manager'

export const OfflineTranslationsSection: React.FC = () => {
  const [installedTranslations, setInstalledTranslations] = useState<string[]>(['web'])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)

  useEffect(() => {
    bibleDownloadManager.getInstalledTranslations().then((list) => {
      if (list.length > 0) setInstalledTranslations(list)
    })
  }, [])

  const handleDownload = async (tid: string) => {
    setDownloadingId(tid)
    setDownloadProgress(10)
    try {
      await bibleDownloadManager.downloadTranslation(tid, (state) => {
        setDownloadProgress(state.progressPercent)
      })
      const updated = await bibleDownloadManager.getInstalledTranslations()
      setInstalledTranslations(updated)
    } finally {
      setDownloadingId(null)
      setDownloadProgress(0)
    }
  }

  const handleRemoveDownload = async (tid: string) => {
    await bibleDownloadManager.deleteDownload(tid)
    const updated = await bibleDownloadManager.getInstalledTranslations()
    setInstalledTranslations(updated)
  }

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted block mb-2">
        Bible Translations & Offline Storage
      </label>
      <div className="space-y-2 border border-charis-border rounded-xl p-3 bg-charis-surface">
        {SUPPORTED_TRANSLATIONS.map((t) => {
          const isInstalled = installedTranslations.includes(t.id)
          const isDownloading = downloadingId === t.id

          return (
            <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-charis-border/40 last:border-0">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  {isInstalled ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
                      <Badge variant="sage" size="sm">Installed</Badge>
                      <button
                        onClick={() => handleRemoveDownload(t.id)}
                        className="text-[11px] text-charis-text-muted hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDownload(t.id)}
                      disabled={isDownloading}
                      className="px-2 py-0.5 text-[11px] rounded-lg border border-charis-border hover:bg-charis-border-subtle text-charis-text font-medium"
                    >
                      {isDownloading ? `${downloadProgress}%` : 'Download'}
                    </button>
                  )
                ) : (
                  <Badge variant="outline" size="sm" className="text-[10px]">Cloud API</Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-charis-text-muted mt-1.5">
        Public domain translations (WEB, BSB, KJV) download fully for offline reading. Copyrighted translations (NLT, ESV, NIV) stream via authorized cloud APIs.
      </p>
    </div>
  )
}
