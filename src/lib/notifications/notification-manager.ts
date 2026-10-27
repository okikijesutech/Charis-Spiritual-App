/**
 * Notification Manager & Contemplative Dispatcher
 * Manages browser notification permissions, quiet period suppression,
 * and strictly generic contemplative payloads (no private journal data).
 * Per docs/PRD.md FR-09, docs/SECURITY.md and docs/DATA-MODEL.md.
 */

import { QuietHours, ReminderPreferences } from '../../types/settings';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export class NotificationManager {
  /**
   * Check if the browser supports standard HTML5 notifications.
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Check if web push & service workers are supported.
   */
  isPushSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  /**
   * Current notification permission status.
   */
  getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionState;
  }

  /**
   * Request browser notification permission.
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const result = await Notification.requestPermission();
      return result as NotificationPermissionState;
    } catch (err) {
      console.warn('[NotificationManager] Permission request failed:', err);
      return 'denied';
    }
  }

  /**
   * Evaluate whether the given moment falls within user-configured quiet hours.
   * Gracefully handles quiet windows spanning across midnight (e.g., 22:00 -> 07:00).
   */
  isWithinQuietHours(
    quietHours: QuietHours,
    date: Date = new Date(),
    timeZone?: string
  ): boolean {
    if (!quietHours.enabled || !quietHours.start || !quietHours.end) {
      return false;
    }

    try {
      // Format current time in user's timezone as HH:mm
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: timeZone || undefined,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const parts = formatter.format(date).split(':');
      const currentMinutes = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

      const [startH, startM] = quietHours.start.split(':').map((s) => parseInt(s, 10));
      const [endH, endM] = quietHours.end.split(':').map((s) => parseInt(s, 10));

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes > endMinutes) {
        // Window spans across midnight (e.g. 22:00 to 07:00)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        // Window is within the same calendar day (e.g. 13:00 to 15:00)
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
    } catch {
      return false;
    }
  }

  /**
   * Dispatch a gentle, strictly generic contemplative reminder.
   * Suppressed if quiet hours are currently active.
   * Guaranteed never to include private journal, prayer, or study entries.
   */
  async sendContemplativeReminder(
    options: {
      title: string;
      body: string;
      tag?: string;
    },
    preferences: ReminderPreferences,
    timeZone?: string
  ): Promise<boolean> {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return false;
    }

    if (!preferences.enabled) {
      return false;
    }

    if (this.isWithinQuietHours(preferences.quietHours, new Date(), timeZone)) {
      console.log('[NotificationManager] Notification suppressed by quiet hours.');
      return false;
    }

    // Security Gate: Ensure no potential leaks of journal data
    const safeTitle = options.title.slice(0, 80);
    const safeBody = options.body.slice(0, 200);

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(safeTitle, {
            body: safeBody,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: options.tag || 'charis-contemplative-rhythm',
          });
          return true;
        }
      }

      new Notification(safeTitle, {
        body: safeBody,
        icon: '/icon-192.png',
        tag: options.tag || 'charis-contemplative-rhythm',
      });
      return true;
    } catch (err) {
      console.warn('[NotificationManager] Failed to trigger notification:', err);
      return false;
    }
  }
}

export const notificationManager = new NotificationManager();
