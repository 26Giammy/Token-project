"use server"

import { Resend } from "resend"
import { getSupabaseServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

// Helper function to create a server-side Supabase client with user context
function createServerClient() {
  const cookieStore = cookies()
  return getSupabaseServerClient(cookieStore)
}

export async function sendCustomEmail(toEmail: string, subject: string, htmlContent: string) {
  try {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    })
    return { success: true, message: "Email mandata con successo!" }
  } catch (error) {
    console.error("Error sending custom email:", error)
    return { success: false, message: "Impossibile mandare email" }
  }
}

export async function signUp(email: string, password: string, name: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name, // Pass the name to Supabase Auth metadata
      },
    },
  })

  if (error) {
    console.error("Sign up error:", error)
    let errorMessage = "Errore durante la registrazione."
    if (error.message.includes("already registered")) {
      errorMessage = "Email già registrata. Per favore, accedi."
    } else if (error.message.includes("Password should be at least 6 characters")) {
      errorMessage = "La password deve contenere almeno 6 caratteri."
    }
    return { success: false, message: errorMessage }
  }

  if (data.user) {
    // Insert into profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email: data.user.email,
      name: name, // Store the name in the profiles table
      is_admin: false, // Default to non-admin
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // If profile creation fails, attempt to delete the user to prevent orphaned accounts
      await supabase.auth.admin.deleteUser(data.user.id)
      return {
        success: false,
        message: "Account creato ma errore nell'inizializzazione, Contattare il supporto admin",
      }
    }
  }

  revalidatePath("/")
  return { success: true, message: "Registrazione completata. Controlla la tua email per la verifica." }
}

export async function signIn(email: string, password: string) {
  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error)
    let errorMessage = "Credenziali non valide."
    if (error.message.includes("Email not confirmed")) {
      errorMessage = "Email non confermata. Controlla la tua casella di posta."
    }
    return { success: false, message: errorMessage }
  }

  revalidatePath("/")
  return { success: true, message: "Accesso effettuato con successo!" }
}

export async function signOut() {
  const supabase = createServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign out error:", error)
    return { success: false, message: "Errore durante il logout." }
  }

  revalidatePath("/")
  return { success: true, message: "Logout effettuato con successo." }
}

export async function getUserProfile() {
  const supabase = createServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Error fetching user:", userError)
    return { success: false, profile: null, message: "Utente non autenticato." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, points, is_admin, name") // Select the name column
    .eq("id", user.id)
    .maybeSingle()

  if (profileError) {
    console.error("Error fetching profile:", profileError)
    return { success: false, profile: null, message: "Errore nel caricamento del profilo." }
  }

  return { success: true, profile, message: "Profilo caricato con successo." }
}

export async function redeemPoints(rewardId: string) {
  const supabase = createServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, message: "Utente non autenticato. Per favore, accedi per riscattare i premi." }
  }

  // 1. Fetch user's current points
  const { data: userProfile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", user.id)
    .single()

  if (profileFetchError || !userProfile) {
    console.error("Error fetching user points:", profileFetchError)
    return { success: false, message: "Impossibile recuperare i tuoi punti. Riprova più tardi." }
  }

  // 2. Fetch reward details
  const { data: reward, error: rewardFetchError } = await supabase
    .from("rewards")
    .select("id, points_cost, name")
    .eq("id", rewardId)
    .single()

  if (rewardFetchError || !reward) {
    console.error("Error fetching reward details:", rewardFetchError)
    return { success: false, message: "Premio non trovato o non disponibile." }
  }

  // 3. Check if user has enough points
  if (userProfile.points < reward.points_cost) {
    return { success: false, message: "Punti insufficienti per riscattare questo premio." }
  }

  // 4. Deduct points and record redemption
  const newPoints = userProfile.points - reward.points_cost

  const { error: updateError } = await supabase.from("profiles").update({ points: newPoints }).eq("id", user.id)

  if (updateError) {
    console.error("Error updating user points:", updateError)
    return { success: false, message: "Errore durante la deduzione dei punti. Riprova." }
  }

  // 5. Generate a unique reward code
  const { data: rewardCodeData, error: rewardCodeInsertError } = await supabase
    .rpc("generate_unique_reward_code") // Call the PostgreSQL function
    .select("code") // Select the generated code

  if (rewardCodeInsertError || !rewardCodeData || rewardCodeData.length === 0) {
    console.error("Error generating reward code:", rewardCodeInsertError)
    return { success: false, message: "Errore nella generazione del codice premio. Contatta il supporto." }
  }

  const generatedCode = rewardCodeData[0].code

  // 6. Record the reward fulfillment
  const { error: fulfillmentError } = await supabase.from("reward_codes").insert({
    user_id: user.id,
    reward_id: reward.id,
    code: generatedCode, // Store the generated code
    redeemed_at: new Date().toISOString(),
  })

  if (fulfillmentError) {
    console.error("Error recording reward fulfillment:", fulfillmentError)
    return { success: false, message: "Errore nella registrazione del riscatto. Contatta il supporto." }
  }

  revalidatePath("/")
  return {
    success: true,
    message: `Hai riscattato "${reward.name}"! Il tuo codice premio è: ${generatedCode}`,
    rewardCode: generatedCode,
  }
}

