/**
 * Translation Licences & Open Source Attributions Modal
 * Per docs/BIBLE-TRANSLATIONS-RIGHTS.md and docs/IMPLEMENTATION-PLAN.md Section 11.
 */

import React from 'react';
import { BookMarked, Scale } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SUPPORTED_TRANSLATIONS } from '../../lib/bible/canon';

interface LicencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicencesModal: React.FC<LicencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bible Translation Licences & Credits"
      description="Legal notices, translation permissions, and open source acknowledgments."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs text-charis-text max-h-[70vh] overflow-y-auto pr-1">
        {/* Guiding Principle */}
        <div className="p-3 rounded-xl bg-charis-border-subtle/50 border border-charis-border flex items-start gap-2.5">
          <Scale className="w-4 h-4 text-charis-primary shrink-0 mt-0.5" />
          <p className="text-charis-text-muted leading-relaxed text-[11px]">
            Charis respects the copyright, stewardship, and distribution rights of Bible societies and publishers. Offline translation downloads are restricted strictly to verified public domain and CC0 versions.
          </p>
        </div>

        {/* Translation Notices */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charis-text-muted block">
            Supported Translations
          </span>

          {SUPPORTED_TRANSLATIONS.map((t) => (
            <div
              key={t.id}
              className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charis-text">
                  {t.name} ({t.shortName})
                </span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  t.licenseType === 'public_domain'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                }`}>
                  {t.licenseType === 'public_domain' ? 'Public Domain / CC0' : 'Copyrighted Publisher API'}
                </span>
              </div>
              <p className="text-[11px] text-charis-text-muted leading-relaxed font-serif italic">
                {t.attribution}
              </p>
            </div>
          ))}
        </div>

        {/* Charis Application License */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-charis-text">
            <BookMarked className="w-3.5 h-3.5 text-charis-primary" />
            <span>Charis Application Licence</span>
          </div>
          <p className="text-charis-text-muted text-[11px] leading-relaxed">
            Free for personal devotion, study, and non-profit church ministries. Commercial use, monetisation, or profiting from the software, hosted services, or derivative works is strictly prohibited without prior express written permission.
          </p>
        </div>

        {/* Software & Open Source Credits */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-charis-text">
            <Scale className="w-3.5 h-3.5 text-charis-primary" />
            <span>Third-Party Open Source Libraries</span>
          </div>
          <p className="text-charis-text-muted text-[11px] leading-relaxed">
            Built with React, TypeScript, Vite, Tailwind CSS, Lucide Icons, idb (IndexedDB), and Supabase JS Client under permissive MIT and Apache 2.0 open source licenses.
          </p>
        </div>

        <div className="pt-2 border-t border-charis-border/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-charis-primary text-white font-medium hover:bg-charis-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
