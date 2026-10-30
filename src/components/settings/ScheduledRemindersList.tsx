/**
 * Scheduled Spiritual Rhythms & Sound Theme List
 * Manages multiple prayer and Scripture reading reminder times,
 * individual sound themes (Singing Bowl, Lyrical Harp, Cathedral Chime),
 * and audio preview controls.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Play, Heart, BookOpen } from 'lucide-react';
import { ScheduledReminder, SoundTheme, DEFAULT_SCHEDULED_REMINDERS } from '../../types/settings';
import { soundAlarmService, SOUND_THEMES } from '../../lib/audio/sound-alarm';

interface ScheduledRemindersListProps {
  reminders?: ScheduledReminder[];
  onUpdate: (reminders: ScheduledReminder[]) => void;
}

export const ScheduledRemindersList: React.FC<ScheduledRemindersListProps> = ({
  reminders,
  onUpdate,
}) => {
  const currentList = reminders && reminders.length > 0 ? reminders : DEFAULT_SCHEDULED_REMINDERS;
  const [playingTheme, setPlayingTheme] = useState<string | null>(null);

  const handleAudition = (theme: SoundTheme, id: string) => {
    setPlayingTheme(id);
    soundAlarmService.playTheme(theme);
    setTimeout(() => setPlayingTheme(null), 2000);
  };

  const handleToggle = (id: string) => {
    const next = currentList.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdate(next);
  };

  const handleTimeChange = (id: string, time: string) => {
    const next = currentList.map((r) => (r.id === id ? { ...r, time } : r));
    onUpdate(next);
  };

  const handleThemeChange = (id: string, soundTheme: SoundTheme) => {
    const next = currentList.map((r) => (r.id === id ? { ...r, soundTheme } : r));
    onUpdate(next);
    soundAlarmService.playTheme(soundTheme);
  };

  const handleTypeChange = (id: string, type: 'prayer' | 'reading') => {
    const next = currentList.map((r) => {
      if (r.id !== id) return r;
      const defaultLabel = type === 'prayer' ? 'Prayer Stillness' : 'Scripture Reading';
      const defaultSound: SoundTheme = type === 'prayer' ? 'bowl' : 'harp';
      return { ...r, type, label: defaultLabel, soundTheme: defaultSound };
    });
    onUpdate(next);
  };

  const handleDelete = (id: string) => {
    if (currentList.length <= 1) return;
    onUpdate(currentList.filter((r) => r.id !== id));
  };

  const handleAdd = () => {
    const isNextPrayer = currentList.filter((r) => r.type === 'prayer').length <= currentList.filter((r) => r.type === 'reading').length;
    const newReminder: ScheduledReminder = {
      id: `custom-rhythm-${Date.now()}`,
      type: isNextPrayer ? 'prayer' : 'reading',
      label: isNextPrayer ? 'Midday Prayer' : 'Daily Scripture',
      time: isNextPrayer ? '12:00' : '19:00',
      soundTheme: isNextPrayer ? 'bowl' : 'harp',
      enabled: true,
    };
    onUpdate([...currentList, newReminder]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-charis-text block">
            Scheduled Daily Rhythms
          </span>
          <span className="text-[11px] text-charis-text-muted block">
            Configure multiple times with distinct sounds for prayer and reading
          </span>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-charis-primary/10 hover:bg-charis-primary/20 text-charis-primary font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Time</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {currentList.map((r) => {
          const isPrayer = r.type === 'prayer';
          const Icon = isPrayer ? Heart : BookOpen;
          const isAuditioning = playingTheme === r.id;

          return (
            <div
              key={r.id}
              className={`p-3 rounded-xl border transition-all ${
                r.enabled
                  ? 'bg-charis-surface border-charis-border shadow-subtle'
                  : 'bg-charis-border-subtle/30 border-charis-border/50 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange(r.id, isPrayer ? 'reading' : 'prayer')}
                    className="p-1.5 rounded-lg bg-charis-border-subtle hover:bg-charis-border text-charis-primary transition-colors"
                    title={`Click to switch activity (currently ${r.type})`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-serif font-bold text-charis-text">
                    {r.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={r.time}
                    onChange={(e) => handleTimeChange(r.id, e.target.value)}
                    className="bg-charis-border-subtle/60 border border-charis-border rounded-lg px-2 py-0.5 text-xs text-charis-text focus:outline-none focus:border-charis-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleToggle(r.id)}
                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                      r.enabled ? 'bg-charis-primary' : 'bg-charis-border'
                    }`}
                    aria-label={`Toggle ${r.label}`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        r.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  {currentList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="p-1 text-charis-text-muted hover:text-red-500 transition-colors"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sound Theme Picker & Preview Button */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-charis-border/40 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-charis-text-muted">Chime Sound:</span>
                  <select
                    value={r.soundTheme}
                    onChange={(e) => handleThemeChange(r.id, e.target.value as SoundTheme)}
                    className="bg-charis-border-subtle/50 border border-charis-border/60 rounded px-1.5 py-0.5 text-charis-text text-[11px] focus:outline-none focus:border-charis-primary"
                  >
                    {SOUND_THEMES.map((theme) => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleAudition(r.soundTheme, r.id)}
                  className="inline-flex items-center gap-1 text-charis-primary hover:text-charis-primary-hover font-medium"
                >
                  <Play className={`w-3 h-3 ${isAuditioning ? 'animate-pulse' : ''}`} />
                  <span>{isAuditioning ? 'Playing...' : 'Audition'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
