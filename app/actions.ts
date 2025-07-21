"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const supabase = createClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

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

  // Inserisci il nome nella tabella dei profili
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        name: name,
        email: email, // Salva anche l'email nel profilo per coerenza
      },
      { onConflict: "id" },
    )

    if (profileError) {
      console.error("Errore durante l'inserimento del profilo:", profileError.message)
      // Potresti voler gestire questo errore in modo diverso, ad esempio eliminando l'utente appena creato
      return { success: false, message: profileError.message || "Errore durante la creazione del profilo utente." }
    }
  }

  revalidatePath("/")
  return { success: true, message: "Registrazione avvenuta con successo! Controlla la tua email per la conferma." }
}

export async function signIn(formData: FormData) {
  const supabase = createClient()

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
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Errore durante il logout:", error.message)
    return { success: false, message: error.message || "Errore durante il logout." }
  }

  revalidatePath("/")
  redirect("/")
}

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, email, points, is_admin")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("Errore nel recupero del profilo:", profileError.message)
    return {
      id: user.id,
      email: user.email,
      name: user.email, // Fallback al nome utente se il profilo non è disponibile
      points: 0,
      isAdmin: false,
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email,
    points: profile?.points || 0,
    isAdmin: profile?.is_admin || false,
  }
}

export async function addPoints(userId: string, points: number) {
  const supabase = createClient()
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single()

  if (fetchError || !profile) {
    console.error("Errore nel recupero dei punti utente:", fetchError?.message)
    return { success: false, message: "Utente non trovato o errore nel recupero dei punti." }
  }

  const newPoints = profile.points + points
  const { error: updateError } = await supabase.from("profiles").update({ points: newPoints }).eq("id", userId)

  if (updateError) {
    console.error("Errore nell'aggiornamento dei punti:", updateError.message)
    return { success: false, message: "Errore nell'aggiornamento dei punti." }
  }

  revalidatePath("/dashboard")
  return { success: true, message: `Aggiunti ${points} punti all'utente.` }
}

export async function redeemReward(userId: string, rewardCode: string) {
  const supabase = createClient()

  // 1. Verifica l'esistenza e la validità del codice premio
  const { data: reward, error: rewardError } = await supabase
    .from("reward_codes")
    .select("id, points_cost, is_redeemed")
    .eq("code", rewardCode)
    .single()

  if (rewardError || !reward) {
    console.error("Errore nel recupero del codice premio:", rewardError?.message)
    return { success: false, message: "Codice premio non valido o non trovato." }
  }

  if (reward.is_redeemed) {
    return { success: false, message: "Questo codice premio è già stato riscattato." }
  }

  // 2. Recupera i punti dell'utente
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("points")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    console.error("Errore nel recupero del profilo utente:", profileError?.message)
    return { success: false, message: "Errore nel recupero dei punti utente." }
  }

  // 3. Controlla se l'utente ha abbastanza punti
  if (profile.points < reward.points_cost) {
    return { success: false, message: "Punti insufficienti per riscattare questo premio." }
  }

  // 4. Aggiorna i punti dell'utente e segna il codice come riscattato in una transazione
  const { error: transactionError } = await supabase.rpc("redeem_reward_transaction", {
    p_user_id: userId,
    p_reward_code_id: reward.id,
    p_points_cost: reward.points_cost,
  })

  if (transactionError) {
    console.error("Errore durante il riscatto del premio:", transactionError.message)
    return { success: false, message: transactionError.message || "Errore durante il riscatto del premio." }
  }

  revalidatePath("/dashboard")
  return { success: true, message: `Premio riscattato con successo! Hai speso ${reward.points_cost} punti.` }
}

export async function generateRewardCode(pointsCost: number) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("generate_reward_code", { p_points_cost: pointsCost })

  if (error) {
    console.error("Errore nella generazione del codice premio:", error.message)
    return { success: false, message: error.message || "Errore nella generazione del codice premio." }
  }

  return { success: true, message: "Codice premio generato con successo!", code: data }
}
