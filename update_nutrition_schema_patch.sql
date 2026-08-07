-- ============================================================
-- VitalCore: nutrition_logs Schema Patch
-- Adds optional nutrition columns to public.nutrition_logs
-- ============================================================

ALTER TABLE public.nutrition_logs
  ADD COLUMN IF NOT EXISTS serving_size TEXT DEFAULT '100g',
  ADD COLUMN IF NOT EXISTS fiber_g NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sugar_g NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sodium_mg NUMERIC DEFAULT 0;
