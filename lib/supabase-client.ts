import { createClient } from "@supabase/supabase-js"

// Create a singleton supabase client for client-side usage
let supabaseClientInstance: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseClientInstance
}
