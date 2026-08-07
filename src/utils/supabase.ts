import { createBrowserClient } from "@supabase/ssr";

// Primary shared Supabase credentials connecting Web App and Expo React Native App
export const SHARED_SUPABASE_URL = "https://bevolemwakfozxuymxsn.supabase.co";
export const SHARED_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJldm9sZW13YWtmb3p4dXlteHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTUyNjUsImV4cCI6MjA5NTQ5MTI2NX0.ZRyBiaR7vhG8O2FEdPEQOBErLrSF5AxK_PASy87Odlk";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SHARED_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SHARED_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = true;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
