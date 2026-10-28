import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Search, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudyJournal } from '../hooks/useStudyJournal';
import type { StudyEntry } from '../types/journal';
import { Button } from '../components/ui/Button';
import { StudyCard } from '../components/journal/StudyCard';
import { StudyEditorModal } from '../components/journal/StudyEditorModal';
import { ConflictResolutionModal } from '../components/journal/ConflictResolutionModal';
import { exportStudiesToMarkdown } from '../components/journal/StudyExport';

interface StudyJournalViewProps {
  initialScriptureRef?: string;
  onClearInitialScriptureRef?: () => void;
}

export const StudyJournalView: React.FC<StudyJournalViewProps> = ({
  initialScriptureRef,
  onClearInitialScriptureRef,
}) => {
  const { user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';

  const {
    studies,
    isLoading,
    saveStudy,
    deleteStudy,
    conflictStudy,
    setConflictStudy,
    resolveConflict,
  } = useStudyJournal(activeUserId);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudyId, setExpandedStudyId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(!!initialScriptureRef);
  const [editingStudy, setEditingStudy] = useState<StudyEntry | null>(null);

  // Auto-open editor when a scripture reference is passed from Bible reader
  useEffect(() => {
    if (initialScriptureRef) {
      setEditingStudy(null);
      setIsEditorOpen(true);
    }
  }, [initialScriptureRef]);

  // Expand the first study by default once loaded
  useEffect(() => {
    if (studies.length > 0 && expandedStudyId === null) {
      setExpandedStudyId(studies[0].id);
    }
  }, [studies, expandedStudyId]);

  // Filtered studies
  const filteredStudies = studies.filter((s) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title?.toLowerCase().includes(q) ?? false;
    const refMatch = s.passageRef?.formatted?.toLowerCase().includes(q) ?? false;
    const obsMatch = s.observations?.toLowerCase().includes(q) ?? false;
    const appMatch = s.application?.toLowerCase().includes(q) ?? false;
    return titleMatch || refMatch || obsMatch || appMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-charis-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charis-primary">
            <BookMarked className="w-3.5 h-3.5" />
            <span>Inductive & Thematic Study</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charis-text mt-1">
            Bible Study Journal
          </h2>
          <p className="text-xs sm:text-sm text-charis-text-muted mt-1 font-sans">
            Deep dive into Scripture structure, historical context, and thoughtful personal application.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
          {studies.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportStudiesToMarkdown(studies)}
              className="gap-1.5 text-xs whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </Button>
          )}
          <Button
            variant="primary"
            onClick={() => {
              setEditingStudy(null);
              setIsEditorOpen(true);
            }}
            className="gap-2 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Study</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-charis-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search study titles, scriptures, or observations..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text placeholder:text-charis-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
        />
      </div>

      {/* Studies List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-sm text-charis-text-muted">Loading study notes...</div>
        ) : filteredStudies.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-charis-surface border border-charis-border p-6">
            <BookMarked className="w-8 h-8 text-charis-text-muted mx-auto mb-2 opacity-50" />
            <h3 className="font-serif font-bold text-base text-charis-text">
              {searchQuery ? 'No matching studies' : 'No study notes yet'}
            </h3>
            <p className="text-xs text-charis-text-muted mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword.'
                : 'Begin by capturing your first inductive SOAP reflection or attach a note while reading Scripture.'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditingStudy(null);
                  setIsEditorOpen(true);
                }}
                className="mt-4 gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start First Study</span>
              </Button>
            )}
          </div>
        ) : (
          filteredStudies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              isExpanded={expandedStudyId === study.id}
              onToggleExpand={() =>
                setExpandedStudyId((prev) => (prev === study.id ? null : study.id))
              }
              onEdit={(s) => {
                setEditingStudy(s);
                setIsEditorOpen(true);
              }}
              onDelete={deleteStudy}
              onResolveConflict={(s) => setConflictStudy(s)}
            />
          ))
        )}
      </div>

      {/* Study Editor Modal */}
      <StudyEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingStudy(null);
          onClearInitialScriptureRef?.();
        }}
        onSave={(data) => {
          saveStudy(data);
          onClearInitialScriptureRef?.();
        }}
        editingStudy={editingStudy}
        initialScriptureRef={initialScriptureRef}
      />

      {/* Conflict Resolution Modal */}
      {conflictStudy && (
        <ConflictResolutionModal
          isOpen={!!conflictStudy}
          onClose={() => setConflictStudy(null)}
          title={conflictStudy.title || 'Study Entry'}
          localContent={{
            title: conflictStudy.title,
            body: conflictStudy.application || conflictStudy.observations || '',
            updatedAt: conflictStudy.updatedAt,
          }}
          remoteContent={{
            title: (conflictStudy.sync.conflictCopy as any)?.title,
            body:
              (conflictStudy.sync.conflictCopy as any)?.application ||
              (conflictStudy.sync.conflictCopy as any)?.observations ||
              '',
            updatedAt:
              (conflictStudy.sync.conflictCopy as any)?.updated_at || conflictStudy.updatedAt,
          }}
          onKeepLocal={() => resolveConflict('local')}
          onKeepRemote={() => resolveConflict('remote')}
          onMergeBoth={() => resolveConflict('merge')}
        />
      )}
    </div>
  );
};
