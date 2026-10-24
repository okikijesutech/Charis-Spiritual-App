import React from 'react'
import { Header } from './Header'
import { DesktopSidebar } from './DesktopSidebar'
import { BottomNavigation } from './BottomNavigation'
import { NavDestination } from '../../types'

interface AppShellProps {
  currentTab: NavDestination
  onSelectTab: (tab: NavDestination) => void
  isOffline: boolean
  onToggleOffline: () => void
  onOpenSettings: () => void
  onQuickAction: () => void
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  isOffline,
  onToggleOffline,
  onOpenSettings,
  onQuickAction,
  children
}) => {
  return (
    <div className="min-h-screen min-h-[100dvh] flex bg-charis-bg text-charis-text transition-colors">
      {/* Desktop Navigation Rail */}
      <DesktopSidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onQuickAction={onQuickAction}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isOffline={isOffline}
          onToggleOffline={onToggleOffline}
          onOpenSettings={onOpenSettings}
        />

        <main className="flex-1 overflow-y-auto pb-24 md:pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation
          currentTab={currentTab}
          onSelectTab={onSelectTab}
        />
      </div>
    </div>
  )
}
