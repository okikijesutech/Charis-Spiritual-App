import React, { useState } from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PLAN_SCOPES } from '../../lib/plans/plan-generator';
import type { PlanScopeType } from '../../types/plan';

interface PlanBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlan: (data: {
    name: string;
    description?: string;
    scopeType: PlanScopeType;
    durationDays: number;
  }) => Promise<unknown>;
}

export const PlanBuilderModal: React.FC<PlanBuilderModalProps> = ({
  isOpen,
  onClose,
  onCreatePlan,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScope, setSelectedScope] = useState<PlanScopeType>('chapter_range'); // default: Gospels
  const [duration, setDuration] = useState('60');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchedScope = PLAN_SCOPES.find((s) => s.id === selectedScope) || PLAN_SCOPES[0];
  const numDays = parseInt(duration, 10) || 30;
  const chaptersPerDay = Math.round((matchedScope.totalChapters / Math.max(1, numDays)) * 10) / 10;
  const isHighPace = chaptersPerDay > 25;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreatePlan({
        name: name.trim(),
        description: description.trim() || undefined,
        scopeType: selectedScope,
        durationDays: numDays,
      });
      onClose();
      setName('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Reading Journey"
      description="Select your Scripture scope and contemplative pace. You can adjust it anytime with grace."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Plan Title */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Journey Name *
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Journey Through the Gospels"
            className="w-full px-3.5 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
          />
        </div>

        {/* Scope Selection */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1.5">
            Scripture Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLAN_SCOPES.map((scope) => (
              <button
                type="button"
                key={scope.id}
                onClick={() => setSelectedScope(scope.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScope === scope.id
                    ? 'border-charis-primary bg-charis-primary/10 shadow-sm'
                    : 'border-charis-border bg-charis-border-subtle/40 hover:bg-charis-border-subtle text-charis-text'
                }`}
              >
                <div className="font-semibold text-xs text-charis-text">{scope.label}</div>
                <div className="text-[11px] text-charis-text-muted mt-0.5 line-clamp-1">
                  {scope.description}
                </div>
                <div className="text-[10px] font-medium text-charis-primary mt-1">
                  {scope.totalChapters} chapters
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1.5">
            Target Timeline
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {['30', '60', '90', '180', '365'].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => setDuration(d)}
                className={`py-2 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                  duration === d
                    ? 'bg-charis-primary text-white border-charis-primary shadow-sm'
                    : 'bg-charis-border-subtle/50 border-charis-border text-charis-text hover:bg-charis-border-subtle'
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* Pace Preview & Gentle Workload Warning */}
        <div className="p-3 rounded-xl bg-charis-border-subtle/50 border border-charis-border text-xs space-y-1">
          <div className="flex items-center justify-between font-medium">
            <span className="text-charis-text-muted flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-charis-primary" />
              Calculated Pace:
            </span>
            <span className="text-charis-text font-semibold">
              ~{chaptersPerDay} {chaptersPerDay === 1 ? 'chapter' : 'chapters'} / day
            </span>
          </div>

          {isHighPace && (
            <div className="flex items-start gap-1.5 pt-1.5 text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                At ~{Math.round(chaptersPerDay)} chapters per day, this pace may feel demanding. Consider choosing a longer timeline for an unhurried, contemplative rhythm.
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-charis-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Building Plan...' : 'Begin Journey'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
