/**
 * Notification & Reminder Preferences Section
 * Manages daily prayer/reading alarms, quiet period suppression,
 * and browser notification permissions.
 * Per docs/PRD.md FR-09 and docs/SECURITY.md.
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Moon, 
  Clock, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { 
  notificationManager, 
  NotificationPermissionState 
} from '../../lib/notifications/notification-manager';
import { ReminderPreferences } from '../../types/settings';

interface NotificationPreferencesSectionProps {
  preferences: ReminderPreferences;
  onUpdate: (prefs: ReminderPreferences) => void;
  timeZone?: string;
}

export const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  preferences,
  onUpdate,
}) => {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    notificationManager.getPermission()
  );

  const handleRequestPermission = async () => {
    const res = await notificationManager.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      onUpdate({ ...preferences, enabled: true });
    }
  };

  const handleToggleEnabled = (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      handleRequestPermission();
    } else {
      onUpdate({ ...preferences, enabled });
    }
  };

  return (
    <div className="space-y-4">
      {/* Master Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-charis-primary" />
            <span>Reminders & Notifications</span>
          </label>
          <span className="text-[11px] text-charis-text-muted mt-0.5 block">
            Gentle contemplative prompts for prayer and Scripture
          </span>
        </div>

        <button
          onClick={() => handleToggleEnabled(!preferences.enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            preferences.enabled ? 'bg-charis-primary' : 'bg-charis-border'
          }`}
          aria-label="Toggle notifications"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Permission Status Notice */}
      {permission === 'denied' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-semibold block mb-0.5">Notifications Blocked by Browser</span>
            <p className="opacity-90 leading-relaxed text-[11px]">
              To receive daily rhythm notifications, please allow permissions in your browser address bar or site settings.
            </p>
          </div>
        </div>
      )}

      {permission === 'default' && preferences.enabled && (
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border flex items-center justify-between">
          <span className="text-xs text-charis-text">Browser permission required</span>
          <button
            onClick={handleRequestPermission}
            className="px-3 py-1 text-xs rounded-lg bg-charis-primary text-white font-medium hover:bg-charis-primary/90 transition-colors"
          >
            Grant Permission
          </button>
        </div>
      )}

      {/* Preferences Options (Only visible when enabled) */}
      {preferences.enabled && (
        <div className="space-y-3 pt-2">
          {/* Daily Reading & Prayer Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-charis-surface border border-charis-border">
              <label className="text-[11px] font-medium text-charis-text-muted flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-charis-primary" />
                <span>Daily Scripture Reading</span>
              </label>
              <input
                type="time"
                value={preferences.dailyReadingTime || '20:00'}
                onChange={(e) =>
                  onUpdate({ ...preferences, dailyReadingTime: e.target.value })
                }
                className="w-full bg-charis-border-subtle/50 border border-charis-border rounded-lg px-2.5 py-1 text-xs text-charis-text focus:outline-none focus:border-charis-primary"
              />
            </div>

            <div className="p-3 rounded-xl bg-charis-surface border border-charis-border">
              <label className="text-[11px] font-medium text-charis-text-muted flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-charis-primary" />
                <span>Daily Prayer Stillness</span>
              </label>
              <input
                type="time"
                value={preferences.dailyPrayerTime || '08:00'}
                onChange={(e) =>
                  onUpdate({ ...preferences, dailyPrayerTime: e.target.value })
                }
                className="w-full bg-charis-border-subtle/50 border border-charis-border rounded-lg px-2.5 py-1 text-xs text-charis-text focus:outline-none focus:border-charis-primary"
              />
            </div>
          </div>

          {/* Quiet Period */}
          <div className="p-3.5 rounded-xl bg-charis-surface border border-charis-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-charis-primary" />
                <span className="text-xs font-semibold text-charis-text">Quiet Hours</span>
              </div>
              <button
                onClick={() =>
                  onUpdate({
                    ...preferences,
                    quietHours: {
                      ...preferences.quietHours,
                      enabled: !preferences.quietHours.enabled,
                    },
                  })
                }
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  preferences.quietHours.enabled ? 'bg-charis-primary' : 'bg-charis-border'
                }`}
                aria-label="Toggle quiet hours"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    preferences.quietHours.enabled ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-[11px] text-charis-text-muted">
              Suppresses all reminders and alerts during sleep or contemplative silence.
            </p>

            {preferences.quietHours.enabled && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1">
                  <span className="text-[10px] text-charis-text-muted block mb-1">From</span>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      onUpdate({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, start: e.target.value },
                      })
                    }
                    className="w-full bg-charis-border-subtle/50 border border-charis-border rounded-lg px-2 py-1 text-xs text-charis-text focus:outline-none focus:border-charis-primary"
                  />
                </div>
                <span className="text-xs text-charis-text-muted pt-4">to</span>
                <div className="flex-1">
                  <span className="text-[10px] text-charis-text-muted block mb-1">Until</span>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      onUpdate({
                        ...preferences,
                        quietHours: { ...preferences.quietHours, end: e.target.value },
                      })
                    }
                    className="w-full bg-charis-border-subtle/50 border border-charis-border rounded-lg px-2 py-1 text-xs text-charis-text focus:outline-none focus:border-charis-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-xl bg-charis-border-subtle/30 border border-charis-border/60 flex items-center gap-2 text-xs text-charis-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px]">
              <strong>Strict Privacy:</strong> Notification payloads never include personal prayers, confessionals, or notes.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
