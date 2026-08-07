-- ============================================================
-- VitalCore: Add blood_group & date_of_birth to public.profiles
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS blood_group TEXT;
