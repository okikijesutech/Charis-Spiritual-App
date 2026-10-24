import React from 'react'
import { 
  Sun, 
  Moon, 
  Laptop, 
  CheckCircle2, 
  Globe, 
  Trash2, 
  Download, 
  AlertTriangle 
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { mockUserProfile } from '../../data/mockData'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { ThemePreference } from '../../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { theme, setTheme } = useTheme()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Privacy"
      description="Manage account, offline assets, and app presentation."
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 text-sm">
        {/* Account & Profile */}
        <div className="p-4 rounded-xl border border-charis-border bg-charis-border-subtle/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-charis-text-muted uppercase tracking-wider block">
                Account
              </span>
              <h3 className="font-serif font-bold text-base text-charis-text mt-0.5">
                {mockUserProfile.name}
              </h3>
              <p className="text-xs text-charis-text-muted">{mockUserProfile.email}</p>
            </div>
            <Badge variant="sage" size="sm">Active Session</Badge>
          </div>
          <div className="mt-3 pt-3 border-t border-charis-border/60 flex items-center justify-between text-xs text-charis-text-muted">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {mockUserProfile.timeZone}
            </span>
            <span className="text-charis-primary font-medium cursor-pointer hover:underline">
              Change Password
            </span>
          </div>
        </div>

        {/* Theme Preference */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted block mb-2">
            Appearance & Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop }
            ].map(t => {
              const Icon = t.icon
              const isSelected = theme === t.id

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
              )
            })}
          </div>
        </div>

        {/* Offline Bible Translation Downloads */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-charis-text-muted block mb-2">
            Offline Bible Translations
          </label>
          <div className="space-y-2 border border-charis-border rounded-xl p-3 bg-charis-surface">
            {mockUserProfile.downloadedTranslations.map((translation) => (
              <div key={translation} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-charis-text">{translation}</span>
                </div>
                <Badge variant="sage" size="sm">Installed (4.2 MB)</Badge>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-charis-text-muted mt-1.5">
            Downloaded translations can be read and searched full-text even without an internet connection.
          </p>
        </div>

        {/* Shared Device & Local Privacy Warning */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Shared Device Notice</span>
          </div>
          <p className="leading-relaxed opacity-90">
            Charis preserves your journal drafts in browser local storage. If sharing this device, please remember to sign out to protect personal reflections.
          </p>
        </div>

        {/* Account Deletion / Export */}
        <div className="pt-3 border-t border-charis-border flex items-center justify-between">
          <button className="text-xs text-charis-text-muted hover:text-charis-text flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export Personal Journals (JSON)</span>
          </button>

          <button className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account & Data</span>
          </button>
        </div>
      </div>
    </Modal>
  )
}
