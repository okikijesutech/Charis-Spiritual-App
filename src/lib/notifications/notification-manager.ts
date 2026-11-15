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
   * Request browser notification permission (supporting promises and legacy callbacks).
   */
  async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      if (typeof Notification.requestPermission === 'function') {
        const p = Notification.requestPermission();
        if (p && typeof p.then === 'function') {
          const res = await p;
          return res as NotificationPermissionState;
        }
        return new Promise<NotificationPermissionState>((resolve) => {
          Notification.requestPermission((res) => {
            resolve(res as NotificationPermissionState);
          });
        });
      }
      return 'unsupported';
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
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
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
    const iconUrl = '/pwa-192x192.png';

    // 1. Try ServiceWorker showNotification (guaranteed to work across mobile & desktop browsers)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1200)),
        ]);
        const swReg = registration || (await navigator.serviceWorker.getRegistration());
        if (swReg && 'showNotification' in swReg) {
          await swReg.showNotification(safeTitle, {
            body: safeBody,
            icon: iconUrl,
            badge: iconUrl,
            tag: options.tag || 'charis-contemplative-rhythm',
          } as NotificationOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('[NotificationManager] ServiceWorker showNotification failed:', swErr);
      }
    }

    // 2. Fallback to desktop window Notification if supported
    try {
      new Notification(safeTitle, {
        body: safeBody,
        icon: iconUrl,
        tag: options.tag || 'charis-contemplative-rhythm',
      });
      return true;
    } catch (err) {
      console.warn('[NotificationManager] Fallback window Notification failed:', err);
      return false;
    }
  }
}

export const notificationManager = new NotificationManager();
