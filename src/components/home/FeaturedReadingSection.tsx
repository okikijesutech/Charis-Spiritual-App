import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { planRepository } from '../../lib/db/plan-repository';
import type { ReadingPlan, ReadingPlanAssignment } from '../../types/plan';
import type { NavDestination } from '../../types';

interface FeaturedReadingSectionProps {
  userId: string;
  onNavigate: (tab: NavDestination) => void;
}

export const FeaturedReadingSection: React.FC<FeaturedReadingSectionProps> = ({
  userId,
  onNavigate,
}) => {
  const [featuredPlan, setFeaturedPlan] = useState<ReadingPlan | null>(null);
  const [todayAssignment, setTodayAssignment] = useState<ReadingPlanAssignment | null>(null);

  useEffect(() => {
    let isMounted = true;
    planRepository.list(userId).then(async (plans) => {
      if (!isMounted) return;
      const target = plans.find((p) => p.featured) || plans[0] || null;
      setFeaturedPlan(target);

      if (target) {
        const assignments = await planRepository.listAssignments(target.id, userId);
        if (isMounted) {
          // Find first uncompleted assignment or the first one
          const next = assignments.find((a) => a.status !== 'completed') || assignments[0] || null;
          setTodayAssignment(next);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleToggle = async () => {
    if (!todayAssignment || !featuredPlan) return;
    const isCompleted = todayAssignment.status !== 'completed';
    const now = new Date().toISOString();

    const updated: ReadingPlanAssignment = {
      ...todayAssignment,
      status: isCompleted ? 'completed' : 'pending',
      completedAt: isCompleted ? now : null,
      updatedAt: now,
    };

    await planRepository.saveAssignment(updated);
    setTodayAssignment(updated);

    const newCompletedCount = (featuredPlan.completedDays || 0) + (isCompleted ? 1 : -1);
    const updatedPlan: ReadingPlan = {
      ...featuredPlan,
      completedDays: Math.max(0, newCompletedCount),
      updatedAt: now,
    };
    await planRepository.save(updatedPlan);
    setFeaturedPlan(updatedPlan);
  };

  if (!featuredPlan || !todayAssignment) {
    return (
      <section aria-labelledby="featured-reading-title">
        <div className="rounded-2xl bg-charis-surface border border-charis-border p-6 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-charis-primary/10 text-charis-primary">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-semibold text-charis-primary uppercase tracking-wider">
                Scripture Journey
              </span>
              <h3 id="featured-reading-title" className="text-base font-serif font-bold text-charis-text mt-0.5">
                Begin an Unhurried Reading Plan
              </h3>
              <p className="text-xs text-charis-text-muted mt-0.5">
                Explore the Gospels, New Testament, or Wisdom Literature at your own pace.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('plans')}
            className="gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Plans</span>
          </Button>
        </div>
      </section>
    );
  }

  const isCompleted = todayAssignment.status === 'completed';
  const passagesText = todayAssignment.passages.map((p) => p.formatted).join(', ');

  return (
    <section aria-labelledby="featured-reading-title">
      <div className="relative overflow-hidden rounded-2xl bg-charis-surface border border-charis-border p-6 shadow-card hover:border-charis-primary/40 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D95740]/10 dark:bg-[#E06D58]/15 text-charis-primary">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-semibold text-charis-primary uppercase tracking-wider">
                Featured Plan · {featuredPlan.name}
              </span>
              <h3 id="featured-reading-title" className="text-lg font-serif font-bold text-charis-text">
                {passagesText}
              </h3>
            </div>
          </div>

          <Badge variant={isCompleted ? 'sage' : 'neutral'}>
            Day {todayAssignment.dayNumber} of {featuredPlan.totalDays}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-charis-border/60">
          <button
            onClick={handleToggle}
            className="inline-flex items-center gap-2 text-xs font-medium text-charis-text hover:text-charis-primary transition-colors py-1.5 px-3 rounded-lg border border-charis-border bg-charis-border-subtle/50"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-charis-text-muted" />
                <span>Mark Complete</span>
              </>
            )}
          </button>

          <Button
            variant="terracotta-soft"
            size="sm"
            onClick={() => onNavigate('bible')}
            className="gap-1.5 text-xs"
          >
            <span>Open in Bible</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
