-- ==============================================================================
-- VITALCORE CANONICAL DATABASE SCHEMA MIGRATION & RLS REPAIR
-- ==============================================================================
-- Project: VitalCore AI (Web + Expo React Native)
-- Target: Supabase PostgreSQL (bevolemwakfozxuymxsn)
-- Instructions: Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- This script safely updates table columns, constraints, and Row Level Security.
-- It NEVER drops existing data or tables.
-- ==============================================================================

-- 1. EXTENDED PROFILES TABLE COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blood_group text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bmi numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS body_fat_estimate numeric;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medical_conditions text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medications text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS medication_schedule text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allergies text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS food_allergies text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS surgeries text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chronic_conditions text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_history text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pregnancy_status text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS smoking_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS alcohol_status text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stress_level_onboard numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS working_hours text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_schedule text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wind_down_routine text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS food_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favorite_foods text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disliked_foods text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cuisine_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calorie_goal integer DEFAULT 2000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS protein_goal numeric DEFAULT 110;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS carb_goal numeric DEFAULT 225;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fat_goal numeric DEFAULT 65;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_goal numeric DEFAULT 8.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS water_goal integer DEFAULT 2500;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS step_goal integer DEFAULT 10000;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exercise_frequency text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workout_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_experience text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workout_duration_preference integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_workout_time text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_gym_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_injuries text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mobility_limitations text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_problems boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_preferences text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS meal_timing_habits text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS caffeine_intake text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wearable_synced boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS anxiety_rating integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS motivation_level integer DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS screen_time_hours numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sitting_hours numeric;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relation text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_goal text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reminder_preferences text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ai_coach_style text DEFAULT 'supportive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit_system text DEFAULT 'Metric';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_mode text DEFAULT 'wellness';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS soreness_level integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS biological_age numeric;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stability_score numeric DEFAULT 100;


-- 2. ADD DATE COLUMNS TO GRANULAR LOG TABLES
ALTER TABLE public.hydration_logs ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;
ALTER TABLE public.fatigue_logs ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;
ALTER TABLE public.mood_tracking ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS conversation_date date DEFAULT current_date NOT NULL;

-- Create indexes for date-filtered performance
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date ON public.hydration_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON public.nutrition_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts (user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_recovery_scores_user_date ON public.recovery_scores (user_id, date);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_date ON public.ai_conversations (user_id, conversation_date);


-- 3. CREATE DAILY HEALTH SUMMARY TABLE
CREATE TABLE IF NOT EXISTS public.daily_health_summary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    calories_consumed integer DEFAULT 0,
    calorie_goal integer DEFAULT 2000,
    protein_g numeric DEFAULT 0,
    protein_goal numeric DEFAULT 110,
    carbs_g numeric DEFAULT 0,
    carbs_goal numeric DEFAULT 225,
    fat_g numeric DEFAULT 0,
    fat_goal numeric DEFAULT 65,
    water_ml integer DEFAULT 0,
    water_goal_ml integer DEFAULT 2500,
    workout_minutes integer DEFAULT 0,
    workout_goal_minutes integer DEFAULT 30,
    steps integer DEFAULT 0,
    steps_goal integer DEFAULT 10000,
    sleep_hours numeric DEFAULT 0,
    sleep_goal_hours numeric DEFAULT 8.0,
    habit_completion numeric DEFAULT 0,
    overall_goal_completion numeric DEFAULT 0,
    mood text DEFAULT 'neutral',
    stress_level integer DEFAULT 0,
    recovery_percentage integer DEFAULT 0,
    has_data boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_daily_summary UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_health_summary_user_date ON public.daily_health_summary (user_id, date);


-- 4. CREATE HABIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    date date DEFAULT current_date NOT NULL,
    completed boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_habit_date UNIQUE (user_id, habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs (user_id, date);


-- 5. ROW LEVEL SECURITY (RLS) POLICIES AUDIT & REPAIR

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Hydration Logs RLS
ALTER TABLE public.hydration_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own hydration logs." ON public.hydration_logs;
CREATE POLICY "Users can manage their own hydration logs." ON public.hydration_logs FOR ALL USING (auth.uid() = user_id);

-- Nutrition Logs RLS
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own nutrition logs." ON public.nutrition_logs;
CREATE POLICY "Users can manage their own nutrition logs." ON public.nutrition_logs FOR ALL USING (auth.uid() = user_id);

-- Workouts RLS
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own workouts." ON public.workouts;
CREATE POLICY "Users can manage their own workouts." ON public.workouts FOR ALL USING (auth.uid() = user_id);

-- Sleep Logs RLS
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own sleep logs." ON public.sleep_logs;
CREATE POLICY "Users can manage their own sleep logs." ON public.sleep_logs FOR ALL USING (auth.uid() = user_id);

-- Recovery Scores RLS
ALTER TABLE public.recovery_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own recovery scores." ON public.recovery_scores;
CREATE POLICY "Users can manage their own recovery scores." ON public.recovery_scores FOR ALL USING (auth.uid() = user_id);

-- Fatigue Logs RLS
ALTER TABLE public.fatigue_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own fatigue logs." ON public.fatigue_logs;
CREATE POLICY "Users can manage their own fatigue logs." ON public.fatigue_logs FOR ALL USING (auth.uid() = user_id);

-- Mood Tracking RLS
ALTER TABLE public.mood_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own mood tracking." ON public.mood_tracking;
CREATE POLICY "Users can manage their own mood tracking." ON public.mood_tracking FOR ALL USING (auth.uid() = user_id);

-- Daily Health Summary RLS
ALTER TABLE public.daily_health_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own daily health summary" ON public.daily_health_summary;
CREATE POLICY "Users can manage their own daily health summary" ON public.daily_health_summary FOR ALL USING (auth.uid() = user_id);

-- Habit Logs RLS
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can manage their own habit logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);

-- User Challenges RLS
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their joined challenges." ON public.user_challenges;
CREATE POLICY "Users can manage their joined challenges." ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

-- AI Conversations RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own AI conversations." ON public.ai_conversations;
CREATE POLICY "Users can manage their own AI conversations." ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);


-- 6. REFRESH POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
