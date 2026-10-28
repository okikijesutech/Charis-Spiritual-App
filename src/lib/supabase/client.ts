import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../types/database'

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
// Support modern Supabase Publishable Keys (sb_publishable_...) and legacy Anon JWT keys
const rawKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
) as string | undefined

const cleanUrl = rawUrl?.trim().replace(/^["']|["']$/g, '')
const cleanKey = rawKey?.trim().replace(/^["']|["']$/g, '')

/**
 * Returns true if both the Supabase URL and public publishable key are provided.
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    cleanUrl &&
    cleanKey &&
    cleanUrl !== 'https://your-project-id.supabase.co' &&
    cleanKey !== 'sb_publishable_your_publishable_key_here' &&
    cleanKey !== 'your-publishable-anon-key-here'
  )
}

/**
 * Shared Supabase client instance.
 * Initialized only when public credentials are confirmed to avoid crashing local prototypes.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured()
  ? createClient<Database>(cleanUrl!, cleanKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'charis_supabase_auth'
      }
    })
  : null

if (!isSupabaseConfigured()) {
  console.info(
    '[Charis] Supabase credentials not found. Running in local demo mode. ' +
    'Copy .env.example to .env to connect a live Supabase project.'
  )
} else {
  console.info('[Charis] Connected to Supabase project.')
}
