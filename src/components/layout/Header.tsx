/**
 * Refined Editorial Header (Option A: Unified Account & Quiet Sync)
 * Features calm editorial typography, quiet-by-default sync telemetry,
 * and unified Account / Appearance / Settings navigation.
 */

import React from 'react'
import { WifiOff, RefreshCw, User, CheckCircle2 } from 'lucide-react'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'
import { NavDestination } from '../../types'
import { CharisLogo } from '../brand/CharisLogo'

interface HeaderProps {
  currentTab?: NavDestination
  onSelectTab?: (tab: NavDestination) => void
  isOffline: boolean
  onToggleOffline: () => void
  onOpenSettings: () => void
  onOpenAuth: () => void
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isOffline,
  onToggleOffline,
  onOpenAuth
}) => {
  const { user, profile } = useAuth()
  const { isOnline: networkOnline, isSyncing, statusText, triggerSync, pendingCount } = useSync()

  const userDisplayName = user
    ? profile?.display_name || user?.user_metadata?.full_name || user.email?.split('@')[0] || 'Account'
    : null

  const effectiveOffline = isOffline || !networkOnline

  return (
    <header className="sticky top-0 shrink-0 z-30 w-full bg-charis-surface/90 backdrop-blur-md border-b border-charis-border/60 transition-colors pt-safe">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-15 flex items-center justify-between">
        {/* Brand title & Editorial Subtitle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => onSelectTab && onSelectTab('home')}
            className="flex items-center hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary rounded-xl p-0.5"
            title="Return to Home"
            aria-label="Return to Home"
          >
            <CharisLogo variant="wordmark" size="md" />
          </button>

          {currentTab && currentTab !== 'home' && (
            <div className="flex items-center gap-1.5 select-none animate-view-transition">
              <span className="text-charis-border-subtle font-serif text-sm">/</span>
              <span className="font-serif italic text-xs sm:text-sm text-charis-text-muted capitalize">
                {currentTab}
              </span>
            </div>
          )}
        </div>

        {/* Quiet & Unified Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quiet-by-Default Sync Indicator */}
          {effectiveOffline ? (
            <button
              onClick={onToggleOffline}
              title="Offline mode. All records saved securely on device. Tap to reconnect."
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 transition-all cursor-pointer"
            >
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px]">Offline</span>
            </button>
          ) : isSyncing ? (
            <div
              title="Syncing records with cloud..."
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-sky-600 dark:text-sky-400"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span className="text-[11px] hidden sm:inline">Syncing</span>
            </div>
          ) : pendingCount > 0 ? (
            <button
              onClick={triggerSync}
              title={`${pendingCount} item(s) pending sync. Click to upload.`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-sky-600 hover:bg-sky-500/10 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{pendingCount}</span>
            </button>
          ) : (
            <button
              onClick={triggerSync}
              title={`Cloud Synced (${statusText}). Click to refresh.`}
              className="p-1.5 rounded-full text-emerald-600/70 hover:text-emerald-700 dark:text-emerald-400/70 hover:bg-emerald-500/10 transition-colors"
              aria-label="Cloud sync status: Active"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Unified Account & Settings Pill (Option A) */}
          <button
            onClick={onOpenAuth}
            className={`inline-flex items-center gap-2 p-1 pr-2.5 rounded-full border transition-all shadow-subtle cursor-pointer ${
              user && userDisplayName
                ? 'border-charis-border hover:border-charis-primary/40 bg-charis-surface hover:bg-charis-border-subtle'
                : 'border-charis-primary/30 bg-charis-primary/5 hover:bg-charis-primary/10 text-charis-primary px-3 py-1.5'
            }`}
            title={user && userDisplayName ? `Account & Settings: ${userDisplayName}` : 'Sign In or Create Account'}
            aria-label={user && userDisplayName ? `Account & Settings: ${userDisplayName}` : 'Sign In'}
          >
            {user && userDisplayName ? (
              <>
                <div className="w-6 h-6 rounded-full bg-charis-primary/15 text-charis-primary border border-charis-primary/20 flex items-center justify-center font-serif font-bold text-xs shrink-0">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-charis-text truncate max-w-[90px]">
                  {userDisplayName.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-charis-primary" />
                <span className="text-xs font-medium text-charis-primary">Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
