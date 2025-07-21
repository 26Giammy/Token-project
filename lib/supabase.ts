import { createClient as createClientSSR } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createClientSSR(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: {
      // Pass the cookie store to the client
      // This is important for Next.js Server Components and Server Actions
      // to read and write cookies for session management.
      cookie: cookieStore,
      // Disable detectSessionInUrl to prevent Supabase from trying to read
      // the session from the URL, which is not how sessions are managed
      // in a server-side Next.js application.
      detectSessionInUrl: false,
    },
  })
}
