import { getSupabaseServerClient } from "@/lib/supabase" // Corrected import
import { cookies } from "next/headers"
import Dashboard from "./components/Dashboard"
import LandingPage from "./components/LandingPage"
import AdminDashboard from "./components/AdminDashboard" // Import AdminDashboard

export default async function Home() {
  const cookieStore = cookies()
  const supabase = getSupabaseServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile including name and is_admin
  let profile = null
  if (user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, points, is_admin, name")
      .eq("id", user.id)
      .maybeSingle()
    if (error) {
      console.error("Error fetching profile in page.tsx:", error)
    } else {
      profile = data
    }
  }

  // Determine which dashboard to show
  const isAdmin = profile?.is_admin === true

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      {user ? (
        isAdmin ? (
          <AdminDashboard user={user} profile={profile} />
        ) : (
          <Dashboard user={user} profile={profile} />
        )
      ) : (
        <LandingPage />
      )}
    </main>
  )
}
