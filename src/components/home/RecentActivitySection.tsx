import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  BookOpen, 
  BookMarked, 
  Sparkles, 
  Clock, 
  Sun,
  Plus
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { activityRepository } from '../../lib/db/activity-repository';
import type { ActivityLog } from '../../types/activity';

interface RecentActivitySectionProps {
  userId: string;
  onOpenQuickAction: () => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  userId,
  onOpenQuickAction,
}) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    let isMounted = true;
    activityRepository.list(userId).then((items) => {
      if (isMounted) setActivities(items);
    });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reading':
        return <BookOpen className="w-4 h-4" />;
      case 'study':
        return <BookMarked className="w-4 h-4" />;
      case 'worship':
        return <Sparkles className="w-4 h-4" />;
      case 'fasting':
        return <Clock className="w-4 h-4" />;
      case 'gratitude':
        return <Sun className="w-4 h-4" />;
      case 'prayer':
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (isoDate: string) => {
    const date = new Date(isoDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <section className="rounded-2xl bg-charis-surface border border-charis-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-charis-text">
            Recent Spiritual Rhythm
          </h3>
          <p className="text-xs text-charis-text-muted mt-0.5">
            Reflective record of prayer, reading, and study sessions
          </p>
        </div>
        <Badge variant="neutral" size="sm">
          {activities.length} {activities.length === 1 ? 'session' : 'sessions'} recorded
        </Badge>
      </div>

      {activities.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-charis-text-muted">
            No spiritual rhythms recorded yet. Track quiet moments without pressure.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenQuickAction}
            className="mt-3 gap-1.5 text-xs mx-auto"
          >
            <Plus className="w-3.5 h-3.5 text-charis-primary" />
            Record First Rhythm
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-charis-border/60">
          {activities.slice(0, 4).map((activity) => (
            <div key={activity.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-charis-border-subtle flex items-center justify-center text-charis-primary text-xs font-medium shrink-0">
                  {getCategoryIcon(activity.category)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-charis-text">{activity.label}</h4>
                  {activity.note && (
                    <p className="text-xs text-charis-text-muted font-serif line-clamp-1">{activity.note}</p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {activity.durationSeconds ? (
                  <span className="text-xs text-charis-text font-medium">
                    {Math.round(activity.durationSeconds / 60)} min
                  </span>
                ) : null}
                <div className="text-[11px] text-charis-text-muted">
                  {formatTimestamp(activity.startedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
