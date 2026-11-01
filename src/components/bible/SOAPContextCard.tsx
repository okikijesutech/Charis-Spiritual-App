import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { BookInsight } from '../../lib/bible/book-insights';

interface SOAPContextCardProps {
  bookName: string;
  insight: BookInsight;
}

export const SOAPContextCard: React.FC<SOAPContextCardProps> = ({ bookName, insight }) => {
  const [showContextCard, setShowContextCard] = useState(true);

  return (
    <div className="rounded-xl border border-charis-border/80 bg-charis-border-subtle/50 p-3.5 space-y-2">
      <button
        onClick={() => setShowContextCard(!showContextCard)}
        className="w-full flex items-center justify-between text-left font-serif font-bold text-charis-text"
      >
        <span className="flex items-center gap-1.5 text-xs">
          <Info className="w-3.5 h-3.5 text-charis-primary" />
          <span>{bookName} Context &amp; Theological Theme</span>
        </span>
        {showContextCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {showContextCard && (
        <div className="pt-2 border-t border-charis-border/40 space-y-1.5 text-[11px] text-charis-text-muted leading-relaxed">
          <p><strong className="text-charis-text">Theme:</strong> {insight.theme}</p>
          <p><strong className="text-charis-text">Setting:</strong> {insight.setting}</p>
          <p><strong className="text-charis-primary">Grace Thread:</strong> {insight.graceConnection}</p>
        </div>
      )}
    </div>
  );
};
