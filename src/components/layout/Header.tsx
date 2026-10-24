import React from 'react'
import { Sun, Moon, Laptop, Wifi, WifiOff, Settings } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { ThemePreference } from '../../types'

interface HeaderProps {
  isOffline: boolean
  onToggleOffline: () => void
  onOpenSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isOffline,
  onToggleOffline,
  onOpenSettings
}) => {
  const { theme, setTheme } = useTheme()

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
    <header className="sticky top-0 z-30 w-full bg-charis-surface/90 backdrop-blur-md border-b border-charis-border/70 transition-colors pt-safe">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Mobile brand title (Desktop has sidebar brand) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-charis-terracotta/10 dark:bg-charis-terracotta-dark/15 border border-charis-terracotta/20 flex items-center justify-center text-charis-primary font-serif font-bold text-lg shadow-subtle">
            Χ
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-charis-text leading-tight">
              Charis
            </h1>
            <p className="text-[11px] font-sans text-charis-text-muted hidden sm:block">
              Spiritual Discipline & Scripture
            </p>
          </div>
        </div>

        {/* Header Controls: Offline state test toggle, Theme Switcher, Settings */}
        <div className="flex items-center gap-2">
          {/* Offline/Sync state pill button (interactive to preview offline UX) */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? "Currently simulating offline mode. Click to restore online." : "Online. All records synced. Click to simulate offline mode."}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isOffline
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden xs:inline">Offline</span>
                <span className="text-[10px] opacity-75">(Saved locally)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Online</span>
                <span className="text-[10px] opacity-75">Synced</span>
              </>
            )}
          </button>

          {/* Theme switcher button */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-charis-text flex items-center justify-center min-w-[38px] min-h-[38px]"
            title={`Current theme: ${theme}. Click to switch.`}
            aria-label={`Toggle theme: currently ${theme}`}
          >
            {themeIcon()}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-charis-text min-w-[38px] min-h-[38px] flex items-center justify-center"
            title="Settings & Account"
            aria-label="Settings and Preferences"
          >
            <Settings className="w-4 h-4 text-charis-text-muted hover:text-charis-text" />
          </button>
        </div>
      </div>
    </header>
  )
}
