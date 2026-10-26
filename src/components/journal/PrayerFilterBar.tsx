import React from 'react';
import { Search } from 'lucide-react';

interface PrayerFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'ongoing' | 'answered';
  onStatusChange: (status: 'all' | 'ongoing' | 'answered') => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  allTags: string[];
}

export const PrayerFilterBar: React.FC<PrayerFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  selectedTag,
  onTagChange,
  allTags,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charis-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prayer reflections, topics, or verses..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text placeholder:text-charis-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center bg-charis-border-subtle/70 p-1 rounded-xl self-stretch sm:self-auto text-xs">
          {(['all', 'ongoing', 'answered'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => onStatusChange(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                statusFilter === tab
                  ? 'bg-charis-surface text-charis-text shadow-sm'
                  : 'text-charis-text-muted hover:text-charis-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tag chips */}
      {allTags.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-charis-primary text-white'
                  : 'bg-charis-surface border border-charis-border text-charis-text-muted hover:text-charis-text'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
