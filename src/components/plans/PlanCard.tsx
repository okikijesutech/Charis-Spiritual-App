import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Star, 
  RotateCcw, 
  BookOpen, 
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { ReadingPlan, ReadingPlanAssignment } from '../../types/plan';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PlanCardProps {
  plan: ReadingPlan;
  assignments: ReadingPlanAssignment[];
  onToggleAssignment: (assignment: ReadingPlanAssignment) => void;
  onSetFeatured: (planId: string) => void;
  onOpenReschedule: () => void;
  onDeletePlan: (planId: string) => void;
  onOpenPassage?: (passageRef: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  assignments,
  onToggleAssignment,
  onSetFeatured,
  onOpenReschedule,
  onDeletePlan,
  onOpenPassage,
}) => {
  const [showAllAssignments, setShowAllAssignments] = useState(false);

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const totalCount = assignments.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Today's assignment (first uncompleted or current day)
  const displayedAssignments = showAllAssignments
    ? assignments
    : assignments.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Plan Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-charis-surface border border-charis-border shadow-card space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-xl text-charis-text">
                {plan.name}
              </h3>
              {plan.featured && (
                <Badge variant="sage" size="sm" className="gap-1 bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30">
                  <Star className="w-3 h-3 fill-current" />
                  Featured Plan
                </Badge>
              )}
            </div>

            {plan.description && (
              <p className="text-xs sm:text-sm text-charis-text-muted font-sans">
                {plan.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-charis-text-muted pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Target: {plan.targetEndDate || 'Ongoing'}
              </span>
              <span>·</span>
              <span>{completedCount} of {totalCount} days completed</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onSetFeatured(plan.id)}
              aria-label={plan.featured ? 'Featured plan' : 'Set as featured plan'}
              className={`p-2 rounded-xl border transition-colors ${
                plan.featured
                  ? 'border-amber-500/40 text-amber-600 bg-amber-500/10'
                  : 'border-charis-border text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle'
              }`}
            >
              <Star className={`w-4 h-4 ${plan.featured ? 'fill-current' : ''}`} />
            </button>

            <Button
              variant="outline"
              size="sm"
              onClick={onOpenReschedule}
              className="gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Adjust Schedule</span>
            </Button>

            <button
              onClick={() => onDeletePlan(plan.id)}
              aria-label="Delete reading plan"
              className="p-2 rounded-xl text-charis-text-muted hover:text-red-600 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-charis-text-muted">Progress</span>
            <span className="text-charis-text font-semibold">{percentComplete}% Complete</span>
          </div>
          <div className="h-2 w-full bg-charis-border-subtle rounded-full overflow-hidden">
            <div
              className="h-full bg-charis-primary rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted">
            Daily Readings
          </h4>
          <span className="text-xs text-charis-text-muted">
            Showing {displayedAssignments.length} of {totalCount} readings
          </span>
        </div>

        <div className="space-y-2">
          {displayedAssignments.map((assignment) => {
            const isCompleted = assignment.status === 'completed';
            const passagesText = assignment.passages.map((p) => p.formatted).join(', ');

            return (
              <div
                key={assignment.id}
                className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/25 bg-emerald-500/[0.02] text-charis-text-muted'
                    : 'border-charis-border bg-charis-surface hover:border-charis-primary/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onToggleAssignment(assignment)}
                    aria-label={`Toggle Day ${assignment.dayNumber} completion`}
                    className={`shrink-0 transition-colors ${
                      isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-charis-text-muted hover:text-charis-primary'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-500/15" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-charis-text">
                        Day {assignment.dayNumber}
                      </span>
                      <span className="text-[11px] text-charis-text-muted">
                        {assignment.assignmentDate}
                      </span>
                    </div>

                    <div className="font-serif text-sm text-charis-text truncate mt-0.5">
                      {passagesText}
                    </div>
                  </div>
                </div>

                {/* Read Button */}
                {onOpenPassage && assignment.passages[0] && (
                  <button
                    onClick={() => onOpenPassage(assignment.passages[0].formatted)}
                    className="p-1.5 rounded-lg text-charis-primary hover:bg-charis-primary/10 transition-colors shrink-0"
                    aria-label={`Read ${passagesText}`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {totalCount > 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllAssignments((prev) => !prev)}
            className="w-full gap-1 text-xs mt-2"
          >
            {showAllAssignments ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Show Fewer Readings
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Show All {totalCount} Readings
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
