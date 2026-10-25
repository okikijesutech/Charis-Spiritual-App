import React, { useState } from 'react'
import { Mail, Lock, User, LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface AuthFormProps {
  onSuccess?: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, isConfigured } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSubmitting(true)

    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(email, password)
        if (error) {
          setErrorMsg(error.message)
        } else {
          setSuccessMsg('Welcome back! Signed in successfully.')
          if (onSuccess) onSuccess()
        }
      } else {
        const { error } = await signUpWithPassword(email, password, displayName.trim() || undefined)
        if (error) {
          setErrorMsg(error.message)
        } else {
          setSuccessMsg(
            isConfigured
              ? 'Registration complete! Check your email to confirm your account.'
              : 'Registered successfully in local demo mode.'
          )
          if (onSuccess) onSuccess()
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected authentication error occurred.'
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleAuth = async () => {
    setErrorMsg(null)
    try {
      const { error } = await signInWithGoogle()
      if (error) setErrorMsg(error.message)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Google OAuth.'
      setErrorMsg(msg)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode switcher tabs */}
      <div className="flex rounded-xl bg-charis-border-subtle p-1 border border-charis-border">
        <button
          type="button"
          onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'signin'
              ? 'bg-charis-surface text-charis-text shadow-subtle'
              : 'text-charis-text-muted hover:text-charis-text'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
            mode === 'signup'
              ? 'bg-charis-surface text-charis-text shadow-subtle'
              : 'text-charis-text-muted hover:text-charis-text'
          }`}
        >
          Create Account
        </button>
      </div>

      {!isConfigured && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-charis-border-subtle/70 border border-charis-border text-xs">
          <span className="text-charis-text-muted">Supabase credentials not set in .env</span>
          <Badge variant="neutral" size="sm">Demo Mode Active</Badge>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div 
          role="alert" 
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success alert */}
      {successMsg && (
        <div 
          role="status" 
          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-2 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <div>
            <label className="text-xs font-semibold text-charis-text-muted block mb-1">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charis-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Julian Vance"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-charis-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-charis-text-muted block mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-charis-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-charis-border bg-charis-surface text-sm text-charis-text focus:outline-none focus-visible:ring-2 focus-visible:ring-charis-primary"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full gap-2 text-sm mt-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</span>
            </>
          ) : (
            <>
              {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{mode === 'signin' ? 'Sign In with Email' : 'Create Private Account'}</span>
            </>
          )}
        </Button>
      </form>

      {/* Google OAuth Button */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charis-border" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase">
          <span className="bg-charis-surface px-2 text-charis-text-muted">or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-charis-border bg-charis-surface hover:bg-charis-border-subtle transition-colors text-xs font-medium text-charis-text shadow-subtle"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>
  )
}
