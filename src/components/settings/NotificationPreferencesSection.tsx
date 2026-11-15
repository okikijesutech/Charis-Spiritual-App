/**
 * Notification & Reminder Preferences Section
 * Manages multiple prayer/reading alarms with distinct sounds, quiet period suppression,
 * and browser notification permissions.
 * Per docs/PRD.md FR-09 and docs/SECURITY.md.
 */

import React, { useState } from 'react';
import { Bell, Moon, ShieldCheck, AlertCircle, Volume2, VolumeX, Play, CheckCircle2 } from 'lucide-react';
import { notificationManager, NotificationPermissionState } from '../../lib/notifications/notification-manager';
import { soundAlarmService } from '../../lib/audio/sound-alarm';
import { ReminderPreferences } from '../../types/settings';
import { ScheduledRemindersList } from './ScheduledRemindersList';

interface NotificationPreferencesSectionProps {
  preferences: ReminderPreferences;
  onUpdate: (prefs: ReminderPreferences) => void;
  timeZone?: string;
}

export const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  preferences,
  onUpdate,
  timeZone,
}) => {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    notificationManager.getPermission()
  );
  const [isTestingChime, setIsTestingChime] = useState(false);
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const handleTestChime = async () => {
    setIsTestingChime(true);
    setTestFeedback(null);
    soundAlarmService.playTheme('cathedral');

    let currentPerm = permission;
    if (currentPerm === 'default') {
      currentPerm = await notificationManager.requestPermission();
      setPermission(currentPerm);
    }

    if (currentPerm === 'granted') {
      const sent = await notificationManager.sendContemplativeReminder(
        { title: 'Charis Sacred Chime', body: 'Your contemplative reminder and chime alarm are active and working.', tag: 'charis-test-rhythm' },
        { ...preferences, enabled: true, quietHours: { ...preferences.quietHours, enabled: false } },
        timeZone
      );
      setTestFeedback(sent ? 'Notification & sound chime sent!' : 'Chime played. Check system notification settings.');
    } else if (currentPerm === 'denied') {
      setTestFeedback('Chime played. System notifications are blocked in browser settings.');
    } else {
      setTestFeedback('Chime played. In-app alerts are active.');
    }

    setTimeout(() => setIsTestingChime(false), 2400);
  };

  const handleRequestPermission = async () => {
    const res = await notificationManager.requestPermission();
    setPermission(res);
    if (res === 'granted') {
      onUpdate({ ...preferences, enabled: true });
    }
  };

  const handleToggleEnabled = async (enabled: boolean) => {
    if (enabled && permission === 'default') {
      const res = await notificationManager.requestPermission();
      setPermission(res);
      onUpdate({ ...preferences, enabled: true });
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

      {/* Permission Status Notices */}
      {permission === 'denied' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold block mb-0.5">System Notifications Blocked</span>
            Your browser blocked notifications for this site. Click the lock or settings icon in your browser address bar and set Notifications to &quot;Allow&quot;. In-app chimes will still sound.
          </div>
        </div>
      )}

      {permission === 'unsupported' && preferences.enabled && (
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border text-xs text-charis-text flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-charis-primary" />
          <div className="text-[11px] text-charis-text-muted leading-relaxed">
            <span className="font-semibold text-charis-text block mb-0.5">Mobile PWA Notice</span>
            On iPhone / iPad, Apple requires adding Charis to your Home Screen (tap Safari’s Share button ⎘ and choose <strong>Add to Home Screen</strong>). In-app chimes and alerts remain active.
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
        <div className="space-y-3.5 pt-2">
          {/* Multiple Scheduled Rhythms */}
          <ScheduledRemindersList
            reminders={preferences.reminders}
            onUpdate={(reminders) => onUpdate({ ...preferences, reminders })}
          />

          {/* Master Sound Alarm Chime & Preview */}
          <div className="p-3.5 rounded-xl bg-charis-surface border border-charis-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.soundEnabled !== false ? (
                  <Volume2 className="w-4 h-4 text-charis-primary" />
                ) : (
                  <VolumeX className="w-4 h-4 text-charis-text-muted" />
                )}
                <div>
                  <span className="text-xs font-semibold text-charis-text block">
                    Sound Alarm Chimes
                  </span>
                  <span className="text-[11px] text-charis-text-muted block">
                    Play sacred bell and harp chimes when reminders trigger
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdate({ ...preferences, soundEnabled: preferences.soundEnabled === false })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  preferences.soundEnabled !== false ? 'bg-charis-primary' : 'bg-charis-border'
                }`}
                aria-label="Toggle sound chime"
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    preferences.soundEnabled !== false ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Test Preview Button & Feedback */}
            <div className="pt-2 flex flex-col gap-2 border-t border-charis-border/50">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-charis-text-muted">
                  Preview test chime and notification
                </span>
                <button
                  type="button"
                  onClick={handleTestChime}
                  disabled={isTestingChime}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-charis-border-subtle/80 hover:bg-charis-border text-charis-text text-xs font-medium transition-colors cursor-pointer"
                >
                  <Play className={`w-3 h-3 text-charis-primary ${isTestingChime ? 'animate-pulse' : ''}`} />
                  <span>{isTestingChime ? 'Testing...' : 'Test Notification & Chime'}</span>
                </button>
              </div>
              {testFeedback && (
                <div className="flex items-center gap-1.5 text-[11px] text-charis-primary bg-charis-primary/5 p-2 rounded-lg border border-charis-primary/20">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{testFeedback}</span>
                </div>
              )}
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
