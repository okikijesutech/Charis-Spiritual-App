/**
 * User Settings, Dashboard Configuration & Notification Types
 * Per docs/PRD.md FR-02, FR-09 and docs/DATA-MODEL.md
 */

export type DashboardWidgetId =
  | 'featured_reading'
  | 'verse_reflection'
  | 'fasting_timer'
  | 'recent_activity'
  | 'quick_actions';

export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  label: string;
  description: string;
  visible: boolean;
}

export interface DashboardLayout {
  widgets: DashboardWidgetConfig[];
}

export interface QuietHours {
  enabled: boolean;
  start: string; // e.g. "22:00" (24-hour HH:mm)
  end: string;   // e.g. "07:00" (24-hour HH:mm)
}

export type SoundTheme = 'bowl' | 'harp' | 'cathedral';

export interface ScheduledReminder {
  id: string;
  type: 'prayer' | 'reading';
  label: string;
  time: string; // "HH:mm"
  soundTheme: SoundTheme;
  enabled: boolean;
}

export interface ReminderPreferences {
  enabled: boolean;
  dailyPrayerTime?: string;      // "08:00"
  dailyReadingTime?: string;     // "20:00"
  reminders?: ScheduledReminder[];
  quietHours: QuietHours;
  fastingMilestones: boolean;
  pushSubscription?: Record<string, unknown> | null;
  soundEnabled?: boolean;
}

export interface LocalUserSettings {
  userId: string;
  theme: 'system' | 'light' | 'dark';
  timezone: string;
  locale: string;
  featuredReadingPlanId?: string | null;
  dashboardLayout: DashboardLayout;
  reminderPreferences: ReminderPreferences;
  updatedAt: string;
}

export const DEFAULT_WIDGET_CONFIGS: DashboardWidgetConfig[] = [
  {
    id: 'featured_reading',
    label: 'Featured Reading Journey',
    description: 'Active chapter progress and gentle next reading prompt',
    visible: true,
  },
  {
    id: 'quick_actions',
    label: 'Quick Rhythms',
    description: 'One-tap shortcuts to read, pray, study, or log activity',
    visible: true,
  },
  {
    id: 'verse_reflection',
    label: 'Scripture Meditation',
    description: 'Quiet verse reflection of the day with chapter deep-dive',
    visible: true,
  },
  {
    id: 'fasting_timer',
    label: 'Contemplative Fasting Rhythm',
    description: 'Silent fasting timer with hourly milestone reflections',
    visible: true,
  },
  {
    id: 'recent_activity',
    label: 'Recent Spiritual Rhythm',
    description: 'Grace-over-streaks neutral summary of recent devotionals',
    visible: true,
  },
];

export const DEFAULT_SCHEDULED_REMINDERS: ScheduledReminder[] = [
  {
    id: 'default-prayer-morning',
    type: 'prayer',
    label: 'Morning Prayer',
    time: '08:00',
    soundTheme: 'bowl',
    enabled: true,
  },
  {
    id: 'default-reading-evening',
    type: 'reading',
    label: 'Evening Scripture',
    time: '20:00',
    soundTheme: 'harp',
    enabled: true,
  },
];

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  enabled: false,
  dailyPrayerTime: '08:00',
  dailyReadingTime: '20:00',
  reminders: DEFAULT_SCHEDULED_REMINDERS,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '07:00',
  },
  fastingMilestones: true,
  pushSubscription: null,
  soundEnabled: true,
};
