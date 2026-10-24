import React from 'react'
import { Home, BookOpen, Heart, BookMarked, Calendar } from 'lucide-react'
import { NavDestination } from '../../types'

interface BottomNavigationProps {
  currentTab: NavDestination
  onSelectTab: (tab: NavDestination) => void
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab
}) => {
  const tabs: { id: NavDestination; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bible', label: 'Bible', icon: BookOpen },
    { id: 'prayer', label: 'Prayer', icon: Heart },
    { id: 'study', label: 'Study', icon: BookMarked },
    { id: 'plans', label: 'Plans', icon: Calendar }
  ]

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-charis-surface border-t border-charis-border pb-safe shadow-lg transition-colors"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-all duration-150 ${
                isActive 
                  ? 'text-charis-primary font-semibold' 
                  : 'text-charis-text-muted hover:text-charis-text'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-1 rounded-xl transition-transform ${isActive ? 'bg-[#D95740]/10 dark:bg-[#E06D58]/15 scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[11px] tracking-tight mt-0.5">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
