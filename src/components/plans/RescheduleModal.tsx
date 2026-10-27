import React, { useState } from 'react';
import { RotateCcw, Heart } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  uncompletedCount: number;
  onConfirmReschedule: (additionalDays: number) => Promise<void>;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  planName,
  uncompletedCount,
  onConfirmReschedule,
}) => {
  const [days, setDays] = useState('14');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    const numDays = parseInt(days, 10) || 14;
    setIsSubmitting(true);
    try {
      await onConfirmReschedule(numDays);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gentle Schedule Adjustment"
      description={`Adjust timeline for "${planName}"`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Grace Over Streaks Note */}
        <div className="p-3.5 rounded-xl bg-charis-primary/10 border border-charis-primary/20 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-charis-primary">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Grace Over Streaks</span>
          </div>
          <p className="text-charis-text leading-relaxed font-serif text-[12px]">
            No streaks are reset, and no guilt is placed upon you. All of your completed readings remain safely preserved. The remaining {uncompletedCount} chapters will be smoothly redistributed starting from today.
          </p>
        </div>

        {/* Timeline extension choices */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1.5">
            Choose remaining reading window:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '+7 Days', value: '7' },
              { label: '+14 Days', value: '14' },
              { label: '+30 Days', value: '30' },
            ].map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                  days === opt.value
                    ? 'bg-charis-primary text-white border-charis-primary shadow-sm'
                    : 'bg-charis-border-subtle/50 border-charis-border text-charis-text hover:bg-charis-border-subtle'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Days Input */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Or custom days:
          </label>
          <input
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-charis-border">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isSubmitting ? 'Adjusting...' : 'Reschedule with Grace'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
