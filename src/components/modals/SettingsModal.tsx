/**
 * Settings & Privacy Modal
 * Composes account identity, theme preference, notifications & quiet hours,
 * offline Bible downloads, and local cache management.
 * Per docs/PRD.md FR-01, FR-09, FR-10 and docs/SECURITY.md.
 */

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../ui/Modal';
import { ThemePreference } from '../../types';
import { AccountSection } from '../settings/AccountSection';
import { NotificationPreferencesSection } from '../settings/NotificationPreferencesSection';
import { OfflineTranslationsSection } from '../settings/OfflineTranslationsSection';
import { DataPrivacySection } from '../settings/DataPrivacySection';
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

  const { reminderPreferences, updateReminders } = useUserSettings(activeUserId);

  return (
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
      </div>
    </Modal>
  );
};
