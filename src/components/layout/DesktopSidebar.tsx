import React from 'react'
import { Home, BookOpen, Heart, BookMarked, Calendar, PlusCircle, Sparkles } from 'lucide-react'
import { NavDestination } from '../../types'

interface DesktopSidebarProps {
  currentTab: NavDestination
  onSelectTab: (tab: NavDestination) => void
  onQuickAction: () => void
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onSelectTab,
  onQuickAction
}) => {
  const navItems: { id: NavDestination; label: string; icon: React.FC<{ className?: string }>; description: string }[] = [
    { id: 'home', label: 'Home', icon: Home, description: 'Daily rhythm & overview' },
    { id: 'bible', label: 'Bible Reader', icon: BookOpen, description: 'Scripture & annotations' },
    { id: 'prayer', label: 'Prayer Journal', icon: Heart, description: 'Private reflections & petitions' },
    { id: 'study', label: 'Study Journal', icon: BookMarked, description: 'Inductive study & SOAP' },
    { id: 'plans', label: 'Reading Plans', icon: Calendar, description: 'Structured schedules' }
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-charis-surface border-r border-charis-border h-screen sticky top-0 transition-colors select-none">
      {/* Brand area */}
      <div className="p-6 border-b border-charis-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-charis-terracotta/10 dark:bg-charis-terracotta-dark/15 border border-charis-terracotta/20 flex items-center justify-center text-charis-primary font-serif font-bold text-xl shadow-subtle">
            Χ
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl tracking-tight text-charis-text">
              Charis
            </h2>
            <p className="text-xs text-charis-text-muted font-sans">
              Spiritual Discipline PWA
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-4 pb-2">
        <button
          onClick={onQuickAction}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#D95740] dark:bg-[#E06D58] hover:bg-[#C24B36] text-white font-medium text-sm transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Reflection</span>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all text-left group ${
                isActive
                  ? 'bg-[#D95740]/10 dark:bg-[#E06D58]/15 text-[#D95740] dark:text-[#E8806D] font-medium'
                  : 'text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-[#D95740]/15 dark:bg-[#E06D58]/25 text-[#D95740] dark:text-[#E8806D]' 
                  : 'text-charis-text-muted group-hover:text-charis-text'
              }`}>
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-none">{item.label}</div>
                <div className="text-[11px] text-charis-text-muted mt-1 truncate">
                  {item.description}
                </div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Footer / Grace note */}
      <div className="p-4 m-3 rounded-2xl bg-charis-border-subtle/70 border border-charis-border/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-charis-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Grace over streaks</span>
        </div>
        <p className="text-[11px] text-charis-text-muted mt-1.5 leading-relaxed">
          Spiritual rhythm is an invitation to fellowship, not a score to maintain.
        </p>
      </div>
    </aside>
  )
}
