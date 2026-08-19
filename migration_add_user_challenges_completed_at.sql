-- Add completed_at column to public.user_challenges if not already existing
ALTER TABLE public.user_challenges ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Ensure RLS policies allow users to manage their challenges
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their joined challenges." ON public.user_challenges;

CREATE POLICY "Users can manage their joined challenges." ON public.user_challenges
    FOR ALL USING (auth.uid() = user_id);

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
