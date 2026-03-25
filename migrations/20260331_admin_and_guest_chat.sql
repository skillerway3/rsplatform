-- 1. Set bootstrap admin
UPDATE public.profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'skillerway100@gmail.com'
);

-- 2. Ensure avatars bucket is public and has correct policies
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- 3. RPC for guest chat messages
-- This allows guests to fetch their messages without complex RLS
CREATE OR REPLACE FUNCTION public.get_guest_messages(p_thread_id uuid, p_guest_session_id text)
RETURNS TABLE (
  id uuid,
  thread_id uuid,
  sender_id uuid,
  sender_type text,
  content text,
  is_read boolean,
  created_at timestamptz,
  sender_username text,
  sender_avatar_url text
) AS $$
BEGIN
  -- Verify the thread belongs to this guest session
  IF EXISTS (
    SELECT 1 FROM public.support_threads 
    WHERE id = p_thread_id AND guest_session_id = p_guest_session_id
  ) THEN
    RETURN QUERY
    SELECT 
      m.id,
      m.thread_id,
      m.sender_id,
      m.sender_type,
      m.content,
      m.is_read,
      m.created_at,
      p.username as sender_username,
      p.avatar_url as sender_avatar_url
    FROM public.support_messages m
    LEFT JOIN public.profiles p ON m.sender_id = p.id
    WHERE m.thread_id = p_thread_id
    ORDER BY m.created_at ASC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC for guest to check for open thread
CREATE OR REPLACE FUNCTION public.get_guest_open_thread(p_guest_email text, p_guest_session_id text)
RETURNS TABLE (id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id
  FROM public.support_threads t
  WHERE t.status = 'open' 
    AND (t.guest_email = p_guest_email OR t.guest_session_id = p_guest_session_id)
  ORDER BY t.last_message_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update RLS for support_threads to be more permissive for INSERT by guests
-- (Already mostly correct, but let's ensure it)
DROP POLICY IF EXISTS "Anyone can create support threads" ON public.support_threads;
CREATE POLICY "Anyone can create support threads" ON public.support_threads FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.uid() IS NULL AND guest_session_id IS NOT NULL)
);

-- 6. Allow guests to update their own threads (last_message_at)
DROP POLICY IF EXISTS "Guests can update own threads" ON public.support_threads;
CREATE POLICY "Guests can update own threads" ON public.support_threads FOR UPDATE USING (
  guest_session_id IS NOT NULL AND guest_session_id = (current_setting('request.headers', true)::json->>'x-guest-session-id')
) WITH CHECK (
  guest_session_id IS NOT NULL AND guest_session_id = (current_setting('request.headers', true)::json->>'x-guest-session-id')
);

-- Note: The header-based RLS might still be tricky depending on Supabase config.
-- Using RPCs for SELECT is more reliable for guests.
