import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Create a single Supabase client for the client-side
  // This ensures that the client is only created once and reused across the application
  // which helps prevent multiple connections and potential memory leaks.
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
