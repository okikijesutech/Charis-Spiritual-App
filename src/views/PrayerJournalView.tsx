import React, { useState } from 'react';
import { Heart, Plus, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePrayerJournal } from '../hooks/usePrayerJournal';
import type { PrayerEntry } from '../types/journal';
import { Button } from '../components/ui/Button';
import { PrayerCard } from '../components/journal/PrayerCard';
import { PrayerEditorModal } from '../components/journal/PrayerEditorModal';
import { ConflictResolutionModal } from '../components/journal/ConflictResolutionModal';
import { PrayerFilterBar } from '../components/journal/PrayerFilterBar';
import { exportPrayersToMarkdown } from '../components/journal/PrayerExport';

export const PrayerJournalView: React.FC = () => {
  const { user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';

  const {
    prayers,
    isLoading,
    savePrayer,
    toggleAnswered,
    deletePrayer,
    conflictPrayer,
    setConflictPrayer,
    resolveConflict,
  } = usePrayerJournal(activeUserId);

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerEntry | null>(null);

  // Derive unique tag list
  const allTags = ['All', ...Array.from(new Set(prayers.flatMap((p) => p.tags || [])))];

  // Filtered prayers
  const filteredPrayers = prayers.filter((p) => {
    const matchesTag = selectedTag === 'All' || p.tags?.includes(selectedTag);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'answered' && p.isAnswered) ||
      (statusFilter === 'ongoing' && !p.isAnswered);
    const textQuery = searchQuery.toLowerCase();
    const matchesSearch =
      (p.title && p.title.toLowerCase().includes(textQuery)) ||
      p.body.toLowerCase().includes(textQuery) ||
      (p.scriptureReferences?.[0]?.formatted &&
        p.scriptureReferences[0].formatted.toLowerCase().includes(textQuery));
    return matchesTag && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & New Prayer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charis-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charis-primary">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Private Sanctuary</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charis-text mt-1">
            Prayer Journal
          </h2>
          <p className="text-xs sm:text-sm text-charis-text-muted mt-1 font-sans">
            Your personal prayers are private, encrypted in transit, and saved locally first.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
          {prayers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPrayersToMarkdown(prayers)}
              className="gap-1.5 text-xs whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => {
              setEditingPrayer(null);
              setIsEditorOpen(true);
            }}
            className="gap-2 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Prayer</span>
          </Button>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <PrayerFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        selectedTag={selectedTag}
        onTagChange={setSelectedTag}
        allTags={allTags}
      />

      {/* Prayer Entries List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-charis-text-muted">Loading prayers...</div>
        ) : filteredPrayers.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-charis-surface border border-charis-border p-6">
            <Heart className="w-8 h-8 text-charis-text-muted mx-auto mb-2 opacity-50" />
            <h3 className="font-serif font-bold text-base text-charis-text">
              {searchQuery ? 'No matching prayers' : 'No prayer entries yet'}
            </h3>
            <p className="text-xs text-charis-text-muted mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword or clear tag filters.'
                : 'Begin by capturing your first quiet prayer, thanksgiving, or petition.'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditingPrayer(null);
                  setIsEditorOpen(true);
                }}
                className="mt-4 gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Write First Prayer</span>
              </Button>
            )}
          </div>
        ) : (
          filteredPrayers.map((prayer) => (
            <PrayerCard
              key={prayer.id}
              prayer={prayer}
              onEdit={(p) => {
                setEditingPrayer(p);
                setIsEditorOpen(true);
              }}
              onToggleAnswered={toggleAnswered}
              onDelete={deletePrayer}
              onResolveConflict={(p) => setConflictPrayer(p)}
            />
          ))
        )}
      </div>

      {/* Editor Modal */}
      <PrayerEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPrayer(null);
        }}
        onSave={savePrayer}
        editingPrayer={editingPrayer}
      />

      {/* Conflict Resolution Modal */}
      {conflictPrayer && (
        <ConflictResolutionModal
          isOpen={!!conflictPrayer}
          onClose={() => setConflictPrayer(null)}
          title={conflictPrayer.title || 'Prayer Entry'}
          localContent={{
            title: conflictPrayer.title,
            body: conflictPrayer.body,
            updatedAt: conflictPrayer.updatedAt,
          }}
          remoteContent={{
            title: (conflictPrayer.sync.conflictCopy as any)?.title,
            body: (conflictPrayer.sync.conflictCopy as any)?.body || '',
            updatedAt: (conflictPrayer.sync.conflictCopy as any)?.updated_at || conflictPrayer.updatedAt,
          }}
          onKeepLocal={() => resolveConflict('local')}
          onKeepRemote={() => resolveConflict('remote')}
          onMergeBoth={() => resolveConflict('merge')}
        />
      )}
    </div>
  );
};
