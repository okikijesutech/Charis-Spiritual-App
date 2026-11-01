/**
 * PWA Installation & Update Management Section
 * Provides 1-tap installation, standalone status verification,
 * and manual update checks against Vercel/CDN.
 */

import React from 'react';
import { Download, RefreshCw, CheckCircle2, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAAppSection: React.FC = () => {
  const {
    isInstalled,
    isInstallable,
    installPWA,
    checkForUpdate,
    isCheckingUpdate,
    updateStatus,
  } = usePWAInstall();

  return (
    <div className="p-3.5 rounded-xl border border-charis-border bg-charis-surface space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-charis-primary/10 text-charis-primary">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-charis-text block">
              Application & Updates
            </span>
            <span className="text-[11px] text-charis-text-muted block">
              {isInstalled
                ? 'Installed as standalone Progressive Web App'
                : 'Install Charis on your device for instant offline access'}
            </span>
          </div>
        </div>

        {isInstalled && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Installed</span>
          </span>
        )}
      </div>

      {isInstalled ? (
        <div className="pt-2 border-t border-charis-border/50 flex items-center justify-between gap-3 text-xs">
          <span className="text-[11px] text-charis-text-muted">
            {updateStatus || 'Automatic updates active via Service Worker'}
          </span>

          <button
            type="button"
            onClick={checkForUpdate}
            disabled={isCheckingUpdate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charis-border-subtle hover:bg-charis-border text-charis-text text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-charis-primary ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span>{isCheckingUpdate ? 'Checking...' : 'Check for Updates'}</span>
          </button>
        </div>
      ) : (
        <div className="pt-2 border-t border-charis-border/50 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] text-charis-text-muted leading-relaxed">
              Install Charis directly on your home screen or desktop for fullscreen immersion, 0ms offline launch, and reliable reminders.
            </p>

            {isInstallable && (
              <button
                type="button"
                onClick={installPWA}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-charis-primary hover:bg-charis-primary-hover text-white text-xs font-medium shadow-subtle transition-all cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}
          </div>

          {!isInstallable && (
            <div className="p-2.5 rounded-lg bg-charis-border-subtle/50 text-[11px] text-charis-text-muted space-y-1">
              <span className="font-semibold text-charis-text flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-charis-primary" />
                <span>How to Install Manually:</span>
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                <li><strong>Android Chrome:</strong> Tap the <strong>⋮</strong> (top-right menu) &rarr; <em>Install app</em> or <em>Add to Home screen</em>.</li>
                <li><strong>iPhone / iPad Safari:</strong> Tap the <strong>Share</strong> icon &rarr; <em>Add to Home Screen</em>.</li>
                <li><strong>Desktop (Chrome/Edge):</strong> Click the install icon in the browser address bar.</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
