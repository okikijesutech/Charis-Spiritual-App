/**
 * Dashboard Customizer Modal
 * Allows reordering, toggling visibility, and resetting home screen cards.
 * Per docs/PRD.md FR-02 and docs/IMPLEMENTATION-PLAN.md Section 10.
 */

import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Layout, 
  Sparkles 
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { DashboardWidgetConfig, DashboardWidgetId } from '../../types/settings';

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidgetConfig[];
  onToggleVisibility: (id: DashboardWidgetId) => void;
  onMoveWidget: (id: DashboardWidgetId, direction: 'up' | 'down') => void;
  onReset: () => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onToggleVisibility,
  onMoveWidget,
  onReset,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Dashboard"
      description="Arrange and choose which contemplative rhythms appear on your home sanctuary."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Reset Action Header */}
        <div className="flex items-center justify-between pb-2 border-b border-charis-border/60">
          <div className="flex items-center gap-1.5 text-xs text-charis-text-muted">
            <Layout className="w-3.5 h-3.5 text-charis-primary" />
            <span>Card Visibility & Order</span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-medium text-charis-primary hover:text-charis-primary/80 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Widgets Reorder & Toggle List */}
        <div className="space-y-2.5">
          {widgets.map((widget, index) => {
            const isFirst = index === 0;
            const isLast = index === widgets.length - 1;

            return (
              <div
                key={widget.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  widget.visible
                    ? 'bg-charis-surface border-charis-border shadow-subtle'
                    : 'bg-charis-border-subtle/30 border-charis-border/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 pr-2 min-w-0">
                  {/* Visibility Toggle Button */}
                  <button
                    onClick={() => onToggleVisibility(widget.id)}
                    aria-label={widget.visible ? `Hide ${widget.label}` : `Show ${widget.label}`}
                    className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                      widget.visible
                        ? 'bg-charis-primary/10 border-charis-primary/20 text-charis-primary'
                        : 'bg-charis-border-subtle border-charis-border text-charis-text-muted'
                    }`}
                  >
                    {widget.visible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* Widget Label & Description */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-charis-text truncate">
                        {widget.label}
                      </span>
                      {widget.id === 'featured_reading' && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-charis-text-muted truncate mt-0.5">
                      {widget.description}
                    </p>
                  </div>
                </div>

                {/* Reorder Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onMoveWidget(widget.id, 'up')}
                    disabled={isFirst}
                    aria-label={`Move ${widget.label} up`}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isFirst
                        ? 'opacity-30 border-transparent text-charis-text-muted cursor-not-allowed'
                        : 'border-charis-border hover:bg-charis-border-subtle text-charis-text'
                    }`}
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMoveWidget(widget.id, 'down')}
                    disabled={isLast}
                    aria-label={`Move ${widget.label} down`}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isLast
                        ? 'opacity-30 border-transparent text-charis-text-muted cursor-not-allowed'
                        : 'border-charis-border hover:bg-charis-border-subtle text-charis-text'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guidance */}
        <div className="pt-2 flex items-center justify-between text-xs text-charis-text-muted">
          <span className="flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3 h-3 text-charis-primary" />
            Changes save automatically
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-charis-primary text-white font-medium hover:bg-charis-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
