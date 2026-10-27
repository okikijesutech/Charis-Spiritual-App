import React, { useState } from 'react';
import { Calendar, Plus, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useReadingPlans } from '../hooks/useReadingPlans';
import { Button } from '../components/ui/Button';
import { PlanCard } from '../components/plans/PlanCard';
import { PlanBuilderModal } from '../components/plans/PlanBuilderModal';
import { RescheduleModal } from '../components/plans/RescheduleModal';

interface PlansViewProps {
  onOpenPassage?: (passageRef: string) => void;
}

export const PlansView: React.FC<PlansViewProps> = ({ onOpenPassage }) => {
  const { user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';

  const {
    plans,
    activePlan,
    activePlanId,
    setActivePlanId,
    assignments,
    isLoading,
    createPlan,
    toggleAssignment,
    setFeatured,
    reschedule,
    deletePlan,
  } = useReadingPlans(activeUserId);

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  const uncompletedAssignments = assignments.filter((a) => a.status !== 'completed');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & New Plan CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charis-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charis-primary">
            <Calendar className="w-3.5 h-3.5" />
            <span>Structured Rhythm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charis-text mt-1">
            Bible Reading Plans
          </h2>
          <p className="text-xs sm:text-sm text-charis-text-muted mt-1 font-sans">
            Unhurried Scripture reading plans designed with grace over streaks.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsBuilderOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Plan</span>
        </Button>
      </div>

      {/* Multiple Plans Selector Tabs */}
      {plans.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {plans.map((p) => {
            const isActive = p.id === activePlanId;
            return (
              <button
                key={p.id}
                onClick={() => setActivePlanId(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-charis-primary text-white shadow-sm'
                    : 'bg-charis-surface border border-charis-border text-charis-text-muted hover:text-charis-text'
                }`}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Plan Content or Empty State */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-charis-text-muted">
          Loading reading journeys...
        </div>
      ) : !activePlan ? (
        <div className="text-center py-12 rounded-2xl bg-charis-surface border border-charis-border p-6 max-w-md mx-auto space-y-3">
          <BookOpen className="w-10 h-10 text-charis-text-muted mx-auto opacity-50" />
          <h3 className="font-serif font-bold text-lg text-charis-text">
            No active reading plans
          </h3>
          <p className="text-xs text-charis-text-muted leading-relaxed font-sans">
            Embark on an unhurried journey through the Gospels, New Testament, or Wisdom Literature. Reschedule anytime without guilt.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => setIsBuilderOpen(true)}
              className="gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create First Plan</span>
            </Button>
          </div>
        </div>
      ) : (
        <PlanCard
          plan={activePlan}
          assignments={assignments}
          onToggleAssignment={toggleAssignment}
          onSetFeatured={setFeatured}
          onOpenReschedule={() => setIsRescheduleOpen(true)}
          onDeletePlan={deletePlan}
          onOpenPassage={onOpenPassage}
        />
      )}

      {/* Plan Builder Modal */}
      <PlanBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onCreatePlan={createPlan}
      />

      {/* Reschedule Modal */}
      {activePlan && (
        <RescheduleModal
          isOpen={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          planName={activePlan.name}
          uncompletedCount={uncompletedAssignments.length}
          onConfirmReschedule={reschedule}
        />
      )}
    </div>
  );
};
