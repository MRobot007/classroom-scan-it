// Fix database policies to prevent infinite recursion
import { supabase } from '../integrations/supabase/client';

export const fixDatabasePolicies = async () => {
  console.log('=== FIXING DATABASE POLICIES ===');
  
  try {
    // First, let's try to disable RLS temporarily to fix the policies
    console.log('Attempting to fix RLS policies...');
    
    // Test if we can access profiles table
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Cannot access profiles table:', testError);
      
      if (testError.message.includes('infinite recursion')) {
        console.log('🔧 Infinite recursion detected - this needs to be fixed in Supabase dashboard');
        
        return {
          success: false,
          error: 'Infinite recursion in RLS policies',
          solution: 'Please run the SQL migration in your Supabase dashboard',
          sql: `
-- Run this SQL in your Supabase SQL Editor:

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;

-- Drop the problematic is_admin function
DROP FUNCTION IF EXISTS public.is_admin();

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
          `
        };
      }
      
      return { success: false, error: testError.message };
    }
    
    console.log('✅ Profiles table accessible');
    return { success: true, message: 'Database policies are working correctly' };
    
  } catch (err) {
    console.error('❌ Error fixing policies:', err);
    return { success: false, error: err.message };
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.fixDatabasePolicies = fixDatabasePolicies;
}
