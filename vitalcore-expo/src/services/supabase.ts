import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://bevolemwakfozxuymxsn.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm9sZW13YWtmb3p4dXlteHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTUyNjUsImV4cCI6MjA5NTQ5MTI2NX0.ZRyBiaR7vhG8O2FEdPEQOBErLrSF5AxK_PASy87Odlk';

export const BASE_API_URL = 'https://vita-core-ai.vercel.app';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function checkSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (!error || error.code === 'PGRST116') {
      return { success: true, message: 'Supabase is online and reachable.' };
    }
    return { success: true, message: 'Supabase is online.' };
  } catch (err: any) {
    console.error('Supabase Network Reachability Error:', err);
    return { success: false, message: 'Network Connection Error. Please check your internet connection.' };
  }
}

