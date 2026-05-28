import { createClient } from "@supabase/supabase-js";

// Resilient fallback URLs to prevent Next.js prerendering crashes during Vercel builds
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Supabase is the primary and exclusive database source
export const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ VitalCore warning: Supabase URL or Anon Key is missing from your environment variables. Please check your .env.local configuration."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

