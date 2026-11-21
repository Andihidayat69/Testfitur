
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Register akun baru menggunakan email dan password.
 */
export async function signUp(
  email: string,
  password: string
) {
  return await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });
}

/**
 * Login menggunakan email dan password.
 */
export async function signIn(
  email: string,
  password: string
) {
  return await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

/**
 * Logout dari akun.
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * Mengambil sesi pengguna yang sedang aktif.
 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

/**
 * Memantau perubahan status autentikasi.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  return data.subscription;
}
