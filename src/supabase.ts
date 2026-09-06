import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Database schema types for type-safe queries.
 * These will be auto-generated once migrations are applied.
 */
export type Database = {
  public: {
    Tables: {
      participants: {
        Row: {
          id: string
          display_name: string
          token_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          display_name: string
          token_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          token_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          capacity: number
          creator_id: string | null
          is_seeded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          capacity: number
          creator_id?: string | null
          is_seeded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          capacity?: number
          creator_id?: string | null
          is_seeded?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      memberships: {
        Row: {
          id: string
          participant_id: string
          project_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          participant_id: string
          project_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          participant_id?: string
          project_id?: string
          joined_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

/**
 * Configuration error for missing Supabase settings.
 */
export class SupabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SupabaseConfigurationError'
  }
}

let supabaseInstance: SupabaseClient<Database> | null = null

/**
 * Get the configured Supabase client.
 * Throws SupabaseConfigurationError if required environment variables are missing.
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string | undefined
  const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseConfigurationError(
      'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.',
    )
  }

  // Validate that we're not accidentally using a service-role key
  if (supabaseAnonKey.includes('service_role')) {
    throw new SupabaseConfigurationError(
      'Security error: Service-role key detected in client code. Only use the anonymous (anon) key.',
    )
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Disable auth persistence since we're using browser-scoped tokens
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return supabaseInstance
}

/**
 * Check if Supabase is configured without throwing an error.
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] as string | undefined
  const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'] as string | undefined
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes('service_role'))
}

/**
 * Reset the Supabase client instance (useful for testing).
 */
export function resetSupabaseClient(): void {
  supabaseInstance = null
}
