/**
 * Quick Actions Section
 * Provides one-tap shortcuts to read Scripture, enter prayer, open inductive study,
 * or log a contemplative discipline.
 * Per docs/PRD.md FR-02.
 */

import React from 'react';
import { BookOpen, Heart, BookMarked, CalendarCheck } from 'lucide-react';
import { NavDestination } from '../../types';

interface QuickActionsSectionProps {
  onNavigate: (tab: NavDestination) => void;
  onOpenQuickAction: () => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onNavigate,
  onOpenQuickAction,
}) => {
  return (
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
  );
};
