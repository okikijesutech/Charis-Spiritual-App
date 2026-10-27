import React, { useEffect, useState, useCallback } from 'react';
import { Timer, Sparkles, Check, X, Plus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { scheduleRepository } from '../../lib/db/schedule-repository';
import type { Schedule } from '../../types/schedule';
import { FastingModal } from '../schedules/FastingModal';

interface FastingTimerWidgetProps {
  userId: string;
}

export const FastingTimerWidget: React.FC<FastingTimerWidgetProps> = ({ userId }) => {
  const [activeFast, setActiveFast] = useState<Schedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setTick] = useState(0);

  const loadActiveFast = useCallback(async () => {
    const fast = await scheduleRepository.getActiveFasting(userId);
    setActiveFast(fast);
  }, [userId]);

  useEffect(() => {
    loadActiveFast();
  }, [loadActiveFast]);

  // Update timer every minute while active
  useEffect(() => {
    if (!activeFast) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [activeFast]);

  // End fast
  const handleEndFast = async (status: 'completed' | 'cancelled') => {
    if (!activeFast) return;
    await scheduleRepository.endSchedule(activeFast.id, userId, status);
    await loadActiveFast();
  };

  if (!activeFast) {
    return (
      <>
        <div className="rounded-2xl bg-charis-surface border border-charis-border p-6 flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#78866B] dark:text-[#8E9E80]" />
                <span className="text-xs font-semibold text-[#78866B] dark:text-[#8E9E80] uppercase tracking-wider">
                  Fasting Rhythm
                </span>
              </div>
              <Badge variant="neutral" size="sm">Inactive</Badge>
            </div>

            <div className="mt-3">
              <h4 className="text-sm font-semibold text-charis-text">Contemplative Fasting</h4>
              <p className="text-xs text-charis-text-muted mt-1 leading-relaxed font-sans">
                A quiet rhythm of physical abstinence accompanied by Scripture reading and unhurried prayer.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-charis-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Begin Quiet Fast</span>
            </Button>
          </div>
        </div>

        <FastingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userId}
          onFastStarted={loadActiveFast}
        />
      </>
    );
  }

  // Calculate elapsed
  const startTime = new Date(activeFast.startAt || activeFast.createdAt).getTime();
  const nowTime = Date.now();
  const elapsedMinutes = Math.max(0, Math.floor((nowTime - startTime) / 60000));
  const elapsedHours = Math.round((elapsedMinutes / 60) * 10) / 10;
  const targetHours = activeFast.targetHours || 12;
  const progressPercent = Math.min(100, Math.round((elapsedHours / targetHours) * 100));
  const remainingHours = Math.max(0, Math.round((targetHours - elapsedHours) * 10) / 10);

  return (
    <>
      <div className="rounded-2xl bg-charis-surface border border-charis-border p-6 flex flex-col justify-between shadow-card">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[#78866B] dark:text-[#8E9E80]" />
              <span className="text-xs font-semibold text-[#78866B] dark:text-[#8E9E80] uppercase tracking-wider">
                Fasting Rhythm
              </span>
            </div>
            <Badge variant="sage" size="sm" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Active
            </Badge>
          </div>

          <div className="mt-3">
            <h4 className="text-sm font-semibold text-charis-text">{activeFast.name}</h4>
            {activeFast.note && (
              <p className="text-xs text-charis-text-muted mt-0.5 leading-relaxed font-sans">
                {activeFast.note}
              </p>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-charis-text">{elapsedHours} hrs elapsed</span>
              <span className="text-charis-text-muted">Target: {targetHours} hrs</span>
            </div>
            <div className="w-full h-2 rounded-full bg-charis-border-subtle overflow-hidden">
              <div
                className="h-full bg-[#78866B] dark:bg-[#8E9E80] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 mt-3 border-t border-charis-border/60 flex items-center justify-between text-xs text-charis-text-muted">
          <span>{remainingHours > 0 ? `${remainingHours} hrs remaining` : 'Target reached with grace'}</span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleEndFast('completed')}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Check className="w-3 h-3" />
              Complete
            </button>
            <button
              onClick={() => handleEndFast('cancelled')}
              className="inline-flex items-center text-[11px] text-charis-text-muted hover:text-red-600 p-1 rounded-lg transition-colors"
              title="End early with grace"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <FastingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        onFastStarted={loadActiveFast}
      />
    </>
  );
};
