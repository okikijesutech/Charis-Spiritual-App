import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { StudyEntry, ScriptureReference } from '../../types/journal';

interface StudyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    scriptureRef: string;
    observations: string;
    questionsContext: string;
    interpretation: string;
    application: string;
    notes: string;
    crossReferences: ScriptureReference[];
  }) => void;
  editingStudy?: StudyEntry | null;
  initialScriptureRef?: string;
}

const STUDY_DRAFT_KEY = 'charis_study_draft_v1';

export const StudyEditorModal: React.FC<StudyEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStudy,
  initialScriptureRef,
}) => {
  const [title, setTitle] = useState('');
  const [scriptureRef, setScriptureRef] = useState('');
  const [observations, setObservations] = useState('');
  const [questionsContext, setQuestionsContext] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [application, setApplication] = useState('');
  const [notes, setNotes] = useState('');
  const [crossRefsText, setCrossRefsText] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (editingStudy) {
      setTitle(editingStudy.title || '');
      setScriptureRef(editingStudy.passageRef?.formatted || '');
      setObservations(editingStudy.observations || '');
      setQuestionsContext(editingStudy.questionsContext || '');
      setInterpretation(editingStudy.interpretation || '');
      setApplication(editingStudy.application || '');
      setNotes(editingStudy.notes || '');
      setCrossRefsText(
        editingStudy.crossReferences?.map((r) => r.formatted || r.bookId).join(', ') || ''
      );
    } else {
      // Check saved draft or prefilled scripture
      const savedDraft = localStorage.getItem(STUDY_DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setTitle(parsed.title || '');
          setScriptureRef(initialScriptureRef || parsed.scriptureRef || '');
          setObservations(parsed.observations || '');
          setQuestionsContext(parsed.questionsContext || '');
          setInterpretation(parsed.interpretation || '');
          setApplication(parsed.application || '');
          setNotes(parsed.notes || '');
          setCrossRefsText(parsed.crossRefsText || '');
        } catch {
          // ignore error
        }
      } else {
        setTitle('');
        setScriptureRef(initialScriptureRef || '');
        setObservations('');
        setQuestionsContext('');
        setInterpretation('');
        setApplication('');
        setNotes('');
        setCrossRefsText('');
      }
    }
  }, [isOpen, editingStudy, initialScriptureRef]);

  // Autosave draft for new studies
  useEffect(() => {
    if (!isOpen || editingStudy) return;
    if (scriptureRef.trim() || title.trim() || observations.trim() || application.trim()) {
      localStorage.setItem(
        STUDY_DRAFT_KEY,
        JSON.stringify({
          title,
          scriptureRef,
          observations,
          questionsContext,
          interpretation,
          application,
          notes,
          crossRefsText,
        })
      );
    }
  }, [
    isOpen,
    editingStudy,
    title,
    scriptureRef,
    observations,
    questionsContext,
    interpretation,
    application,
    notes,
    crossRefsText,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptureRef.trim() && !title.trim()) return;

    const crossReferences: ScriptureReference[] = crossRefsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((formatted) => ({
        bookId: '',
        bookName: '',
        chapter: 1,
        formatted,
      }));

    onSave({
      id: editingStudy?.id,
      title: title.trim(),
      scriptureRef: scriptureRef.trim(),
      observations: observations.trim(),
      questionsContext: questionsContext.trim(),
      interpretation: interpretation.trim(),
      application: application.trim(),
      notes: notes.trim(),
      crossReferences,
    });

    if (!editingStudy) {
      localStorage.removeItem(STUDY_DRAFT_KEY);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingStudy ? 'Edit Inductive Study' : 'New Inductive Study'}
      description="Structured SOAP exploration (All fields except reference or title are optional)."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Scripture Reference *
            </label>
            <input
              required
              type="text"
              value={scriptureRef}
              onChange={(e) => setScriptureRef(e.target.value)}
              placeholder="e.g. John 15:1-5"
              className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Study Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Abiding in the True Vine"
              className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
        </div>

        {/* Observation */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            1. Observation (What does the text say?)
          </label>
          <textarea
            rows={2}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Repeated words, literary structure, grammar..."
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Questions & Context */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            2. Context & Questions (Historical & Literary background)
          </label>
          <textarea
            rows={2}
            value={questionsContext}
            onChange={(e) => setQuestionsContext(e.target.value)}
            placeholder="Who was writing to whom? What questions arise?"
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Interpretation */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            3. Interpretation (What did it mean to the original hearers?)
          </label>
          <textarea
            rows={2}
            value={interpretation}
            onChange={(e) => setInterpretation(e.target.value)}
            placeholder="Theological truth and timeless meaning..."
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Application */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            4. Application (How does this shape my walk?)
          </label>
          <textarea
            rows={2}
            value={application}
            onChange={(e) => setApplication(e.target.value)}
            placeholder="Actionable, gracious personal response..."
            className="w-full px-3 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Notes & Cross References */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Cross References (comma separated)
            </label>
            <input
              type="text"
              value={crossRefsText}
              onChange={(e) => setCrossRefsText(e.target.value)}
              placeholder="e.g. Galatians 5:22, Psalm 1:3"
              className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Extra Notes / Reflections (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief lingering thoughts or pastoral insights"
              className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-charis-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingStudy ? 'Update Study' : 'Save Study'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
