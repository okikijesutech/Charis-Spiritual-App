import React, { useRef, useEffect } from 'react'
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
  onOpenAuth: () => void
  onQuickAction: () => void
  isReaderChromeVisible?: boolean
  onSetReaderChromeVisible?: (visible: boolean) => void
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  isOffline,
  onToggleOffline,
  onOpenSettings,
  onOpenAuth,
  onQuickAction,
  isReaderChromeVisible = true,
  onSetReaderChromeVisible,
  children
}) => {
  const mainRef = useRef<HTMLElement>(null)

  // Scroll detection in Bible reading mode: scroll down hides chrome, scroll up shows
  useEffect(() => {
    if (currentTab !== 'bible' || !mainRef.current || !onSetReaderChromeVisible) return

    let lastScrollY = mainRef.current.scrollTop
    let ticking = false

    const handleScroll = () => {
      if (!ticking && mainRef.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = mainRef.current?.scrollTop || 0
          const diff = currentScrollY - lastScrollY

          if (diff > 45 && currentScrollY > 80) {
            onSetReaderChromeVisible(false)
          } else if (diff < -30) {
            onSetReaderChromeVisible(true)
          }

          lastScrollY = currentScrollY
          ticking = false
        })
        ticking = true
      }
    }

    const mainEl = mainRef.current
    mainEl.addEventListener('scroll', handleScroll, { passive: true })
    return () => mainEl.removeEventListener('scroll', handleScroll)
  }, [currentTab, onSetReaderChromeVisible])

  return (
    <div className="h-full w-full flex bg-charis-bg text-charis-text overflow-hidden transition-colors">
      {/* Desktop Navigation Rail */}
      <DesktopSidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        onQuickAction={onQuickAction}
        onOpenAuth={onOpenAuth}
      />

      {/* Main App Flex Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header - Slides up on mobile during immersive Bible reading */}
        <div className={`transition-all duration-300 ease-in-out shrink-0 ${
          isReaderChromeVisible
            ? 'translate-y-0 max-h-16 opacity-100'
            : '-translate-y-full -mt-16 opacity-0 pointer-events-none md:translate-y-0 md:mt-0 md:opacity-100 md:pointer-events-auto md:max-h-16'
        }`}>
          <Header
            currentTab={currentTab}
            onSelectTab={onSelectTab}
            isOffline={isOffline}
            onToggleOffline={onToggleOffline}
            onOpenSettings={onOpenSettings}
            onOpenAuth={onOpenAuth}
          />
        </div>

        {/* Scrollable Content Area - ONLY this element scrolls! */}
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Slides down on mobile during immersive Bible reading */}
        <div className={`md:hidden transition-all duration-300 ease-in-out shrink-0 ${
          isReaderChromeVisible
            ? 'translate-y-0 max-h-24 opacity-100 pointer-events-auto'
            : 'translate-y-full -mb-24 opacity-0 pointer-events-none'
        }`}>
          <BottomNavigation
            currentTab={currentTab}
            onSelectTab={onSelectTab}
          />
        </div>
      </div>
    </div>
  )
}
