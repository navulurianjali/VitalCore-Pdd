-- COMPREHENSIVE HEALTH PROFILE & COMMUNITY CHALLENGES SCHEMA UPDATE

-- 1. ADD COMPREHENSIVE HEALTH PROFILE COLUMNS TO PROFILES TABLE
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT,
ADD COLUMN IF NOT EXISTS medications TEXT,
ADD COLUMN IF NOT EXISTS medication_schedule TEXT,
ADD COLUMN IF NOT EXISTS food_allergies TEXT,
ADD COLUMN IF NOT EXISTS family_history TEXT,
ADD COLUMN IF NOT EXISTS pregnancy_status TEXT DEFAULT 'N/A',
ADD COLUMN IF NOT EXISTS exercise_frequency TEXT DEFAULT '3-4 times/week',
ADD COLUMN IF NOT EXISTS fitness_experience TEXT DEFAULT 'Intermediate',
ADD COLUMN IF NOT EXISTS step_goal INTEGER DEFAULT 8000,
ADD COLUMN IF NOT EXISTS water_goal INTEGER DEFAULT 2500,
ADD COLUMN IF NOT EXISTS sleep_goal NUMERIC DEFAULT 8.0,
ADD COLUMN IF NOT EXISTS cuisine_preference TEXT DEFAULT 'South Indian',
ADD COLUMN IF NOT EXISTS calorie_goal INTEGER DEFAULT 2000,
ADD COLUMN IF NOT EXISTS protein_goal INTEGER DEFAULT 80,
ADD COLUMN IF NOT EXISTS carb_goal INTEGER DEFAULT 250,
ADD COLUMN IF NOT EXISTS fat_goal INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS smoking_status TEXT DEFAULT 'Never',
ADD COLUMN IF NOT EXISTS alcohol_status TEXT DEFAULT 'Occasional',
ADD COLUMN IF NOT EXISTS working_hours TEXT DEFAULT '8 hours/day',
ADD COLUMN IF NOT EXISTS sleep_schedule TEXT DEFAULT '22:30 - 06:30',
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT,
ADD COLUMN IF NOT EXISTS reminder_preferences TEXT DEFAULT 'Daily Morning & Evening',
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"push": true, "email": true}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_coach_style TEXT DEFAULT 'Supportive & Clinical',
ADD COLUMN IF NOT EXISTS unit_system TEXT DEFAULT 'Metric';

-- 2. ENABLE AUTHENTICATED INSERT POLICY FOR CHALLENGES TABLE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'challenges' 
        AND policyname = 'Authenticated users can insert challenges.'
    ) THEN
        CREATE POLICY "Authenticated users can insert challenges." ON public.challenges
            FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
END $$;
