/**
 * About & Contemplative Support Modal
 * Spiritual discipline guide, PWA installation instructions, and troubleshooting FAQ.
 * Per docs/PRD.md and docs/IMPLEMENTATION-PLAN.md Section 11.
 */

import React from 'react';
import { Heart, Smartphone, HelpCircle, Mail } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="About Charis & Contemplative Guide"
      description="Unhurried stillness, offline workflows, and helpful support."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs text-charis-text max-h-[70vh] overflow-y-auto pr-1">
        {/* The Charis Vision */}
        <div className="p-3.5 rounded-xl bg-charis-primary/10 border border-charis-primary/20 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-charis-primary">
            <Heart className="w-4 h-4 fill-current" />
            <span>The Vision: Grace Over Streaks</span>
          </div>
          <p className="text-charis-text text-[11px] leading-relaxed">
            Charis (<strong>χάρις</strong> — grace) is designed to cultivate spiritual formation without guilt. We deliberately reject punitive streak counters, arbitrary gamification, and spiritual worth scores. If you miss days, your rhythm simply awaits your peaceful return.
          </p>
        </div>

        {/* PWA & Offline Guide */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-charis-text">
            <Smartphone className="w-4 h-4 text-charis-primary" />
            <span>Installing as a Mobile App (PWA)</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-charis-text-muted leading-relaxed">
            <p>
              • <strong>Android / Chrome:</strong> Tap the three-dot menu in your browser URL bar and select <em>“Add to Home Screen”</em> or <em>“Install App”</em>.
            </p>
            <p>
              • <strong>iOS / Safari:</strong> Tap the Share button at the bottom of the screen and choose <em>“Add to Home Screen”</em>.
            </p>
            <p>
              • <strong>Airplane Mode:</strong> Once installed, you can read downloaded translations (KJV, WEB, BSB) and write prayers completely offline.
            </p>
          </div>
        </div>

        {/* Common Troubleshooting FAQ */}
        <div className="p-3 rounded-xl bg-charis-surface border border-charis-border space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-charis-text">
            <HelpCircle className="w-4 h-4 text-charis-primary" />
            <span>Frequently Asked Questions</span>
          </div>
          <div className="space-y-2 text-[11px] text-charis-text-muted leading-relaxed">
            <div>
              <strong className="text-charis-text block mb-0.5">Where are my drafts saved if I am offline?</strong>
              Your drafts are safely persisted in your browser’s IndexedDB database. They will automatically sync to your private cloud storage when you reconnect.
            </div>
            <div>
              <strong className="text-charis-text block mb-0.5">What happens if I sign out?</strong>
              Charis warns you if you have unuploaded local drafts before signing out. You can choose to preserve them on this device or purge them if using a public or shared computer.
            </div>
          </div>
        </div>

        {/* Contact & Stewardship */}
        <div className="p-3 rounded-xl bg-charis-border-subtle/40 border border-charis-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-charis-text-muted" />
            <div>
              <span className="text-xs font-semibold text-charis-text block">Support & Reflection</span>
              <span className="text-[11px] text-charis-text-muted">peace@charis.app</span>
            </div>
          </div>
          <span className="text-[10px] text-charis-text-muted font-mono">v1.0.0</span>
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
