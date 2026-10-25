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
    <div className="h-full w-full flex bg-charis-bg text-charis-text overflow-hidden transition-colors">
      {/* Desktop Navigation Rail */}
      <DesktopSidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onQuickAction={onQuickAction}
      />

      {/* Main App Flex Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header - Always docked at top */}
        <Header
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          isOffline={isOffline}
          onToggleOffline={onToggleOffline}
          onOpenSettings={onOpenSettings}
        />

        {/* Scrollable Content Area - ONLY this element scrolls! */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Permanently docked at the bottom */}
        <BottomNavigation
          currentTab={currentTab}
          onSelectTab={onSelectTab}
        />
      </div>
    </div>
  )
}
