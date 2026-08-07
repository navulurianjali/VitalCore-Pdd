-- Supabase DDL Migration Patch for Onboarding & Mode Selection
-- Adds medical_conditions, active_mode, is_auto_assigned_mode, and onboarding_completed columns to public.profiles

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS active_mode TEXT DEFAULT 'wellness',
ADD COLUMN IF NOT EXISTS is_auto_assigned_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Ensure indexes for mode querying
CREATE INDEX IF NOT EXISTS idx_profiles_active_mode ON public.profiles(active_mode);
