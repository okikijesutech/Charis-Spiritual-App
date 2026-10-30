/**
 * Reminder Scheduler Hook
 * Actively evaluates daily rhythm schedules (Prayer & Scripture reading)
 * against local clock time, dispatches Web Audio chime alarms, triggers HTML5 notifications,
 * and surfaces in-app alert banners.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReminderPreferences } from '../types/settings';
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
    async (type: 'prayer' | 'reading', title: string, description: string) => {
      // 1. Play sound alarm if enabled
      if (preferences.soundEnabled !== false) {
        soundAlarmService.playContemplativeSequence();
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

  // Test button trigger: immediately previews sound and notification
  const triggerTestReminder = useCallback(async () => {
    soundAlarmService.playContemplativeSequence();

    await notificationManager.sendContemplativeReminder(
      {
        title: 'Charis Contemplative Chime',
        body: 'Your daily spiritual rhythm reminder and sound chime are working gracefully.',
        tag: 'charis-test-rhythm',
      },
      { ...preferences, enabled: true, quietHours: { ...preferences.quietHours, enabled: false } },
      timezone
    );

    setActiveAlert({
      id: `test-${Date.now()}`,
      type: 'prayer',
      title: 'Contemplative Chime Preview',
      description: 'Your daily reminder and sound alarm are active and working.',
    });
  }, [preferences, timezone]);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  useEffect(() => {
    if (!preferences.enabled) return;

    const checkSchedule = () => {
      const now = new Date();
      // Format current time as HH:mm in user's timezone or local
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone || undefined,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const currentHHMM = formatter.format(now);

      // Prevent triggering multiple times within the same minute
      if (checkedMinuteRef.current === currentHHMM) return;
      checkedMinuteRef.current = currentHHMM;

      const todayKey = now.toISOString().slice(0, 10);

      // 1. Daily Prayer Stillness Check
      if (preferences.dailyPrayerTime === currentHHMM) {
        const key = `charis_prayer_alarm_${todayKey}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          triggerAlert(
            'prayer',
            'Daily Prayer Stillness',
            'Step away from the noise for a quiet moment of prayer and listening.'
          );
        }
      }

      // 2. Daily Scripture Reading Check
      if (preferences.dailyReadingTime === currentHHMM) {
        const key = `charis_reading_alarm_${todayKey}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          triggerAlert(
            'reading',
            'Daily Scripture Reading',
            'A contemplative chapter awaits your reflection today.'
          );
        }
      }
    };

    // Check immediately and then every 20 seconds
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
