import React, { useState } from 'react'
import { 
  Sun, 
  Moon, 
  Laptop, 
  CheckCircle2, 
  Globe, 
  Trash2, 
  Download, 
  AlertTriangle,
  LogOut,
  UserCheck
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { mockUserProfile } from '../../data/mockData'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { AuthForm } from '../auth/AuthForm'
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
  const { user, profile, settings, isConfigured, signOut } = useAuth()
  const [showAuthForm, setShowAuthForm] = useState(false)

  const displayName = profile?.display_name || user?.user_metadata?.full_name || mockUserProfile.name
  const displayEmail = user?.email || mockUserProfile.email
  const displayTimeZone = settings?.timezone || mockUserProfile.timeZone

  const handleSignOut = async () => {
    await signOut()
    setShowAuthForm(true)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Privacy"
      description="Manage account, offline assets, and app presentation."
      maxWidth="max-w-xl"
    >
      <div className="space-y-6 text-sm">
        {/* Account & Profile Section */}
        <div className="p-4 rounded-xl border border-charis-border bg-charis-border-subtle/40">
          {showAuthForm && !user ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-charis-primary">
                  Authentication
                </span>
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="text-xs text-charis-text-muted hover:text-charis-text"
                >
                  Cancel
                </button>
              </div>
              <AuthForm onSuccess={() => setShowAuthForm(false)} />
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-charis-primary/10 text-charis-primary border border-charis-primary/20 flex items-center justify-center font-serif font-bold text-base">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-charis-text-muted uppercase tracking-wider block">
                      Account
                    </span>
                    <h3 className="font-serif font-bold text-base text-charis-text mt-0.5">
                      {displayName}
                    </h3>
                    <p className="text-xs text-charis-text-muted">{displayEmail}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="sage" size="sm" className="gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>{isConfigured ? 'Supabase Sync' : 'Demo Session'}</span>
                  </Badge>
                  <button
                    onClick={handleSignOut}
                    className="text-xs text-charis-text-muted hover:text-rose-600 flex items-center gap-1 transition-colors mt-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-charis-border/60 flex items-center justify-between text-xs text-charis-text-muted">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {displayTimeZone}
                </span>
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="text-charis-primary font-medium hover:underline"
                >
                  Switch Account
                </button>
              </div>
            </div>
          )}
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
