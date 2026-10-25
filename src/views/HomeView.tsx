import React, { useState } from 'react'
import { 
  BookOpen, 
  Heart, 
  BookMarked, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Timer, 
  Sparkles,
  Bookmark,
  CalendarCheck
} from 'lucide-react'
import { 
  mockUserProfile, 
  mockReadingPlans, 
  mockFastingSchedule, 
  mockActivityLogs 
} from '../data/mockData'
import { useAuth } from '../context/AuthContext';
import { NavDestination } from '../types'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

interface HomeViewProps {
  onNavigate: (tab: NavDestination) => void
  onOpenQuickAction: () => void
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenQuickAction
}) => {
  const { profile, user } = useAuth();
  const featuredPlan = mockReadingPlans[0]
  const [todayAssignment, setTodayAssignment] = useState(featuredPlan.assignments[1])

  const toggleAssignmentCompletion = () => {
    setTodayAssignment(prev => ({
      ...prev,
      isCompleted: !prev.isCompleted
    }))
  }

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
      <section aria-labelledby="featured-reading-title">
        <div className="relative overflow-hidden rounded-2xl bg-charis-surface border border-charis-border p-6 shadow-card hover:border-charis-primary/40 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#D95740]/10 dark:bg-[#E06D58]/15 text-charis-primary">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-semibold text-charis-primary uppercase tracking-wider">
                  Featured Plan · {featuredPlan.title}
                </span>
                <h3 id="featured-reading-title" className="text-lg font-serif font-bold text-charis-text">
                  {todayAssignment.passage}
                </h3>
              </div>
            </div>

            <Badge variant={todayAssignment.isCompleted ? 'sage' : 'neutral'}>
              {todayAssignment.dateLabel}
            </Badge>
          </div>

          <p className="text-sm text-charis-text-muted font-sans mb-5 leading-relaxed">
            Jesus walks on the water and calms the storm, paired with the shepherd’s stillness in Psalm 23.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-charis-border/60">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAssignmentCompletion}
                className="inline-flex items-center gap-2 text-xs font-medium text-charis-text hover:text-charis-primary transition-colors py-1.5 px-3 rounded-lg border border-charis-border bg-charis-border-subtle/50"
              >
                {todayAssignment.isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4 text-charis-text-muted" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
              <span className="text-xs text-charis-text-muted">
                Day 14 of {featuredPlan.totalDays}
              </span>
            </div>

            <Button
              variant="terracotta-soft"
              size="sm"
              onClick={() => onNavigate('bible')}
              className="gap-1.5"
            >
              <span>Open in Bible</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </section>

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
      <section className="rounded-2xl bg-charis-surface border border-charis-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-charis-text">
              Recent Spiritual Rhythm
            </h3>
            <p className="text-xs text-charis-text-muted mt-0.5">
              Reflective record of prayer, reading, and study sessions
            </p>
          </div>
          <Badge variant="neutral" size="sm">
            {mockActivityLogs.length} entries recorded
          </Badge>
        </div>

        <div className="divide-y divide-charis-border/60">
          {mockActivityLogs.slice(0, 3).map((activity) => (
            <div key={activity.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-charis-border-subtle flex items-center justify-center text-charis-primary text-xs font-medium">
                  {activity.type === 'reading' && <BookOpen className="w-4 h-4" />}
                  {activity.type === 'prayer' && <Heart className="w-4 h-4" />}
                  {activity.type === 'study' && <BookMarked className="w-4 h-4" />}
                  {activity.type === 'worship' && <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-charis-text">{activity.label}</h4>
                  <p className="text-xs text-charis-text-muted">{activity.note}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-charis-text font-medium">
                  {activity.durationMinutes} min
                </span>
                <div className="text-[11px] text-charis-text-muted">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
