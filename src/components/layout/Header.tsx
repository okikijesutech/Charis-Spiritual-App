import React from 'react'
import { 
  Sun, 
  Moon, 
  Laptop, 
  Wifi, 
  WifiOff, 
  Settings, 
  RefreshCw, 
  User 
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useSync } from '../../context/SyncContext'
import { useAuth } from '../../context/AuthContext'
import { mockUserProfile } from '../../data/mockData'
import { ThemePreference, NavDestination } from '../../types'

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
  onOpenSettings,
  onOpenAuth
}) => {
  const { theme, setTheme } = useTheme()
  const { user, profile } = useAuth()
  const { isOnline: networkOnline, isSyncing, statusText, triggerSync, pendingCount } = useSync()

  const displayName = profile?.display_name || user?.user_metadata?.full_name || (user ? user.email?.split('@')[0] : mockUserProfile.name)

  const effectiveOffline = isOffline || !networkOnline

  const cycleTheme = () => {
    const sequence: ThemePreference[] = ['light', 'dark', 'system']
    const nextIdx = (sequence.indexOf(theme) + 1) % sequence.length
    setTheme(sequence[nextIdx])
  }

  const themeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-600" />
    if (theme === 'dark') return <Moon className="w-4 h-4 text-indigo-400" />
    return <Laptop className="w-4 h-4 text-charis-text-muted" />
  }

  return (
    <header className="sticky top-0 shrink-0 z-30 w-full bg-charis-surface/90 backdrop-blur-md border-b border-charis-border/70 transition-colors pt-safe">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand title & return to Home */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => onSelectTab && onSelectTab('home')}
            className="w-9 h-9 rounded-xl bg-charis-terracotta/10 dark:bg-charis-terracotta-dark/15 border border-charis-terracotta/20 flex items-center justify-center text-charis-primary font-serif font-bold text-lg shadow-subtle hover:scale-105 transition-transform shrink-0"
            title="Return to Home"
            aria-label="Return to Home"
          >
            Χ
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-serif text-lg font-bold tracking-tight text-charis-text leading-tight">
                Charis
              </h1>
              {currentTab && (
                <span className="md:hidden text-[10px] sm:text-[11px] font-sans text-charis-primary bg-charis-primary/10 px-2 py-0.5 rounded-full capitalize">
                  {currentTab}
                </span>
              )}
            </div>
            <p className="text-[11px] font-sans text-charis-text-muted hidden sm:block">
              Spiritual Discipline & Scripture
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Offline/Sync state pill */}
          <button
            onClick={() => {
              if (effectiveOffline) {
                onToggleOffline()
              } else {
                triggerSync()
              }
            }}
            title={
              effectiveOffline
                ? "Offline mode. All records are saved securely on this device."
                : isSyncing
                ? "Syncing records with cloud..."
                : `Online. ${statusText}. Click to sync.`
            }
            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              effectiveOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                : isSyncing
                ? 'bg-sky-500/10 border-sky-500/30 text-sky-700 dark:text-sky-400'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {effectiveOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">Offline</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">(Saved locally)</span>
              </>
            ) : isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 animate-spin shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">Syncing</span>
                {pendingCount > 0 && (
                  <span className="text-[10px] opacity-75 hidden sm:inline">({pendingCount})</span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium">Online</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">
                  ({pendingCount > 0 ? `Sync pending (${pendingCount})` : statusText})
                </span>
              </>
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-charis-text flex items-center justify-center min-w-[36px] min-h-[36px]"
            title={`Current theme: ${theme}. Click to switch.`}
            aria-label={`Toggle theme: currently ${theme}`}
          >
            {themeIcon()}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-charis-text min-w-[36px] min-h-[36px] flex items-center justify-center"
            title="Settings & Preferences"
            aria-label="Settings and Preferences"
          >
            <Settings className="w-4 h-4 text-charis-text-muted hover:text-charis-text" />
          </button>

          {/* Direct Account / Sign-In Quick Trigger */}
          <button
            onClick={onOpenAuth}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-charis-primary/30 bg-charis-primary/5 hover:bg-charis-primary/10 transition-colors text-charis-text min-w-[36px] min-h-[36px] flex items-center gap-1.5 shadow-subtle"
            title={user ? `Signed in: ${displayName}` : "Sign In or Create Account"}
            aria-label={user ? "Manage Account" : "Sign In or Create Account"}
          >
            <div className="w-5 h-5 rounded-lg bg-charis-primary/15 text-charis-primary flex items-center justify-center font-serif font-bold text-xs shrink-0">
              {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-charis-primary truncate max-w-[85px]">
              {user ? displayName.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
