"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Types for better type safety
interface ActionResult {
  success: boolean
  message: string
  data?: any
}

interface UserProfile {
  id: string
  email: string
  name: string
  points: number
  is_admin: boolean
  created_at?: string
}

interface PointTransaction {
  id: string
  user_id: string
  type: string
  amount: number
  description: string
  created_at: string
}

// Helper function to validate admin access
async function validateAdminAccess(): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, message: "Utente non autenticato." }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return {
        success: false,
        message: "Accesso non autorizzato. Solo gli amministratori possono eseguire questa azione.",
      }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error validating admin access:", error)
    return { success: false, message: "Errore durante la validazione dell'accesso." }
  }
}

// Sign up function with comprehensive error handling
export async function signUp(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Input validation
    if (!name || !email || !password || !confirmPassword) {
      return { success: false, message: "Tutti i campi sono obbligatori." }
    }

    if (password !== confirmPassword) {
      return { success: false, message: "Le password non corrispondono." }
    }

    if (password.length < 6) {
      return { success: false, message: "La password deve essere di almeno 6 caratteri." }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, message: "Inserisci un indirizzo email valido." }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("email").eq("email", email).single()

    if (existingUser) {
      return { success: false, message: "Un utente con questa email esiste già." }
    }

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      console.error("Errore durante la registrazione:", error.message)
      return { success: false, message: error.message || "Errore durante la registrazione." }
    }

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        points: 0,
        is_admin: false,
      })

      if (profileError) {
        console.error("Errore durante l'inserimento del profilo:", profileError.message)
        // Try to clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(data.user.id)
        return { success: false, message: "Errore durante la creazione del profilo utente." }
      }
    }

    revalidatePath("/")
    return {
      success: true,
      message: "Registrazione avvenuta con successo! Controlla la tua email per la conferma.",
    }
  } catch (error) {
    console.error("Unexpected error during sign up:", error)
    return { success: false, message: "Si è verificato un errore imprevisto durante la registrazione." }
  }
}

// Sign in function with proper error handling
export async function signIn(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Input validation
    if (!email || !password) {
      return { success: false, message: "Email e password sono obbligatori." }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (error) {
      console.error("Errore durante l'accesso:", error.message)

      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return { success: false, message: "Email o password non corretti." }
      }
      if (error.message.includes("Email not confirmed")) {
        return { success: false, message: "Conferma la tua email prima di accedere." }
      }

      return { success: false, message: "Errore durante l'accesso. Riprova." }
    }

    // Ensure profile exists
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single()

      if (profileError || !profile) {
        // Create profile if it doesn't exist
        const { error: createProfileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          name: data.user.user_metadata?.name || "",
          email: data.user.email!,
          points: 0,
          is_admin: false,
        })

        if (createProfileError) {
          console.error("Error creating profile:", createProfileError)
        }
      }
    }

    revalidatePath("/")
    return { success: true, message: "Accesso effettuato con successo!" }
  } catch (error) {
    console.error("Unexpected error during sign in:", error)
    return { success: false, message: "Si è verificato un errore imprevisto durante l'accesso." }
  }
}

// Sign out function
export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Errore durante il logout:", error.message)
      return { success: false, message: "Errore durante il logout." }
    }

    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("Unexpected error during sign out:", error)
    return { success: false, message: "Si è verificato un errore durante il logout." }
  }
}

// Get user profile with activity
export async function getUserProfile(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, message: "Utente non autenticato." }
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, points, is_admin, name, created_at")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.error("Profile error:", profileError)
      return { success: false, message: "Profilo non trovato." }
    }

    // Get recent activity
    const { data: activity, error: activityError } = await supabase
      .from("point_transactions")
      .select("id, type, amount, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (activityError) {
      console.error("Activity error:", activityError)
      // Don't fail the entire request if activity fails
    }

    return {
      success: true,
      message: "Profilo caricato con successo.",
      data: {
        profile,
        activity: activity || [],
      },
    }
  } catch (error) {
    console.error("Unexpected error getting user profile:", error)
    return { success: false, message: "Errore durante il caricamento del profilo." }
  }
}

