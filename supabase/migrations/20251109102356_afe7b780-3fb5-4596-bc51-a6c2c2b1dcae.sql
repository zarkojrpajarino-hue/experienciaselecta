-- Fix 1: Enable RLS on login_tokens table
ALTER TABLE public.login_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage tokens (no user access)
-- This ensures tokens can only be accessed via edge functions
CREATE POLICY "Only service role can manage login tokens"
ON public.login_tokens
FOR ALL
USING (false);

-- Fix 2: Create secure user roles system

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can insert/update/delete roles (no user can assign themselves admin)
CREATE POLICY "Service role can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (false);

CREATE POLICY "Service role can update roles"
ON public.user_roles FOR UPDATE
USING (false);

CREATE POLICY "Service role can delete roles"
ON public.user_roles FOR DELETE
USING (false);

-- Create Security Definer Function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Drop insecure JWT-based admin policy
DROP POLICY IF EXISTS "Admin full access" ON public.review_reminders;

-- Create secure policy using the has_role function
CREATE POLICY "Admins can manage all reminders"
ON public.review_reminders
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));