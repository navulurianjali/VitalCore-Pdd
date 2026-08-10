-- ==============================================================================
-- VITALCORE AI CONVERSATIONS DAILY FRESH & PERSISTENT HISTORY MIGRATION
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (https://app.supabase.com)
-- Adds conversation_date column to ai_conversations table, indexes (user_id, conversation_date, created_at),
-- and enforces Row Level Security (RLS) for multi-tenant data isolation.
-- ==============================================================================

-- 1. Add conversation_date column if not present
ALTER TABLE public.ai_conversations 
ADD COLUMN IF NOT EXISTS conversation_date date DEFAULT (CURRENT_DATE) NOT NULL;

-- 2. Backfill existing rows from created_at timestamp
UPDATE public.ai_conversations 
SET conversation_date = (created_at AT TIME ZONE 'UTC')::date 
WHERE conversation_date IS NULL;

-- 3. Composite Index for optimized daily retrieval
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_date_created 
ON public.ai_conversations (user_id, conversation_date, created_at);

-- 4. Verify & Enable Row Level Security (RLS)
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own AI conversations." ON public.ai_conversations;
CREATE POLICY "Users can manage their own AI conversations." 
ON public.ai_conversations
FOR ALL 
USING (auth.uid() = user_id);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
