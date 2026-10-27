/**
 * IndexedDB Settings Repository
 * Manages local user settings, dashboard layout, and reminder preferences.
 * Synchronizes with Supabase user_settings when online.
 * Per docs/PRD.md FR-02, FR-09 and docs/OFFLINE-SYNC.md.
 */

import { getDB } from './indexeddb';
import { supabase } from '../supabase/client';
import { 
  LocalUserSettings, 
  DashboardLayout, 
  ReminderPreferences, 
  DEFAULT_WIDGET_CONFIGS, 
  DEFAULT_REMINDER_PREFERENCES 
} from '../../types/settings';
import type { Json } from '../../types/tables/user-tables';

export class SettingsRepository {
  /**
   * Generates default initial settings for a user.
   */
  getDefaultSettings(userId: string): LocalUserSettings {
    const tz = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    return {
      userId,
      theme: 'system',
      timezone: tz || 'UTC',
      locale: 'en',
      featuredReadingPlanId: null,
      dashboardLayout: {
        widgets: DEFAULT_WIDGET_CONFIGS.map((w) => ({ ...w })),
      },
      reminderPreferences: {
        ...DEFAULT_REMINDER_PREFERENCES,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieve settings for a user from IndexedDB.
   * If none exist, initializes and returns default settings.
   */
  async getSettings(userId: string): Promise<LocalUserSettings> {
    const db = await getDB();
    const existing = await db.get('user_settings', userId);

    if (existing) {
      // Ensure all current default widgets exist in case new ones were added
      const existingWidgetIds = new Set(existing.dashboardLayout.widgets.map((w) => w.id));
      const missingWidgets = DEFAULT_WIDGET_CONFIGS.filter((w) => !existingWidgetIds.has(w.id));
      
      if (missingWidgets.length > 0) {
        existing.dashboardLayout.widgets = [
          ...existing.dashboardLayout.widgets,
          ...missingWidgets.map((w) => ({ ...w })),
        ];
        await db.put('user_settings', existing);
      }
      return existing;
    }

    const initial = this.getDefaultSettings(userId);
    await db.put('user_settings', initial);
    return initial;
  }

  /**
   * Save settings locally and push to Supabase if connected.
   */
  async saveSettings(settings: LocalUserSettings): Promise<void> {
    const db = await getDB();
    const updated: LocalUserSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    await db.put('user_settings', updated);

    // Online cloud sync (non-blocking)
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      try {
        await supabase.from('user_settings').upsert({
          user_id: updated.userId,
          theme: updated.theme,
          timezone: updated.timezone,
          locale: updated.locale,
          featured_reading_plan_id: updated.featuredReadingPlanId ?? null,
          dashboard_layout: updated.dashboardLayout as unknown as Json,
          reminder_preferences: updated.reminderPreferences as unknown as Json,
          updated_at: updated.updatedAt,
        });
      } catch (err) {
        console.warn('[Charis Settings] Cloud sync deferred:', err);
      }
    }
  }

  /**
   * Update the dashboard card ordering and visibility.
   */
  async updateDashboardLayout(userId: string, layout: DashboardLayout): Promise<LocalUserSettings> {
    const current = await this.getSettings(userId);
    const updated: LocalUserSettings = {
      ...current,
      dashboardLayout: layout,
    };
    await this.saveSettings(updated);
    return updated;
  }

  /**
   * Reset the dashboard layout to standard default cards and order.
   */
  async resetDashboardLayout(userId: string): Promise<LocalUserSettings> {
    const current = await this.getSettings(userId);
    const updated: LocalUserSettings = {
      ...current,
      dashboardLayout: {
        widgets: DEFAULT_WIDGET_CONFIGS.map((w) => ({ ...w })),
      },
    };
    await this.saveSettings(updated);
    return updated;
  }

  /**
   * Update reminder and notification preferences.
   */
  async updateReminderPreferences(
    userId: string,
    prefs: ReminderPreferences
  ): Promise<LocalUserSettings> {
    const current = await this.getSettings(userId);
    const updated: LocalUserSettings = {
      ...current,
      reminderPreferences: prefs,
    };
    await this.saveSettings(updated);
    return updated;
  }

  /**
   * Clear local user settings (used during user sign out / cache clear).
   */
  async clearUserData(userId: string): Promise<void> {
    const db = await getDB();
    await db.delete('user_settings', userId);
  }
}

export const settingsRepository = new SettingsRepository();
