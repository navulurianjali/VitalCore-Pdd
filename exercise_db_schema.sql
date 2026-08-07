-- ============================================================
-- VitalCore: exercise_database Table
-- Run this in Supabase SQL Editor FIRST before migration
-- ============================================================

-- Enable UUID extension (safe if already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create exercise_database table
CREATE TABLE IF NOT EXISTS public.exercise_database (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id      TEXT,                          -- ExerciseDB API id (for dedup)
  title            TEXT        NOT NULL,
  description      TEXT,
  exercise_type    TEXT,                          -- Strength, Cardio, Stretching, Plyometrics, etc.
  body_part        TEXT        NOT NULL,          -- Abdominals, Chest, Quadriceps, etc.
  equipment        TEXT,                          -- Bodyweight, Dumbbell, Barbell, Cable, etc.
  level            TEXT,                          -- Beginner, Intermediate, Expert
  rating           NUMERIC,
  category         TEXT,                          -- Mapped category for app use
  primary_muscle   TEXT,
  secondary_muscles TEXT[],
  sets_recommended INTEGER,
  reps_recommended TEXT,
  rest_seconds     INTEGER,
  duration_seconds INTEGER,
  calories_estimate INTEGER,
  location         TEXT,                          -- Home, Gym, Both
  instructions     TEXT[],
  common_mistakes  TEXT[],
  benefits         TEXT[],
  gif_url          TEXT,
  source           TEXT        DEFAULT 'megagym', -- megagym | exercisedb
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.exercise_database ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all exercises (public exercise library)
DROP POLICY IF EXISTS "Authenticated users can read exercises" ON public.exercise_database;
CREATE POLICY "Authenticated users can read exercises"
  ON public.exercise_database
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow service role to insert/update (for migration + API caching)
DROP POLICY IF EXISTS "Service role can manage exercises" ON public.exercise_database;
CREATE POLICY "Service role can manage exercises"
  ON public.exercise_database
  FOR ALL
  USING (auth.role() = 'service_role');

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_exercise_body_part  ON public.exercise_database(body_part);
CREATE INDEX IF NOT EXISTS idx_exercise_equipment  ON public.exercise_database(equipment);
CREATE INDEX IF NOT EXISTS idx_exercise_level      ON public.exercise_database(level);
CREATE INDEX IF NOT EXISTS idx_exercise_category   ON public.exercise_database(category);
CREATE INDEX IF NOT EXISTS idx_exercise_source     ON public.exercise_database(source);
CREATE INDEX IF NOT EXISTS idx_exercise_type       ON public.exercise_database(exercise_type);

-- ============================================================
-- Patch existing workouts table with new columns
-- ============================================================
ALTER TABLE public.workouts
  ADD COLUMN IF NOT EXISTS exercises_completed JSONB,
  ADD COLUMN IF NOT EXISTS exercise_count      INTEGER,
  ADD COLUMN IF NOT EXISTS user_rating         INTEGER CHECK (user_rating >= 1 AND user_rating <= 5);

-- Fix intensity constraint to support all values used by the app
ALTER TABLE public.workouts DROP CONSTRAINT IF EXISTS workouts_intensity_check;
ALTER TABLE public.workouts
  ADD CONSTRAINT workouts_intensity_check
  CHECK (intensity IN ('low', 'medium', 'high', 'custom', 'light', 'moderate', 'intense'));

-- ============================================================
-- Verification query — run after migration
-- ============================================================
-- SELECT COUNT(*) FROM public.exercise_database;
-- SELECT body_part, COUNT(*) FROM public.exercise_database GROUP BY body_part ORDER BY 2 DESC;
