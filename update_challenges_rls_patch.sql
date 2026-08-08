-- ==============================================================================
-- SAFE CHALLENGES RLS & SCHEMA MIGRATION PATCH
-- ==============================================================================

-- 1. Ensure created_by column exists on public.challenges (optional metadata)
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- 3. READ POLICY: All authenticated users can view challenges library
DROP POLICY IF EXISTS "Anyone can read challenges." ON public.challenges;
CREATE POLICY "Anyone can read challenges." ON public.challenges
    for SELECT TO authenticated USING (true);

-- 4. INSERT POLICY: Authenticated users can create challenges
DROP POLICY IF EXISTS "Authenticated users can insert challenges" ON public.challenges;
CREATE POLICY "Authenticated users can insert challenges" ON public.challenges
    for INSERT TO authenticated WITH CHECK (true);

-- 5. USER_CHALLENGES RLS: Individual user ownership
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their joined challenges." ON public.user_challenges;
CREATE POLICY "Users can manage their joined challenges." ON public.user_challenges
    for ALL USING (auth.uid() = user_id);

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
