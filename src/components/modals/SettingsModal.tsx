/**
 * Settings & Privacy Modal
 * Composes account identity, theme preference, notifications & quiet hours,
 * offline Bible downloads, local cache management, and legal disclosures.
 * Per docs/PRD.md FR-01, FR-09, FR-10, FR-12 and docs/SECURITY.md.
 */

import React, { useState } from 'react';
import { Sun, Moon, Laptop, Shield, Scale, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { ThemePreference } from '../../types';
import { AccountSection } from '../settings/AccountSection';
import { NotificationPreferencesSection } from '../settings/NotificationPreferencesSection';
import { OfflineTranslationsSection } from '../settings/OfflineTranslationsSection';
import { DataPrivacySection } from '../settings/DataPrivacySection';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { LicencesModal } from './LicencesModal';
import { SupportModal } from './SupportModal';
import { useUserSettings } from '../../hooks/useUserSettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const activeUserId = user?.id || 'demo-user-id';

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isLicencesOpen, setIsLicencesOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const { reminderPreferences, updateReminders } = useUserSettings(activeUserId);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings & Privacy"
        description="Manage account, offline assets, reminders, and app presentation."
        maxWidth="max-w-xl"
      >
        <div className="space-y-6 text-sm">
          {/* 1. Account & Profile */}
          <AccountSection />

          {/* 2. Theme Preference */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted block mb-2">
              Appearance & Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = theme === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as ThemePreference)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-charis-surface border-charis-primary text-charis-primary shadow-subtle'
                        : 'bg-charis-border-subtle/50 border-charis-border text-charis-text-muted hover:text-charis-text'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Notifications & Quiet Hours */}
          <div className="pt-4 border-t border-charis-border/60">
            <NotificationPreferencesSection
              preferences={reminderPreferences}
              onUpdate={updateReminders}
            />
          </div>

          {/* 4. Offline Bible Translation Downloads */}
          <div className="pt-4 border-t border-charis-border/60">
            <OfflineTranslationsSection />
          </div>

          {/* 5. Cache Partition & Data Privacy */}
          <div className="pt-4 border-t border-charis-border/60">
            <DataPrivacySection />
          </div>

          {/* 6. Legal, Privacy & Support Disclosures */}
          <div className="pt-4 border-t border-charis-border/60">
            <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted block mb-2.5">
              About & Disclosures
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text-muted hover:text-charis-text transition-colors text-center"
              >
                <Shield className="w-4 h-4 mb-1 text-charis-primary" />
                <span className="text-[11px] font-medium">Privacy Policy</span>
              </button>

              <button
                onClick={() => setIsLicencesOpen(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text-muted hover:text-charis-text transition-colors text-center"
              >
                <Scale className="w-4 h-4 mb-1 text-charis-primary" />
                <span className="text-[11px] font-medium">Licences</span>
              </button>

              <button
                onClick={() => setIsSupportOpen(true)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle text-charis-text-muted hover:text-charis-text transition-colors text-center"
              >
                <HelpCircle className="w-4 h-4 mb-1 text-charis-primary" />
                <span className="text-[11px] font-medium">About & Guide</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Disclosures & Support Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <LicencesModal
        isOpen={isLicencesOpen}
        onClose={() => setIsLicencesOpen(false)}
      />
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
};
