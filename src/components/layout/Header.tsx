import React, { useState } from 'react'
import { 
  Sun, 
  Moon, 
  Laptop, 
  Wifi, 
  WifiOff, 
  Settings, 
  Menu, 
  X,
  Home,
  BookOpen,
  Heart,
  BookMarked,
  Calendar
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { ThemePreference, NavDestination } from '../../types'

interface HeaderProps {
  currentTab?: NavDestination
  onSelectTab?: (tab: NavDestination) => void
  isOffline: boolean
  onToggleOffline: () => void
  onOpenSettings: () => void
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isOffline,
  onToggleOffline,
  onOpenSettings
}) => {
  const { theme, setTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems: { id: NavDestination; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bible', label: 'Bible Reader', icon: BookOpen },
    { id: 'prayer', label: 'Prayer Journal', icon: Heart },
    { id: 'study', label: 'Study Journal', icon: BookMarked },
    { id: 'plans', label: 'Reading Plans', icon: Calendar }
  ]

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

  const handleSelectPage = (tab: NavDestination) => {
    if (onSelectTab) {
      onSelectTab(tab)
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 shrink-0 z-30 w-full bg-charis-surface/90 backdrop-blur-md border-b border-charis-border/70 transition-colors pt-safe">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          {/* Mobile brand title & quick menu trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onSelectTab && onSelectTab('home')}
              className="w-9 h-9 rounded-xl bg-charis-terracotta/10 dark:bg-charis-terracotta-dark/15 border border-charis-terracotta/20 flex items-center justify-center text-charis-primary font-serif font-bold text-lg shadow-subtle hover:scale-105 transition-transform shrink-0"
              title="Return to Home"
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
            {/* Mobile Menu Button (allows navigating from top if bottom bar is hidden) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-charis-text min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
              title="Open Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-charis-primary" />
              ) : (
                <Menu className="w-4 h-4 text-charis-text" />
              )}
            </button>

            {/* Offline/Sync state pill */}
            <button
              onClick={onToggleOffline}
              title={isOffline ? "Currently simulating offline mode. Click to restore online." : "Online. All records synced. Click to simulate offline mode."}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isOffline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 animate-pulse text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] sm:text-xs font-medium">Offline</span>
                  <span className="text-[10px] opacity-75 hidden sm:inline">(Saved locally)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] sm:text-xs font-medium">Online</span>
                  <span className="text-[10px] opacity-75 hidden sm:inline">Synced</span>
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
              title="Settings & Account"
              aria-label="Settings and Preferences"
            >
              <Settings className="w-4 h-4 text-charis-text-muted hover:text-charis-text" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-charis-border bg-charis-surface p-3 space-y-1 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            <div className="text-[11px] font-semibold text-charis-text-muted uppercase px-3 py-1">
              Navigate Pages
            </div>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectPage(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-charis-primary/10 text-charis-primary font-semibold'
                      : 'text-charis-text hover:bg-charis-border-subtle'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto text-xs text-charis-primary font-normal">Active</span>}
                </button>
              )
            })}
          </div>
        )}
      </header>
    </>
  )
}
