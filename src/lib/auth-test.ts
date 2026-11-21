
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Supabase connection error:', error.message);
    return false;
  }

  console.log('Supabase Auth initialized successfully.');
  console.log('Active session:', data.session ? 'Yes' : 'No');

  return true;
}
