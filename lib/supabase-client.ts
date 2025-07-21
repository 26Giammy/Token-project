import { createBrowserClient } from "@supabase/ssr"

let supabaseBrowserClient: ReturnType<typeof createBrowserClient> | undefined

export function getSupabaseBrowserClient() {
  if (!supabaseBrowserClient) {
    supabaseBrowserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return supabaseBrowserClient
}
