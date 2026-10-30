/**
 * Reminder Scheduler Hook
 * Actively evaluates multiple daily spiritual rhythm schedules (Prayer & Scripture reading)
 * against local clock time, dispatches customized Web Audio chime alarms per activity,
 * triggers HTML5 notifications, and surfaces in-app alert banners.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReminderPreferences, ScheduledReminder, SoundTheme, DEFAULT_SCHEDULED_REMINDERS } from '../types/settings';
import { notificationManager } from '../lib/notifications/notification-manager';
import { soundAlarmService } from '../lib/audio/sound-alarm';
import { ActiveReminderAlert } from '../components/notifications/ReminderAlertBanner';

export function useReminderScheduler(
  preferences: ReminderPreferences,
  timezone?: string
) {
  const [activeAlert, setActiveAlert] = useState<ActiveReminderAlert | null>(null);
  const checkedMinuteRef = useRef<string>('');

  const triggerAlert = useCallback(
    async (
      type: 'prayer' | 'reading',
      title: string,
      description: string,
      soundTheme: SoundTheme = 'bowl'
    ) => {
      // 1. Play activity-specific sound alarm if sound is enabled
      if (preferences.soundEnabled !== false) {
        soundAlarmService.playTheme(soundTheme);
      }

      // 2. Dispatch system notification (generic safe text)
      await notificationManager.sendContemplativeReminder(
        {
          title,
          body: description,
          tag: `charis-${type}-rhythm`,
        },
        preferences,
        timezone
      );

      // 3. Surface in-app banner alert
      setActiveAlert({
        id: `${type}-${Date.now()}`,
        type,
        title,
        description,
      });
    },
    [preferences, timezone]
  );

  // Test trigger: previews sound and notification for a specific theme or activity
  const triggerTestReminder = useCallback(
    async (theme: SoundTheme = 'bowl', label = 'Contemplative Reminder') => {
      soundAlarmService.playTheme(theme);

      await notificationManager.sendContemplativeReminder(
        {
          title: `Charis Chime: ${label}`,
          body: 'Your scheduled rhythm reminder and sound chime are working gracefully.',
          tag: 'charis-test-rhythm',
        },
        { ...preferences, enabled: true, quietHours: { ...preferences.quietHours, enabled: false } },
        timezone
      );

      setActiveAlert({
        id: `test-${Date.now()}`,
        type: theme === 'harp' ? 'reading' : 'prayer',
        title: label,
        description: 'Chime preview active. Your reminders are armed and ready.',
      });
    },
    [preferences, timezone]
  );

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  useEffect(() => {
    if (!preferences.enabled) return;

    const checkSchedule = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone || undefined,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const currentHHMM = formatter.format(now);

      if (checkedMinuteRef.current === currentHHMM) return;
      checkedMinuteRef.current = currentHHMM;

      const todayKey = now.toISOString().slice(0, 10);
      const reminderList: ScheduledReminder[] = preferences.reminders && preferences.reminders.length > 0
        ? preferences.reminders
        : DEFAULT_SCHEDULED_REMINDERS;

      for (const item of reminderList) {
        if (!item.enabled) continue;
        if (item.time === currentHHMM) {
          const alarmKey = `charis_alarm_${item.id}_${todayKey}`;
          if (!localStorage.getItem(alarmKey)) {
            localStorage.setItem(alarmKey, 'true');
            const desc = item.type === 'prayer'
              ? 'Step away from the noise for a quiet moment of prayer and listening.'
              : 'A contemplative passage awaits your reading and reflection.';
            triggerAlert(item.type, item.label, desc, item.soundTheme);
          }
        }
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 20000);
    return () => clearInterval(interval);
  }, [preferences, timezone, triggerAlert]);

  return {
    activeAlert,
    dismissAlert,
    triggerTestReminder,
  };
}
