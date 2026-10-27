/**
 * Scripture Search Modal
 * Searches all 66 books, chapters, and thematic topics.
 * Per docs/PRD.md FR-03.
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { BibleSearchResult } from '../../lib/bible/search';

interface ScriptureSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  searchResults: BibleSearchResult[];
  onSearch: (q: string) => void;
  onSelectResult: (res: BibleSearchResult) => void;
}

export const ScriptureSearchModal: React.FC<ScriptureSearchModalProps> = ({
  isOpen,
  onClose,
  searchQuery,
  searchResults,
  onSearch,
  onSelectResult,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search All 66 Books & Topics"
      description="Search passages (e.g. 'John 3', 'Romans 8', 'Genesis 1') or topics"
    >
      <div className="space-y-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Type book, chapter, or topic..."
          autoFocus
          className="w-full px-3.5 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-charis-text focus:outline-none focus:ring-2 focus:ring-charis-primary text-sm shadow-subtle dark:bg-[#1B1E2B] dark:text-[#F3EFEA]"
        />

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((res, idx) => (
              <button
                key={`${res.formattedRef}-${idx}`}
                onClick={() => onSelectResult(res)}
                className="w-full p-2.5 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-left transition-colors flex items-start gap-2.5 dark:bg-[#1B1E2B]"
              >
                <Sparkles className="w-4 h-4 text-charis-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-charis-primary block">
                    {res.formattedRef} {res.topicLabel && `· ${res.topicLabel}`}
                  </span>
                  <p className="text-xs text-charis-text line-clamp-2 mt-0.5 font-serif italic">
                    “{res.text}”
                  </p>
                </div>
              </button>
            ))
          ) : searchQuery.trim() ? (
            <p className="text-xs text-charis-text-muted text-center py-4">
              No matching passages found. Try &quot;peace&quot;, &quot;John 3&quot;, or &quot;Romans 8&quot;.
            </p>
          ) : (
            <div className="text-xs text-charis-text-muted space-y-1.5 p-2">
              <span className="font-semibold text-charis-text block">Suggested Topics:</span>
              <div className="flex flex-wrap gap-1.5">
                {['peace', 'comfort', 'love', 'abiding'].map((t) => (
                  <button
                    key={t}
                    onClick={() => onSearch(t)}
                    className="px-2.5 py-1 rounded-lg border border-charis-border bg-charis-surface hover:bg-charis-border-subtle capitalize dark:bg-[#1B1E2B]"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
