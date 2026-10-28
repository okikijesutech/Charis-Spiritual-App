import React, { useState, useEffect } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import { mockUserProfile } from '../data/mockData';
import { RecentActivitySection } from '../components/home/RecentActivitySection';
import { FeaturedReadingSection } from '../components/home/FeaturedReadingSection';
import { FastingTimerWidget } from '../components/home/FastingTimerWidget';
import { VerseReflectionWidget } from '../components/home/VerseReflectionWidget';
import { QuickActionsSection } from '../components/home/QuickActionsSection';
import { DashboardCustomizerModal } from '../components/dashboard/DashboardCustomizerModal';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../context/AuthContext';
import { NavDestination } from '../types';
import { Badge } from '../components/ui/Badge';
import { activityRepository } from '../lib/db/activity-repository';

interface HomeViewProps {
  onNavigate: (tab: NavDestination) => void;
  onOpenQuickAction: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenQuickAction,
}) => {
  const { profile, user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);

  const {
    layout,
    toggleWidgetVisibility,
    moveWidget,
    resetLayout,
  } = useUserSettings(activeUserId);

  const [todayReflectionCount, setTodayReflectionCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    activityRepository.list(activeUserId).then((items) => {
      if (isMounted) {
        const todayStr = new Date().toDateString();
        const count = items.filter((a) => new Date(a.startedAt).toDateString() === todayStr).length;
        setTodayReflectionCount(count);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'featured_reading':
        return (
          <FeaturedReadingSection
            key="featured_reading"
            userId={activeUserId}
            onNavigate={onNavigate}
          />
        );
      case 'quick_actions':
        return (
          <QuickActionsSection
            key="quick_actions"
            onNavigate={onNavigate}
            onOpenQuickAction={onOpenQuickAction}
          />
        );
      case 'verse_reflection':
        return (
          <div key="verse_reflection" className="w-full">
            <VerseReflectionWidget onNavigate={onNavigate} />
          </div>
        );
      case 'fasting_timer':
        return (
          <div key="fasting_timer" className="w-full">
            <FastingTimerWidget userId={activeUserId} />
          </div>
        );
      case 'recent_activity':
        return (
          <RecentActivitySection
            key="recent_activity"
            userId={activeUserId}
            onOpenQuickAction={onOpenQuickAction}
          />
        );
      default:
        return null;
    }
  };

  const visibleWidgets = layout.widgets.filter((w) => w.visible);

  const formattedToday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
  const displayTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || mockUserProfile.timeZone || 'UTC';

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
            {formattedToday} · {displayTimeZone}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="sage" className="px-3 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#78866B] animate-pulse mr-1" />
            {todayReflectionCount === null
              ? 'Checking rhythm...'
              : todayReflectionCount === 0
              ? 'No reflections logged today'
              : `${todayReflectionCount} ${todayReflectionCount === 1 ? 'reflection' : 'reflections'} logged today`}
          </Badge>

          <button
            onClick={() => setIsCustomizing(true)}
            aria-label="Customize dashboard cards"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text-muted hover:text-charis-text transition-colors shadow-subtle"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-charis-primary" />
            <span>Customize</span>
          </button>
        </div>
      </section>

      {/* 2. Dynamically Ordered Dashboard Cards */}
      <div className="space-y-6">
        {visibleWidgets.map((widget) => renderWidget(widget.id))}
      </div>

      {/* 3. Dashboard Customizer Modal */}
      <DashboardCustomizerModal
        isOpen={isCustomizing}
        onClose={() => setIsCustomizing(false)}
        widgets={layout.widgets}
        onToggleVisibility={toggleWidgetVisibility}
        onMoveWidget={moveWidget}
        onReset={resetLayout}
      />
    </div>
  );
};
