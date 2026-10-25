import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase/client'
import { Database } from '../types/database'
import { mockUserProfile } from '../data/mockData'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type UserSettingsRow = Database['public']['Tables']['user_settings']['Row']

interface AuthContextType {
  user: User | null
  profile: ProfileRow | null
  settings: UserSettingsRow | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUpWithPassword: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [settings, setSettings] = useState<UserSettingsRow | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const isConfigured = isSupabaseConfigured()

  // Helper to fetch private profile and settings
  const fetchUserData = async (userId: string) => {
    if (!supabase) return
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileData) setProfile(profileData)
      if (settingsData) setSettings(settingsData)
    } catch (err) {
      console.error('[Charis Auth] Error fetching user profile:', err)
    }
  }

  useEffect(() => {
    if (!isConfigured || !supabase) {
      // Local Demo Mode: initialize with default mock profile
      setProfile({
        id: 'mock-user-1',
        display_name: mockUserProfile.name,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setSettings({
        user_id: 'mock-user-1',
        theme: 'system',
        timezone: mockUserProfile.timeZone,
        locale: 'en',
        featured_reading_plan_id: null,
        dashboard_layout: null,
        reminder_preferences: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setIsLoading(false)
      return
    }

    // 1. Restore active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserData(session.user.id)
      }
      setIsLoading(false)
    })

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      if (currentSession?.user) {
        fetchUserData(currentSession.user.id)
      } else {
        setProfile(null)
        setSettings(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isConfigured])

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) {
      // Demo mode fallback
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUpWithPassword = async (email: string, password: string, displayName?: string) => {
    if (!supabase) {
      // Demo mode fallback
      return { error: null }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName
        }
      }
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: null }
    }
    const redirectUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
    return { error }
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setSession(null)
    setUser(null)
    setProfile(null)
    setSettings(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        settings,
        session,
        isLoading,
        isConfigured,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
