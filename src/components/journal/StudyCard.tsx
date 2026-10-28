import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Link as LinkIcon, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import type { StudyEntry } from '../../types/journal';
import { Badge } from '../ui/Badge';

interface StudyCardProps {
  study: StudyEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: (study: StudyEntry) => void;
  onDelete: (id: string) => void;
  onResolveConflict: (study: StudyEntry) => void;
}

export const StudyCard: React.FC<StudyCardProps> = ({
  study,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onResolveConflict,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const formattedDate = new Date(study.updatedAt || study.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const passageText = study.passageRef?.formatted || 'Scripture Note';
  const isConflict = study.sync?.syncStatus === 'conflict';
  const isSynced = study.sync?.syncStatus === 'synced';

  return (
    <article
      className={`rounded-2xl bg-charis-surface border transition-all overflow-hidden ${
        isConflict
          ? 'border-amber-500/50 shadow-card'
          : 'border-charis-border shadow-card hover:border-charis-primary/30'
      }`}
    >
      {/* Collapsible Card Header */}
      <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
        <div
          onClick={onToggleExpand}
          className="flex items-start gap-3.5 flex-1 cursor-pointer"
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
        >
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 mt-0.5 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-charis-primary">
                {passageText}
              </span>
              <span className="text-xs text-charis-text-muted">· {formattedDate}</span>
            </div>
            <h3 className="text-lg font-serif font-bold text-charis-text mt-0.5">
              {study.title || `Study on ${passageText}`}
            </h3>
          </div>
        </div>

        {/* Status & Options */}
        <div className="flex items-center gap-2 relative shrink-0">
          {isConflict ? (
            <button
              onClick={() => onResolveConflict(study)}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
            >
              <AlertTriangle className="w-3 h-3" />
              Conflict
            </button>
          ) : (
            <Badge variant={isSynced ? 'sage' : 'neutral'} size="sm">
              {isSynced ? 'Synced' : 'Saved locally'}
            </Badge>
          )}

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="Study options"
              className="p-1 rounded-lg text-charis-text-muted hover:text-charis-text hover:bg-charis-border-subtle transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                onMouseLeave={() => setShowMenu(false)}
                className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-charis-surface border border-charis-border shadow-lg py-1 z-20 text-xs"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(study);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-charis-text hover:bg-charis-border-subtle transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Study
                </button>

                <div className="border-t border-charis-border/60 my-1" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(study.id);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Study
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onToggleExpand}
            aria-label={isExpanded ? 'Collapse study details' : 'Expand study details'}
            className="p-1 text-charis-text-muted hover:text-charis-text transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded SOAP / Inductive Details */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-charis-border/60 space-y-3.5 text-sm animate-in fade-in duration-200">
          {/* Observation */}
          {study.observations && (
            <div className="p-3.5 rounded-xl bg-charis-border-subtle/50 border border-charis-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-primary mb-1">
                1. Observation (What does it say?)
              </h4>
              <p className="font-serif text-charis-text leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                {study.observations}
              </p>
            </div>
          )}

          {/* Context & Questions */}
          {study.questionsContext && (
            <div className="p-3.5 rounded-xl bg-charis-border-subtle/50 border border-charis-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted mb-1">
                2. Context & Questions (Historical / Literary)
              </h4>
              <p className="font-serif text-charis-text leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                {study.questionsContext}
              </p>
            </div>
          )}

          {/* Interpretation */}
          {study.interpretation && (
            <div className="p-3.5 rounded-xl bg-charis-border-subtle/50 border border-charis-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-primary mb-1">
                3. Interpretation (What does it mean?)
              </h4>
              <p className="font-serif text-charis-text leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                {study.interpretation}
              </p>
            </div>
          )}

          {/* Application */}
          {study.application && (
            <div className="p-3.5 rounded-xl bg-charis-secondary/10 border border-charis-secondary/20">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-secondary mb-1">
                4. Application (How does it shape my walk?)
              </h4>
              <p className="font-serif text-charis-text leading-relaxed font-medium whitespace-pre-wrap text-xs sm:text-sm">
                {study.application}
              </p>
            </div>
          )}

          {/* Additional Notes */}
          {study.notes && (
            <div className="p-3.5 rounded-xl bg-charis-border-subtle/30 border border-charis-border/40">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted mb-1">
                Reflections & Notes
              </h4>
              <p className="font-serif text-charis-text leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                {study.notes}
              </p>
            </div>
          )}

          {/* Cross References */}
          {study.crossReferences && study.crossReferences.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-charis-text-muted flex items-center gap-1 mr-1">
                <LinkIcon className="w-3 h-3" />
                Cross References:
              </span>
              {study.crossReferences.map((ref) => (
                <Badge key={ref.formatted || ref.bookId} variant="neutral" size="sm">
                  {ref.formatted || ref.bookId}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
