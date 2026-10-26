import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { PrayerEntry } from '../../types/journal';

interface PrayerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    title: string;
    body: string;
    tags: string[];
    scriptureRef: string;
    isAnswered?: boolean;
    answeredNote?: string;
  }) => void;
  editingPrayer?: PrayerEntry | null;
}

const PROMPT_GUIDANCE: Record<string, string> = {
  freeform: 'Pour out your heart honestly without structured prompts.',
  adoration: 'Praise God for who He is—His holiness, patience, mercy, and majesty.',
  confession: 'Bring mistakes and burdens into the light of His unfailing forgiveness.',
  thanksgiving: 'Recall specific mercies, answers, and quiet gifts received recently.',
  supplication: 'Ask with humble trust for personal needs, healing, and guidance for others.',
};

const DRAFT_STORAGE_KEY = 'charis_prayer_draft_v1';

export const PrayerEditorModal: React.FC<PrayerEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPrayer,
}) => {
  const [promptMode, setPromptMode] = useState<string>('thanksgiving');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('Peace, Morning');
  const [scriptureRef, setScriptureRef] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [answeredNote, setAnsweredNote] = useState('');

  // Initialize or restore draft when opened
  useEffect(() => {
    if (!isOpen) return;

    if (editingPrayer) {
      setTitle(editingPrayer.title || '');
      setBody(editingPrayer.body);
      setTags(editingPrayer.tags?.join(', ') || '');
      const ref = editingPrayer.scriptureReferences?.[0]?.formatted || '';
      setScriptureRef(ref);
      setIsAnswered(!!editingPrayer.isAnswered);
      setAnsweredNote(editingPrayer.answeredNote || '');
    } else {
      // Check for saved local draft
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setTitle(parsed.title || '');
          setBody(parsed.body || '');
          setTags(parsed.tags || 'Peace, Morning');
          setScriptureRef(parsed.scriptureRef || '');
        } catch {
          // ignore invalid draft
        }
      } else {
        setTitle('');
        setBody('');
        setTags('Peace, Morning');
        setScriptureRef('');
        setIsAnswered(false);
        setAnsweredNote('');
      }
    }
  }, [isOpen, editingPrayer]);

  // Autosave draft for new prayers so draft survives page reload
  useEffect(() => {
    if (!isOpen || editingPrayer) return;
    if (body.trim() || title.trim()) {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ title, body, tags, scriptureRef })
      );
    }
  }, [title, body, tags, scriptureRef, isOpen, editingPrayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    onSave({
      id: editingPrayer?.id,
      title: title.trim(),
      body: body.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      scriptureRef: scriptureRef.trim(),
      isAnswered,
      answeredNote: isAnswered ? answeredNote.trim() : undefined,
    });

    if (!editingPrayer) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPrayer ? 'Edit Prayer Reflection' : 'Compose Prayer Reflection'}
      description="Private to your account. Autosaved to your device."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rhythm Prompt Mode Selector (for new prayers) */}
        {!editingPrayer && (
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1.5">
              Rhythm Mode
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {['thanksgiving', 'adoration', 'confession', 'supplication', 'freeform'].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPromptMode(mode)}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded-xl border capitalize transition-all ${
                    promptMode === mode
                      ? 'bg-charis-primary text-white border-charis-primary'
                      : 'bg-charis-border-subtle/70 border-charis-border text-charis-text-muted hover:text-charis-text'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-charis-text-muted mt-2 italic bg-charis-border-subtle/50 p-2 rounded-lg">
              {PROMPT_GUIDANCE[promptMode]}
            </p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Peace in this morning's decisions"
            className="w-full px-3.5 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Prayer Content *
          </label>
          <textarea
            required
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Speak honestly and unhurriedly..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text font-serif leading-relaxed focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
          />
        </div>

        {/* Scripture & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Scripture Reference (optional)
            </label>
            <input
              type="text"
              value={scriptureRef}
              onChange={(e) => setScriptureRef(e.target.value)}
              placeholder="e.g. Psalm 23:1"
              className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Peace, Family, Morning"
              className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
        </div>

        {/* Answered Prayer Section */}
        <div className="pt-2 border-t border-charis-border/60">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-charis-text">
            <input
              type="checkbox"
              checked={isAnswered}
              onChange={(e) => setIsAnswered(e.target.checked)}
              className="rounded text-charis-primary focus:ring-charis-primary h-4 w-4"
            />
            <span>Mark as answered prayer</span>
          </label>

          {isAnswered && (
            <div className="mt-2 pl-6">
              <label className="text-xs text-charis-text-muted block mb-1">
                Praise / Testimony Note (How God answered)
              </label>
              <textarea
                rows={2}
                value={answeredNote}
                onChange={(e) => setAnsweredNote(e.target.value)}
                placeholder="Give thanks for the outcome or quiet faithfulness..."
                className="w-full px-3 py-1.5 rounded-xl border border-charis-border bg-charis-surface text-xs text-charis-text font-serif focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary resize-none"
              />
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-charis-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingPrayer ? 'Update Prayer' : 'Save Prayer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
