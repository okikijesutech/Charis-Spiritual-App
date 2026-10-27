import React from 'react'
import { 
  BookOpen, 
  Heart, 
  BookMarked, 
  Timer, 
  Sparkles,
  Bookmark,
  CalendarCheck
} from 'lucide-react'
import { 
  mockUserProfile, 
  mockFastingSchedule
} from '../data/mockData'
import { RecentActivitySection } from '../components/home/RecentActivitySection'
import { FeaturedReadingSection } from '../components/home/FeaturedReadingSection'
import { useAuth } from '../context/AuthContext';
import { NavDestination } from '../types'
import { Badge } from '../components/ui/Badge'

interface HomeViewProps {
  onNavigate: (tab: NavDestination) => void
  onOpenQuickAction: () => void
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenQuickAction
}) => {
  const { profile, user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Greeting & Date Banner */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charis-border/60">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-charis-primary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today’s Rhythm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charis-text mt-1">
            Peace be with you, {(profile?.display_name || user?.user_metadata?.full_name || mockUserProfile.name).split(' ')[0]}
          </h2>
          <p className="text-xs sm:text-sm text-charis-text-muted mt-1 font-sans">
            Saturday, October 24 · {mockUserProfile.timeZone}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="sage" className="px-3 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#78866B] animate-pulse mr-1" />
            4 spiritual rhythms active
          </Badge>
        </div>
      </section>

      {/* 2. Priority Featured Reading Card */}
      <FeaturedReadingSection
        userId={activeUserId}
        onNavigate={onNavigate}
      />

      {/* 3. Quick Actions Grid */}
      <section aria-label="Quick Actions">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('bible')}
            className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-charis-surface border border-charis-border hover:border-charis-primary/50 hover:bg-charis-border-subtle/40 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 mb-2 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-charis-text">Read Bible</span>
            <span className="text-[11px] text-charis-text-muted mt-0.5">Psalm 23 & John</span>
          </button>

          <button
            onClick={() => onNavigate('prayer')}
            className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-charis-surface border border-charis-border hover:border-charis-primary/50 hover:bg-charis-border-subtle/40 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-400 mb-2 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-charis-text">New Prayer</span>
            <span className="text-[11px] text-charis-text-muted mt-0.5">Prompt or blank</span>
          </button>

          <button
            onClick={() => onNavigate('study')}
            className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-charis-surface border border-charis-border hover:border-charis-primary/50 hover:bg-charis-border-subtle/40 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 mb-2 group-hover:scale-105 transition-transform">
              <BookMarked className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-charis-text">Bible Study</span>
            <span className="text-[11px] text-charis-text-muted mt-0.5">Inductive / SOAP</span>
          </button>

          <button
            onClick={onOpenQuickAction}
            className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-charis-surface border border-charis-border hover:border-charis-primary/50 hover:bg-charis-border-subtle/40 transition-all text-left group"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-charis-text">Log Activity</span>
            <span className="text-[11px] text-charis-text-muted mt-0.5">Prayer, study, fast</span>
          </button>
        </div>
      </section>

      {/* 4. Modular Dashboard Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget A: Scripture of the Day Meditation */}
        <div className="rounded-2xl bg-charis-surface border border-charis-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-charis-primary uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                Verse Reflection
              </span>
              <span className="text-xs text-charis-text-muted font-serif">Psalm 23:2–3</span>
            </div>
            <blockquote className="font-serif italic text-base sm:text-lg text-charis-text leading-relaxed pl-3 border-l-2 border-[#D95740] dark:border-[#E06D58] my-3">
              “He makes me lie down in green pastures; He leads me beside quiet waters. He restores my soul.”
            </blockquote>
          </div>

          <div className="pt-4 border-t border-charis-border/60 flex items-center justify-between">
            <span className="text-xs text-charis-text-muted">Berean Standard Bible</span>
            <button 
              onClick={() => onNavigate('bible')}
              className="text-xs font-medium text-charis-primary hover:underline"
            >
              Read full chapter →
            </button>
          </div>
        </div>

        {/* Widget B: Fasting Rhythm Timer */}
        <div className="rounded-2xl bg-charis-surface border border-charis-border p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#78866B] dark:text-[#8E9E80]" />
                <span className="text-xs font-semibold text-[#78866B] dark:text-[#8E9E80] uppercase tracking-wider">
                  Fasting Rhythm
                </span>
              </div>
              <Badge variant="sage" size="sm">Active</Badge>
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-semibold text-charis-text">{mockFastingSchedule.type}</h4>
              <p className="text-xs text-charis-text-muted mt-0.5 leading-relaxed">
                {mockFastingSchedule.note}
              </p>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-charis-text">{mockFastingSchedule.elapsedHours} hrs elapsed</span>
                <span className="text-charis-text-muted">Target: {mockFastingSchedule.targetHours} hrs</span>
              </div>
              <div className="w-full h-2 rounded-full bg-charis-border overflow-hidden">
                <div 
                  className="h-full bg-[#78866B] dark:bg-[#8E9E80] rounded-full transition-all duration-500"
                  style={{ width: `${(mockFastingSchedule.elapsedHours / mockFastingSchedule.targetHours) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-charis-border/60 flex items-center justify-between text-xs text-charis-text-muted">
            <span>Started {mockFastingSchedule.startTime}</span>
            <span className="text-[#78866B] dark:text-[#8E9E80] font-medium">1.5 hrs remaining</span>
          </div>
        </div>
      </section>

      {/* 5. Gentle Activity Summary (Grace over Streaks) */}
      <RecentActivitySection
        userId={user?.id || 'demo-user-id'}
        onOpenQuickAction={onOpenQuickAction}
      />
    </div>
  )
}
