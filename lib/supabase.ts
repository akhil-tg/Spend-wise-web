import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get these from your Supabase project dashboard
// Set these in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client - this will only work with valid credentials
// For SSR/SSG, we handle the case where credentials aren't set
export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
    ? createClient(supabaseUrl, supabaseAnonKey)
    : ({} as SupabaseClient);
