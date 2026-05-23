import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btjscudzrtarfommgegw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface User {
  id: string
  email: string
  role: 'owner' | 'customer'
}

export async function signUp(email: string, password: string, role: 'owner' | 'customer' = 'customer') {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    return { error }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error: any) {
    return { user: null, error }
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return { session, error: null }
  } catch (error: any) {
    return { session: null, error }
  }
}