// Redeem points function
export async function redeemPoints(userId: string, amount: number, description: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Input validation
    if (!userId || !amount || !description || amount <= 0) {
      return { success: false, message: "Parametri non validi per il riscatto." }
    }

    // Verify user exists and has enough points
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      return { success: false, message: "Profilo utente non trovato." }
    }

    if (profile.points < amount) {
      return { success: false, message: "Punti insufficienti per riscattare questa ricompensa." }
    }

    // Start transaction - deduct points and create transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from("point_transactions")
      .insert({
        user_id: userId,
        type: "deduct",
        amount: amount,
        description: description,
      })
      .select("id")
      .single()

    if (transactionError) {
      console.error("Transaction error:", transactionError)
      return { success: false, message: "Errore durante la creazione della transazione." }
    }

    // Update user points
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ points: profile.points - amount })
      .eq("id", userId)
      .select("points")
      .single()

    if (updateError) {
      console.error("Update error:", updateError)
      // Rollback transaction
      await supabase.from("point_transactions").delete().eq("id", transactionData.id)
      return { success: false, message: "Errore durante l'aggiornamento dei punti." }
    }

    // Create reward code entry
    const { error: rewardCodeError } = await supabase.from("reward_codes").insert({
      user_id: userId,
      point_transaction_id: transactionData.id,
      code: `REWARD_${Date.now()}`,
    })

    if (rewardCodeError) {
      console.error("Reward code error:", rewardCodeError)
      // Don't fail the entire operation if reward code creation fails
    }

    revalidatePath("/")
    return {
      success: true,
      message: "Ricompensa riscattata con successo!",
      data: { newPoints: updatedProfile.points },
    }
  } catch (error) {
    console.error("Unexpected error redeeming points:", error)
    return { success: false, message: "Errore imprevisto durante il riscatto." }
  }
}

// Get users for admin view
export async function getUsersForAdminView(): Promise<ActionResult> {
  try {
    const adminValidation = await validateAdminAccess()
    if (!adminValidation.success) {
      return { success: false, message: adminValidation.message! }
    }

    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, points, is_admin, name, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return { success: false, message: "Errore durante il caricamento degli utenti." }
    }

    return {
      success: true,
      message: "Utenti caricati con successo.",
      data: { users },
    }
  } catch (error) {
    console.error("Unexpected error getting users:", error)
    return { success: false, message: "Errore imprevisto durante il caricamento degli utenti." }
  }
}

// Add points to user by email (admin only)
export async function addPointsToUserByEmail(formData: FormData): Promise<ActionResult> {
  try {
    const adminValidation = await validateAdminAccess()
    if (!adminValidation.success) {
      return { success: false, message: adminValidation.message! }
    }

    const email = formData.get("email") as string
    const amount = Number(formData.get("amount"))
    const description = formData.get("description") as string

    // Input validation
    if (!email || isNaN(amount) || amount <= 0 || !description) {
      return { success: false, message: "Tutti i campi sono obbligatori e l'importo deve essere positivo." }
    }

    if (amount > 10000) {
      return { success: false, message: "L'importo massimo per singola operazione è 10.000 punti." }
    }

    const supabase = await createClient()

    // Find target user
    const { data: targetProfile, error: targetProfileError } = await supabase
      .from("profiles")
      .select("id, points, name")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (targetProfileError || !targetProfile) {
      return { success: false, message: "Utente con questa email non trovato." }
    }

    // Create transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from("point_transactions")
      .insert({
        user_id: targetProfile.id,
        type: "add",
        amount: amount,
        description: description,
      })
      .select("id")
      .single()

    if (transactionError) {
      console.error("Transaction error:", transactionError)
      return { success: false, message: "Errore durante la creazione della transazione." }
    }

    // Update user points
    const newPoints = targetProfile.points + amount
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", targetProfile.id)

    if (updateError) {
      console.error("Update error:", updateError)
      // Rollback transaction
      await supabase.from("point_transactions").delete().eq("id", transactionData.id)
      return { success: false, message: "Errore durante l'aggiornamento dei punti." }
    }

    revalidatePath("/")
    return {
      success: true,
      message: `Aggiunti con successo ${amount} punti a ${targetProfile.name || email}.`,
    }
  } catch (error) {
    console.error("Unexpected error adding points:", error)
    return { success: false, message: "Errore imprevisto durante l'aggiunta dei punti." }
  }
}

