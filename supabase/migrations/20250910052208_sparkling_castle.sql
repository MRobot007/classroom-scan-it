/*
  # Fix infinite recursion in profiles RLS policy

  1. Problem
    - The "Admins can view all profiles" policy causes infinite recursion
    - It queries the profiles table from within a profiles table policy
    
  2. Solution
    - Drop the problematic policies
    - Create a SECURITY DEFINER function to safely check admin status
    - Create a single comprehensive SELECT policy using the function
    
  3. Security
    - Maintains same access control: users see own profile, admins see all
    - Prevents infinite recursion by using SECURITY DEFINER function
*/

-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a SECURITY DEFINER function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Create a single comprehensive SELECT policy
CREATE POLICY "Users can view own profile or admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR public.is_admin()
);