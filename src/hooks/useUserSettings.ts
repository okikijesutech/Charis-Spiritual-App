/**
 * User Settings & Dashboard Layout Hook
 * Provides reactive access to local settings, widget visibility, reordering,
 * and reminder preferences.
 */

import { useState, useEffect, useCallback } from 'react';
import { settingsRepository } from '../lib/db/settings-repository';
import { 
  LocalUserSettings, 
  DashboardLayout, 
  DashboardWidgetConfig, 
  DashboardWidgetId,
  ReminderPreferences,
  DEFAULT_WIDGET_CONFIGS,
  DEFAULT_REMINDER_PREFERENCES 
} from '../types/settings';

export function useUserSettings(userId: string) {
  const [settings, setSettings] = useState<LocalUserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await settingsRepository.getSettings(userId);
      setSettings(data);
    } catch (err) {
      console.error('[useUserSettings] Error loading settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateLayout = useCallback(
    async (newWidgets: DashboardWidgetConfig[]) => {
      const updated = await settingsRepository.updateDashboardLayout(userId, {
        widgets: newWidgets,
      });
      setSettings(updated);
    },
    [userId]
  );

  const toggleWidgetVisibility = useCallback(
    async (widgetId: DashboardWidgetId) => {
      if (!settings) return;
      const currentWidgets = [...settings.dashboardLayout.widgets];
      const targetIndex = currentWidgets.findIndex((w) => w.id === widgetId);
      if (targetIndex === -1) return;

      currentWidgets[targetIndex] = {
        ...currentWidgets[targetIndex],
        visible: !currentWidgets[targetIndex].visible,
      };

      await updateLayout(currentWidgets);
    },
    [settings, updateLayout]
  );

  const moveWidget = useCallback(
    async (widgetId: DashboardWidgetId, direction: 'up' | 'down') => {
      if (!settings) return;
      const currentWidgets = [...settings.dashboardLayout.widgets];
      const index = currentWidgets.findIndex((w) => w.id === widgetId);
      if (index === -1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentWidgets.length) return;

      const temp = currentWidgets[index];
      currentWidgets[index] = currentWidgets[targetIndex];
      currentWidgets[targetIndex] = temp;

      await updateLayout(currentWidgets);
    },
    [settings, updateLayout]
  );

  const resetLayout = useCallback(async () => {
    const updated = await settingsRepository.resetDashboardLayout(userId);
    setSettings(updated);
  }, [userId]);

  const updateReminders = useCallback(
    async (prefs: ReminderPreferences) => {
      const updated = await settingsRepository.updateReminderPreferences(userId, prefs);
      setSettings(updated);
    },
    [userId]
  );

  const layout: DashboardLayout = settings?.dashboardLayout || {
    widgets: DEFAULT_WIDGET_CONFIGS,
  };

  const reminderPreferences: ReminderPreferences = settings?.reminderPreferences || {
    ...DEFAULT_REMINDER_PREFERENCES,
  };

  return {
    settings,
    layout,
    reminderPreferences,
    isLoading,
    updateLayout,
    toggleWidgetVisibility,
    moveWidget,
    resetLayout,
    updateReminders,
    refreshSettings: loadSettings,
  };
}
