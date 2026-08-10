-- ==============================================================================
-- SAFE SETTINGS & CENTRALIZED HEALTH PROFILE SCHEMA MIGRATION
-- ==============================================================================
-- Run this migration in the Supabase SQL Editor (https://app.supabase.com)
-- This script safely adds all 50 extended Health Profile columns to public.profiles.
-- It NEVER drops existing tables, NEVER deletes user records, and NEVER breaks RLS.
-- ==============================================================================

-- 1. PERSONAL & PHYSICAL DATA COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bmi numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation text;

-- 2. MEDICAL & HEALTH DATA COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_conditions text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medications text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medication_schedule text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS food_allergies text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS surgeries text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chronic_conditions text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_history text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pregnancy_status text;

-- 3. LIFESTYLE DATA COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smoking_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS alcohol_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stress_level_onboard numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_hours text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_schedule text;

-- 4. NUTRITION DATA COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS food_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_foods text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disliked_foods text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cuisine_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calorie_goal integer DEFAULT 2000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS protein_goal numeric DEFAULT 110;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS carb_goal numeric DEFAULT 225;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fat_goal numeric DEFAULT 65;

-- 5. SLEEP & RECOVERY COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_goal numeric DEFAULT 8.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wind_down_routine text;

-- 6. FITNESS & EXERCISE COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exercise_frequency text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workout_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_experience text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS step_goal integer DEFAULT 10000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS water_goal integer DEFAULT 2500;

-- 7. EMERGENCY CONTACT COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relation text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;

-- 8. AI PREFERENCES & COACHING COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_goal text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reminder_preferences text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_coach_style text DEFAULT 'supportive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit_system text DEFAULT 'Metric';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_mode text DEFAULT 'wellness';

-- 9. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 10. RE-APPLY RLS POLICIES SAFELY
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 11. NOTIFY POSTGREST TO RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
