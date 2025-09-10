// Database test utility
import { supabase } from '../integrations/supabase/client';

export const testDatabaseConnection = async () => {
  console.log('=== TESTING DATABASE CONNECTION ===');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Database test error:', err);
    return false;
  }
};

export const testProfileCreation = async (email: string) => {
  console.log('=== TESTING PROFILE CREATION FOR:', email, '===');
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ No authenticated user');
      return false;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Try to create profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: 'student'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Profile creation failed:', error);
      
      // If duplicate, try to fetch existing
      if (error.code === '23505') {
        console.log('🔄 Profile already exists, fetching...');
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) {
          console.error('❌ Failed to fetch existing profile:', fetchError);
          return false;
        }
        
        console.log('✅ Existing profile found:', existingProfile);
        return true;
      }
      
      return false;
    }
    
    console.log('✅ Profile created successfully:', profile);
    return true;
  } catch (err) {
    console.error('❌ Profile creation test error:', err);
    return false;
  }
};

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testDatabaseConnection = testDatabaseConnection;
  (window as any).testProfileCreation = testProfileCreation;
}
