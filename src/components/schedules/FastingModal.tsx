import React, { useState } from 'react';
import { Timer, Heart } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { scheduleRepository, STARTER_PRESETS } from '../../lib/db/schedule-repository';
import { generateUUID } from '../../lib/id';
import type { Schedule } from '../../types/schedule';

interface FastingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onFastStarted: () => void;
}

export const FastingModal: React.FC<FastingModalProps> = ({
  isOpen,
  onClose,
  userId,
  onFastStarted,
}) => {
  const fastingPresets = STARTER_PRESETS.filter((p) => p.kind === 'fasting');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(fastingPresets[0].id);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPreset = fastingPresets.find((p) => p.id === selectedPresetId);

  const handleStartFast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const targetHours = selectedPreset?.targetHours || 12;

      const schedule: Schedule = {
        id: generateUUID(),
        userId,
        kind: 'fasting',
        name: selectedPreset?.name || 'Contemplative Fast',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        startAt: now,
        targetHours,
        note: note.trim() || selectedPreset?.description || undefined,
        reminderEnabled: false,
        status: 'active',
        presetId: selectedPresetId,
        createdAt: now,
        updatedAt: now,
        sync: {
          syncStatus: 'pending',
          localVersion: 1,
          serverVersion: null,
          lastSyncedAt: null,
          syncError: null,
        },
      };

      await scheduleRepository.save(schedule);
      onFastStarted();
      onClose();
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Begin Contemplative Fast"
      description="Physical abstinence accompanied by prayer and Scripture. Health-neutral and without pressure."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleStartFast} className="space-y-4">
        {/* Presets */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1.5">
            Choose Contemplative Rhythm
          </label>
          <div className="space-y-2">
            {fastingPresets.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-charis-primary bg-charis-primary/10 shadow-sm'
                      : 'border-charis-border bg-charis-border-subtle/40 hover:bg-charis-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-charis-text">{preset.name}</span>
                    <span className="text-[11px] font-semibold text-charis-primary">
                      {preset.targetHours} hours
                    </span>
                  </div>
                  <p className="text-[11px] text-charis-text-muted mt-1 leading-relaxed font-sans">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note / Prayer Focus */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Prayer Focus or Scripture Note (optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Seeking quiet stillness and wisdom in decision making..."
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text font-serif focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Grace Over Streaks Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-charis-border-subtle/50 text-[11px] text-charis-text-muted">
          <Heart className="w-3.5 h-3.5 text-charis-primary shrink-0" />
          <span>You can end this fast at any time with complete peace. Fasting is a posture of the heart.</span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-charis-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-1.5">
            <Timer className="w-3.5 h-3.5" />
            {isSubmitting ? 'Starting...' : 'Begin Rhythm'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
