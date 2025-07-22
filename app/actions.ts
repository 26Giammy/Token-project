"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { success: false, message: "Le password non corrispondono." }
  }

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

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        name: name,
        email: email,
        points: 0,
        is_admin: false,
      },
      { onConflict: "id" },
    )

    if (profileError) {
      console.error("Errore durante l'inserimento del profilo:", profileError.message)
      return { success: false, message: "Errore durante la creazione del profilo utente." }
    }
  }

  revalidatePath("/")
  return { success: true, message: "Registrazione avvenuta con successo! Controlla la tua email per la conferma." }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Errore durante l'accesso:", error.message)
    return { success: false, message: error.message || "Credenziali non valide." }
  }

  revalidatePath("/")
  return { success: true, message: "Accesso effettuato con successo!" }
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Errore durante il logout:", error.message)
    return { success: false, message: error.message || "Errore durante il logout." }
  }

  revalidatePath("/")
  redirect("/")
}

export async function getUserProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, points, is_admin, name")
    .eq("id", user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return { success: false, message: profileError?.message || "Profilo non trovato." }
  }

  const { data: activity, error: activityError } = await supabase
    .from("point_transactions")
    .select("type, amount, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  if (activityError) {
    console.error("Errore nel recupero dell'attività:", activityError)
  }

  return { success: true, profile, activity: activity || [] }
}

export async function redeemPoints(userId: string, amount: number, description: string) {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .maybeSingle()

  if (profileError || !profile) {
    return { success: false, message: "Profilo utente non trovato." }
  }

  if (profile.points < amount) {
    return { success: false, message: "Punti insufficienti per riscattare questa ricompensa." }
  }

  const { data: newPointsData, error: pointsError } = await supabase.rpc("deduct_points", {
    user_id_param: userId,
    points_to_deduct: amount,
    description_param: description,
  })

  if (pointsError) {
    return { success: false, message: pointsError.message }
  }

  const { error: rewardCodeInsertError } = await supabase.from("reward_codes").insert({
    user_id: userId,
    point_transaction_id: newPointsData?.transaction_id,
    code: "PENDING",
  })

  if (rewardCodeInsertError) {
    console.error("Errore nell'inserimento del codice ricompensa:", rewardCodeInsertError)
  }

  revalidatePath("/")
  return { success: true, message: "Ricompensa riscattata con successo!", newPoints: newPointsData?.new_points }
}

export async function getUsersForAdminView() {
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
    .maybeSingle()

  if (profileError || !profile || !profile.is_admin) {
    return { success: false, message: "Accesso non autorizzato." }
  }

  const { data: users, error } = await supabase
    .from("profiles")
    .select("id, email, points, is_admin, name")
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, users }
}

export async function addPointsToUserByEmail(formData: FormData) {
  const email = formData.get("email") as string
  const amount = Number(formData.get("amount"))
  const description = formData.get("description") as string

  if (!email || isNaN(amount) || amount <= 0 || !description) {
    return { success: false, message: "Input non valido per l'aggiunta di punti." }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authUserError,
  } = await supabase.auth.getUser()

  if (authUserError || !user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (adminProfileError || !adminProfile || !adminProfile.is_admin) {
    return { success: false, message: "Non autorizzato: solo gli amministratori possono aggiungere punti." }
  }

  const { data: targetProfile, error: targetProfileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (targetProfileError || !targetProfile) {
    return { success: false, message: "Utente di destinazione non trovato." }
  }

  const { error: rpcError } = await supabase.rpc("add_points", {
    user_id_param: targetProfile.id,
    points_to_add: amount,
    description_param: description,
  })

  if (rpcError) {
    return { success: false, message: rpcError.message }
  }

  revalidatePath("/")
  return { success: true, message: `Aggiunti con successo ${amount} punti a ${email}.` }
}

export async function getAdminRedeemedRewards() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authUserError,
  } = await supabase.auth.getUser()

  if (authUserError || !user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (adminProfileError || !adminProfile || !adminProfile.is_admin) {
    return { success: false, message: "Non autorizzato." }
  }

  const { data: redeemedRewards, error } = await supabase
    .from("reward_codes")
    .select(
      `
    id,
    redeemed_at,
    point_transactions (
      id,
      user_id,
      amount,
      description,
      created_at,
      profiles (
        email,
        name
      )
    )
  `,
    )
    .not("point_transactions", "is", null)
    .order("created_at", { ascending: false, foreignTable: "point_transactions" })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, redeemedRewards }
}

export async function fulfillReward(transactionId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authUserError,
  } = await supabase.auth.getUser()

  if (authUserError || !user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (adminProfileError || !adminProfile || !adminProfile.is_admin) {
    return { success: false, message: "Non autorizzato." }
  }

  const { error } = await supabase
    .from("reward_codes")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("point_transaction_id", transactionId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/")
  return { success: true, message: "Ricompensa contrassegnata come evasa!" }
}
