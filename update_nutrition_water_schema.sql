-- Migration SQL to patch nutrition_logs and hydration_logs for Real-time Water & Food Logging
ALTER TABLE public.nutrition_logs 
  ADD COLUMN IF NOT EXISTS serving_size text DEFAULT '1 portion',
  ADD COLUMN IF NOT EXISTS fiber_g numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sugar_g numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sodium_mg numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vitamins text[],
  ADD COLUMN IF NOT EXISTS minerals text[],
  ADD COLUMN IF NOT EXISTS micros jsonb DEFAULT '{}'::jsonb;

-- Remove legacy meal_type check constraint if present to allow flexible meal types
ALTER TABLE public.nutrition_logs DROP CONSTRAINT IF EXISTS nutrition_logs_meal_type_check;

-- Ensure Realtime publication includes hydration_logs and nutrition_logs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hydration_logs;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.nutrition_logs;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Table may already be in publication or publication may not exist yet
  NULL;
END $$;
