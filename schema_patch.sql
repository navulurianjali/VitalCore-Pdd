-- SAFE SCHEMA PATCH (Run this instead of the full schema.sql)
-- This only drops and recreates the necessary policies, avoiding table creation errors.

-- 1. Fix VULN-14: Remove open challenges insert
DROP POLICY IF EXISTS "Authenticated users can insert challenges" ON public.challenges;

-- Ensure the contact_inquiries table exists before applying policies
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    name text not null,
    email text not null,
    message text not null,
    status text default 'pending'
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 2. Fix VULN-08: Change contact_inquiries to authenticated-only inserts
DROP POLICY IF EXISTS "Anyone can insert inquiries." ON public.contact_inquiries;
DROP POLICY IF EXISTS "Authenticated users can insert inquiries." ON public.contact_inquiries;
DROP POLICY IF EXISTS "Users can view their own inquiries." ON public.contact_inquiries;

-- Then add the corrected policy:
CREATE POLICY "Authenticated users can insert inquiries." ON public.contact_inquiries
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view their own inquiries." ON public.contact_inquiries
    FOR SELECT USING (auth.uid() = user_id);
