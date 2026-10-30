/**
 * In-App Contemplative Reminder Alert Banner
 * Non-intrusive banner displayed when a reminder triggers while the app is active.
 * Provides 1-tap navigation directly into Bible or Prayer.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Heart, X } from 'lucide-react';
import { NavDestination } from '../../types';

export interface ActiveReminderAlert {
  id: string;
  type: 'prayer' | 'reading';
  title: string;
  description: string;
}

interface ReminderAlertBannerProps {
  alert: ActiveReminderAlert | null;
  onDismiss: () => void;
  onNavigate: (tab: NavDestination) => void;
}

export const ReminderAlertBanner: React.FC<ReminderAlertBannerProps> = ({
  alert,
  onDismiss,
  onNavigate,
}) => {
  if (!alert || typeof document === 'undefined') return null;

  const isPrayer = alert.type === 'prayer';
  const Icon = isPrayer ? Heart : BookOpen;
  const targetTab: NavDestination = isPrayer ? 'prayer' : 'bible';
  const actionLabel = isPrayer ? 'Begin Prayer' : 'Open Scripture';

  return createPortal(
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-view-transition"
    >
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-charis-surface/95 backdrop-blur-md border border-charis-primary/30 shadow-card text-charis-text">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-charis-primary/10 text-charis-primary shrink-0">
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-charis-text font-serif truncate">
              {alert.title}
            </h4>
            <p className="text-[11px] text-charis-text-muted truncate">
              {alert.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              onNavigate(targetTab);
              onDismiss();
            }}
            className="px-2.5 py-1 text-xs rounded-lg bg-charis-primary text-white font-medium hover:bg-charis-primary-hover transition-colors shadow-subtle"
          >
            {actionLabel}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle transition-colors"
            title="Dismiss reminder"
            aria-label="Dismiss reminder"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
