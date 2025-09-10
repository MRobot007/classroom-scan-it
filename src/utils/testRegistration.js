// Simple registration test
import { supabase } from '../integrations/supabase/client';

export const testSimpleRegistration = async () => {
  console.log('=== TESTING SIMPLE REGISTRATION ===');
  
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';
  
  try {
    console.log('Creating user with email:', testEmail);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'student'
        }
      }
    });
    
    if (error) {
      console.error('❌ Registration failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ User created successfully:', data.user?.id);
    console.log('✅ Registration completed');
    
    return { 
      success: true, 
      message: 'Registration successful!',
      user: data.user,
      email: testEmail,
      password: testPassword
    };
    
  } catch (err) {
    console.error('❌ Registration error:', err);
    return { success: false, error: err.message };
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.testSimpleRegistration = testSimpleRegistration;
}