// Get redeemed rewards for admin
export async function getAdminRedeemedRewards(): Promise<ActionResult> {
  try {
    const adminValidation = await validateAdminAccess()
    if (!adminValidation.success) {
      return { success: false, message: adminValidation.message! }
    }

    const supabase = await createClient()

    const { data: redeemedRewards, error } = await supabase
      .from("reward_codes")
      .select(`
        id,
        redeemed_at,
        created_at,
        point_transactions!inner (
          id,
          user_id,
          amount,
          description,
          created_at,
          profiles!inner (
            email,
            name
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching redeemed rewards:", error)
      return { success: false, message: "Errore durante il caricamento dei premi riscattati." }
    }

    return {
      success: true,
      message: "Premi riscattati caricati con successo.",
      data: { redeemedRewards },
    }
  } catch (error) {
    console.error("Unexpected error getting redeemed rewards:", error)
    return { success: false, message: "Errore imprevisto durante il caricamento dei premi." }
  }
}

// Fulfill reward (admin only)
export async function fulfillReward(transactionId: string): Promise<ActionResult> {
  try {
    const adminValidation = await validateAdminAccess()
    if (!adminValidation.success) {
      return { success: false, message: adminValidation.message! }
    }

    if (!transactionId) {
      return { success: false, message: "ID transazione non valido." }
    }

    const supabase = await createClient()

    // Check if reward code exists and is not already fulfilled
    const { data: rewardCode, error: checkError } = await supabase
      .from("reward_codes")
      .select("id, redeemed_at")
      .eq("point_transaction_id", transactionId)
      .single()

    if (checkError || !rewardCode) {
      return { success: false, message: "Codice ricompensa non trovato." }
    }

    if (rewardCode.redeemed_at) {
      return { success: false, message: "Questa ricompensa è già stata evasa." }
    }

    // Mark as fulfilled
    const { error: updateError } = await supabase
      .from("reward_codes")
      .update({ redeemed_at: new Date().toISOString() })
      .eq("point_transaction_id", transactionId)

    if (updateError) {
      console.error("Error fulfilling reward:", updateError)
      return { success: false, message: "Errore durante l'evasione della ricompensa." }
    }

    revalidatePath("/")
    return { success: true, message: "Ricompensa contrassegnata come evasa con successo!" }
  } catch (error) {
    console.error("Unexpected error fulfilling reward:", error)
    return { success: false, message: "Errore imprevisto durante l'evasione della ricompensa." }
  }
}

// Get dashboard stats for admin
export async function getAdminStats(): Promise<ActionResult> {
  try {
    const adminValidation = await validateAdminAccess()
    if (!adminValidation.success) {
      return { success: false, message: adminValidation.message! }
    }

    const supabase = await createClient()

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    if (usersError) {
      console.error("Error counting users:", usersError)
    }

    // Get total points in system
    const { data: pointsData, error: pointsError } = await supabase.from("profiles").select("points")

    const totalPoints = pointsData?.reduce((sum, profile) => sum + profile.points, 0) || 0

    if (pointsError) {
      console.error("Error calculating total points:", pointsError)
    }

    // Get pending rewards
    const { count: pendingRewards, error: rewardsError } = await supabase
      .from("reward_codes")
      .select("*", { count: "exact", head: true })
      .is("redeemed_at", null)

    if (rewardsError) {
      console.error("Error counting pending rewards:", rewardsError)
    }

    return {
      success: true,
      message: "Statistiche caricate con successo.",
      data: {
        totalUsers: totalUsers || 0,
        totalPoints,
        pendingRewards: pendingRewards || 0,
      },
    }
  } catch (error) {
    console.error("Unexpected error getting admin stats:", error)
    return { success: false, message: "Errore durante il caricamento delle statistiche." }
  }
}
