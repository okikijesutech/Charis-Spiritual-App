/**
 * Scripture Verse Reflection Widget
 * Displays daily meditative scripture passage with full chapter reader link.
 * Per docs/PRD.md FR-02.
 */

import React from 'react';
import { Bookmark } from 'lucide-react';
import { NavDestination } from '../../types';

interface VerseReflectionWidgetProps {
  onNavigate: (tab: NavDestination) => void;
}

export const VerseReflectionWidget: React.FC<VerseReflectionWidgetProps> = ({ onNavigate }) => {
  return (
    <div className="rounded-2xl bg-charis-surface border border-charis-border p-6 flex flex-col justify-between shadow-subtle">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-charis-primary uppercase tracking-wider flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5" />
            Verse Reflection
          </span>
          <span className="text-xs text-charis-text-muted font-serif">Psalm 23:2–3</span>
        </div>
        <blockquote className="font-serif italic text-base sm:text-lg text-charis-text leading-relaxed pl-3 border-l-2 border-charis-primary my-3">
          “He makes me lie down in green pastures; He leads me beside quiet waters. He restores my soul.”
        </blockquote>
      </div>

      <div className="pt-4 border-t border-charis-border/60 flex items-center justify-between">
        <span className="text-xs text-charis-text-muted">Berean Standard Bible</span>
        <button
          onClick={() => onNavigate('bible')}
          className="text-xs font-medium text-charis-primary hover:underline"
        >
          Read full chapter →
        </button>
      </div>
    </div>
  );
};