export async function addPoints(userId: string, points: number) {
  const supabase = createServerClient()
  const { data, error } = await supabase.rpc("add_points_to_user", {
    p_user_id: userId,
    p_points_to_add: points,
  })

  if (error) {
    console.error("Error adding points:", error)
    return { success: false, message: "Errore nell'aggiunta dei punti." }
  }

  revalidatePath("/")
  return { success: true, message: `Aggiunti ${points} punti all'utente ${userId}.` }
}

export async function createReward(name: string, pointsCost: number) {
  const supabase = createServerClient()
  const { error } = await supabase.from("rewards").insert({ name, points_cost: pointsCost })

  if (error) {
    console.error("Error creating reward:", error)
    return { success: false, message: "Errore nella creazione del premio." }
  }

  revalidatePath("/")
  return { success: true, message: `Premio "${name}" creato con successo.` }
}

export async function getRewards() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("rewards").select("*").order("points_cost", { ascending: true })

  if (error) {
    console.error("Error fetching rewards:", error)
    return { success: false, rewards: [], message: "Errore nel recupero dei premi." }
  }

  return { success: true, rewards: data, message: "Premi recuperati con successo." }
}

export async function getRedeemedRewards() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("reward_codes")
    .select("*, profiles(name, email), rewards(name, points_cost)") // Fetch user name and email
    .order("redeemed_at", { ascending: false })

  if (error) {
    console.error("Error fetching redeemed rewards:", error)
    return { success: false, redeemedRewards: [], message: "Errore nel recupero dei premi riscattati." }
  }

  return { success: true, redeemedRewards: data, message: "Premi riscattati recuperati con successo." }
}

// --- Admin-specific Server Actions ---

// Helper to check if the current user is an admin
async function isAdmin() {
  const supabase = createServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) return false

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  return !profileError && profile?.is_admin === true
}

export async function addPointsToUserByEmail(email: string, points: number) {
  const supabase = createServerClient()
  if (!(await isAdmin())) {
    return { success: false, message: "Non autorizzato, non admin" }
  }

  if (!email || isNaN(points) || points <= 0) {
    return { success: false, message: "Input non valido per aggiungere punti." }
  }

  try {
    // Find the user's profile by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, points")
      .eq("email", email)
      .single()

    if (profileError || !profile) {
      console.error("Errore nella ricerca via email", profileError)
      return { success: false, message: "Utente non trovato." }
    }

    // Update user's points
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ points: profile.points + points })
      .eq("id", profile.id)

    if (updateError) {
      console.error("Error updating points:", updateError)
      return { success: false, message: "Impossibile aggiungere punti all'utente." }
    }

    // Record transaction
    const { error: transactionError } = await supabase.from("point_transactions").insert({
      user_id: profile.id,
      type: "earn",
      amount: points,
      description: "Aggiunti punti da parte dell'amministratore",
    })

    if (transactionError) {
      console.error("Error recording admin point transaction:", transactionError)
      return { success: false, message: "Points added, but failed to record transaction." }
    }

    revalidatePath("/")
    return {
      success: true,
      message: `Aggiunti ${points} punti a ${email}. Nuovo totale: ${profile.points + points}`,
    }
  } catch (error) {
    console.error("Unexpected error in addPointsToUserByEmail:", error)
    return { success: false, message: "An unexpected error occurred while adding points." }
  }
}

export async function getUsersForAdminView() {
  const supabase = createServerClient()
  if (!(await isAdmin())) {
    return { success: false, message: "Non autorizzato, non admin", users: [] }
  }

  try {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, points, is_admin, name") // Include name
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users for admin view:", error)
      return { success: false, message: "Failed to fetch users.", users: [] }
    }

    return { success: true, message: "Utente inizializzato con successo", users }
  } catch (error) {
    console.error("Unexpected error in getUsersForAdminView:", error)
    return { success: false, message: "An unexpected error occurred.", users: [] }
  }
}

export async function getAdminRedeemedRewards() {
  const supabase = createServerClient()
  if (!(await isAdmin())) {
    return { success: false, message: "Non autorizzato, non admin", redeemedRewards: [] }
  }

  try {
    // Query reward_codes and embed related point_transactions and profiles
    const { data: redeemedRewards, error } = await supabase
      .from("reward_codes")
      .select(`
        id,
        code,
        redeemed_at,
        point_transactions (
          id,
          user_id,
          amount,
          description,
          created_at,
          profiles (email, name)
        )
      `)
      .order("created_at", { foreignTable: "point_transactions", ascending: false })

    if (error) {
      console.error("Error fetching redeemed rewards for admin:", error)
      return { success: false, message: "Failed to fetch redeemed rewards.", redeemedRewards: [] }
    }

    return { success: true, message: "Ricompense riscattate con successo!!", redeemedRewards }
  } catch (error) {
    console.error("Unexpected error in getAdminRedeemedRewards:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}

export async function fulfillReward(transactionId: string) {
  const supabase = createServerClient()
  if (!(await isAdmin())) {
    return { success: false, message: "Unauthorized: Not an admin." }
  }

  try {
    const { data, error } = await supabase
      .from("reward_codes")
      .update({ redeemed_at: new Date().toISOString() })
      .eq("transaction_id", transactionId)
      .select("id")
      .single()

    if (error || !data) {
      console.error("Error fulfilling reward:", error)
      return { success: false, message: "Failed to fulfill reward." }
    }

    revalidatePath("/")
    return { success: true, message: "Reward marked as fulfilled!" }
  } catch (error) {
    console.error("Unexpected error in fulfillReward:", error)
    return { success: false, message: "An unexpected error occurred while fulfilling the reward." }
  }
}
