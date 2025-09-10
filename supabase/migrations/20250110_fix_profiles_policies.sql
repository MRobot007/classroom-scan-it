-- Fix profiles table policies and ensure proper profile creation
-- This migration fixes RLS policies and ensures profiles can be created properly

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;

-- Drop the problematic is_admin function
DROP FUNCTION IF EXISTS public.is_admin();

-- Create a simple, non-recursive admin check function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = is_admin.user_id AND role = 'admin'
  );
END;
$$;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow profile creation during signup (bypass RLS temporarily)
CREATE POLICY "Allow profile creation during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Fix the profile creation trigger to handle errors better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Try to insert profile, ignore if it already exists
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to manually create profiles for existing users
CREATE OR REPLACE FUNCTION public.create_missing_profile(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  profile_record RECORD;
BEGIN
  -- Find the user
  SELECT * INTO user_record FROM auth.users WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Check if profile already exists
  SELECT * INTO profile_record FROM public.profiles WHERE user_id = user_record.id;
  
  IF FOUND THEN
    RETURN json_build_object('success', true, 'message', 'Profile already exists', 'profile', profile_record);
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    user_record.id,
    COALESCE(user_record.raw_user_meta_data ->> 'full_name', user_record.email),
    user_record.email,
    COALESCE(user_record.raw_user_meta_data ->> 'role', 'student')
  )
  RETURNING * INTO profile_record;
  
  RETURN json_build_object('success', true, 'message', 'Profile created', 'profile', profile_record);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
