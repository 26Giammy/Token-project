import { createClient } from "@supabase/supabase-js"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { cookies } from "next/headers"

// This client uses the service role key and should be used with extreme caution
// for operations that require bypassing RLS (e.g., admin tasks that modify data for other users).
// For most server actions that operate within a user's context, use getSupabaseServerClient below.
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// This function creates a Supabase client for Server Components and Server Actions.
// It correctly handles user sessions via cookies.
export function getSupabaseServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Action or Route Handler
          // This error is safe to ignore if you're only setting cookies in a Server Action or Route Handler
          console.warn("Could not set cookie from server client:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `cookies().set()` method can only be called in a Server Action or Route Handler
          // This error is safe to ignore if you're only setting cookies in a Server Action or Route Handler
          console.warn("Could not remove cookie from server client:", error)
        }
      },
    },
  })
}
