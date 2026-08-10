-- ==============================================================================
-- VITALCORE DATE-BASED DAILY HEALTH TRACKING & HISTORY MIGRATION
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- This script creates the daily_health_summary table and habit_logs table with
-- strict UNIQUE(user_id, date) constraints and Row Level Security (RLS).
-- ==============================================================================

-- 1. Create daily_health_summary table with UNIQUE(user_id, date)
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.daily_health_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own daily health summary" ON public.daily_health_summary;
CREATE POLICY "Users can manage their own daily health summary" ON public.daily_health_summary
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_daily_health_summary_user_date ON public.daily_health_summary (user_id, date);

-- 2. Add date columns to existing log tables if missing, and create indexes on (user_id, date)
ALTER TABLE public.hydration_logs ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;
ALTER TABLE public.fatigue_logs ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;
ALTER TABLE public.mood_tracking ADD COLUMN IF NOT EXISTS date date DEFAULT current_date NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nutrition_logs_user_date ON public.nutrition_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date ON public.hydration_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts (user_id, date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_date ON public.sleep_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_recovery_scores_user_date ON public.recovery_scores (user_id, date);

-- 3. Habit logs table to record daily completed habits
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    habit_id uuid REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
    date date DEFAULT current_date NOT NULL,
    completed boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_habit_date UNIQUE (user_id, habit_id, date)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can manage their own habit logs" ON public.habit_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON public.habit_logs (user_id, date);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
