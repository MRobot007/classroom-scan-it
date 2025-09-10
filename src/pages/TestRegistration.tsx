import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TestRegistration = () => {
  const [testData, setTestData] = useState({
    email: 'test@example.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'student'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const runTest = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      console.log('=== TESTING REGISTRATION PROCESS ===');
      
      // Step 1: Create user
      console.log('Step 1: Creating user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testData.email,
        password: testData.password,
        options: {
          data: {
            full_name: testData.fullName,
            role: testData.role,
          }
        }
      });

      if (authError) {
        setTestResults({
          success: false,
          step: 'User Creation',
          error: authError.message
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ User created:', authData.user?.id);

      // Step 2: Wait and create profile
      console.log('Step 2: Creating profile...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user!.id,
          full_name: testData.fullName,
          email: testData.email,
          role: testData.role,
        })
        .select()
        .single();

      if (profileError) {
        console.log('Profile creation failed:', profileError);
        
        if (profileError.code === '23505') {
          // Profile already exists, fetch it
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', authData.user!.id)
            .single();
          
          if (fetchError) {
            setTestResults({
              success: false,
              step: 'Profile Creation',
              error: `Profile exists but couldn't fetch: ${fetchError.message}`
            });
          } else {
            setTestResults({
              success: true,
              step: 'Profile Found',
              message: 'Profile already exists and was found',
              profile: existingProfile
            });
          }
        } else {
          setTestResults({
            success: false,
            step: 'Profile Creation',
            error: profileError.message
          });
        }
      } else {
        console.log('✅ Profile created:', profile);
        setTestResults({
          success: true,
          step: 'Complete',
          message: 'User and profile created successfully',
          profile: profile
        });
      }

      // Step 3: Test login
      console.log('Step 3: Testing login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testData.email,
        password: testData.password
      });

      if (loginError) {
        setTestResults(prev => ({
          ...prev,
          loginError: loginError.message
        }));
      } else {
        console.log('✅ Login successful');
        setTestResults(prev => ({
          ...prev,
          loginSuccess: true
        }));
      }

    } catch (err) {
      console.error('Test error:', err);
      setTestResults({
        success: false,
        step: 'Unknown',
        error: 'Unexpected error occurred'
      });
    }
    
    setIsLoading(false);
  };

  const cleanupTest = async () => {
    try {
      // Sign out
      await supabase.auth.signOut();
      
      // Delete test user (this would require admin privileges)
      toast({
        title: "Cleanup",
        description: "Test user signed out. Manual cleanup may be needed.",
        variant: "default",
      });
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TestTube className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Registration Test
            </h1>
          </div>
          <p className="text-muted-foreground">Test the complete registration and login process</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Test Registration Flow</CardTitle>
            <CardDescription>
              This will test user creation, profile creation, and login
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Data Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Test Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={testData.email}
                  onChange={(e) => setTestData({ ...testData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Test Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={testData.password}
                  onChange={(e) => setTestData({ ...testData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={testData.fullName}
                  onChange={(e) => setTestData({ ...testData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={testData.role}
                  onChange={(e) => setTestData({ ...testData, role: e.target.value })}
                />
              </div>
            </div>

            {/* Test Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={runTest} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Run Test
              </Button>
              <Button 
                onClick={cleanupTest} 
                variant="outline"
                disabled={isLoading}
              >
                Cleanup
              </Button>
            </div>

            {/* Test Results */}
            {testResults && (
              <Alert className={testResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center space-x-2">
                  {testResults.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={testResults.success ? "text-green-800" : "text-red-800"}>
                    <div>
                      <strong>Step:</strong> {testResults.step}
                    </div>
                    {testResults.message && (
                      <div><strong>Message:</strong> {testResults.message}</div>
                    )}
                    {testResults.error && (
                      <div><strong>Error:</strong> {testResults.error}</div>
                    )}
                    {testResults.loginSuccess && (
                      <div className="text-green-600">✅ Login test passed</div>
                    )}
                    {testResults.loginError && (
                      <div className="text-red-600">❌ Login failed: {testResults.loginError}</div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="text-center">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestRegistration;
