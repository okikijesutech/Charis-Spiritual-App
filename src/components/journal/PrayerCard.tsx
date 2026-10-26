import React from 'react';
import { 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import type { PrayerEntry } from '../../types/journal';
import { Badge } from '../ui/Badge';

interface PrayerCardProps {
  prayer: PrayerEntry;
  onEdit: (prayer: PrayerEntry) => void;
  onToggleAnswered: (prayer: PrayerEntry) => void;
  onDelete: (id: string) => void;
  onResolveConflict: (prayer: PrayerEntry) => void;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  onEdit,
  onToggleAnswered,
  onDelete,
  onResolveConflict,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const formattedDate = new Date(prayer.entryAt || prayer.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const scriptureRef = prayer.scriptureReferences?.[0]?.formatted;
  const isConflict = prayer.sync?.syncStatus === 'conflict';
  const isSynced = prayer.sync?.syncStatus === 'synced';

  return (
    <article
      className={`p-5 sm:p-6 rounded-2xl bg-charis-surface border transition-all ${
        prayer.isAnswered
          ? 'border-emerald-500/30 bg-emerald-500/[0.02]'
          : isConflict
          ? 'border-amber-500/50 shadow-card'
          : 'border-charis-border shadow-card hover:border-charis-primary/30'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif font-bold text-lg text-charis-text">
              {prayer.title || 'Quiet Reflection'}
            </h3>
            {prayer.isAnswered && (
              <Badge variant="sage" size="sm" className="gap-1 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" />
                Answered
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-charis-text-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            {scriptureRef && (
              <span className="flex items-center gap-1 text-charis-primary font-medium">
                <BookOpen className="w-3 h-3" />
                {scriptureRef}
              </span>
            )}
          </div>
        </div>

        {/* Sync Status Badge & Action Menu */}
        <div className="flex items-center gap-2 relative">
          {isConflict ? (
            <button
              onClick={() => onResolveConflict(prayer)}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
            >
              <AlertTriangle className="w-3 h-3" />
              Resolve Conflict
            </button>
          ) : (
            <Badge variant={isSynced ? 'sage' : 'neutral'} size="sm">
              {isSynced ? 'Synced' : 'Saved locally'}
            </Badge>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Prayer options"
              className="p-1 rounded-lg text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                onMouseLeave={() => setShowMenu(false)}
                className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-charis-surface border border-charis-border shadow-lg py-1 z-20 text-xs"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(prayer);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-charis-text hover:bg-charis-border-subtle transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Prayer
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onToggleAnswered(prayer);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-charis-text hover:bg-charis-border-subtle transition-colors"
                >
                  {prayer.isAnswered ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      Mark as Ongoing
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Mark as Answered
                    </>
                  )}
                </button>

                <div className="border-t border-charis-border/60 my-1" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(prayer.id);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Prayer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-charis-text font-serif leading-relaxed my-3 whitespace-pre-wrap">
        {prayer.body}
      </p>

      {/* Answered praise note if present */}
      {prayer.isAnswered && prayer.answeredNote && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-charis-text">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300 block mb-0.5">
            Answer & Testimony:
          </span>
          <p className="font-serif italic leading-relaxed text-charis-text">
            {prayer.answeredNote}
          </p>
        </div>
      )}

      {/* Tags */}
      {prayer.tags && prayer.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-2 border-t border-charis-border/60">
          {prayer.tags.map((tag) => (
            <Badge key={tag} variant="neutral" size="sm">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
};
