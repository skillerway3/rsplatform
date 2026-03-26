
-- Migration: Fix Support System Joins and Admin Access
-- Date: 2026-04-02

-- 1. Add explicit foreign keys from support_threads to profiles
-- This ensures PostgREST can join them correctly
ALTER TABLE public.support_threads
DROP CONSTRAINT IF EXISTS support_threads_user_id_fkey,
ADD CONSTRAINT support_threads_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.support_threads
DROP CONSTRAINT IF EXISTS support_threads_assigned_to_fkey,
ADD CONSTRAINT support_threads_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Add explicit foreign keys from support_messages to profiles
ALTER TABLE public.support_messages
DROP CONSTRAINT IF EXISTS support_messages_sender_id_fkey,
ADD CONSTRAINT support_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. Update the is_admin function to be more robust and fix profiles.email issue
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id
    AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND email = 'skillerway100@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure RLS for support_threads allows admins to see everything
DROP POLICY IF EXISTS "Admins can see all threads" ON public.support_threads;
CREATE POLICY "Admins can see all threads"
  ON public.support_threads
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 5. Ensure RLS for support_messages allows admins to see everything
DROP POLICY IF EXISTS "Admins can see all messages" ON public.support_messages;
CREATE POLICY "Admins can see all messages"
  ON public.support_messages
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));
