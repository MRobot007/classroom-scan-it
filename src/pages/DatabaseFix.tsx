import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DatabaseFix = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        setTestResults({ success: false, error: error.message });
      } else {
        setTestResults({ success: true, message: 'Database connection successful' });
      }
    } catch (err) {
      setTestResults({ success: false, error: 'Connection failed' });
    }
    setIsLoading(false);
  };

  const createProfile = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, try to sign in as the user to get their ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please log in first to create a profile",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Try to create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || email,
          role: 'student'
        })
        .select()
        .single();

      if (profileError) {
        if (profileError.code === '23505') {
          // Profile already exists, fetch it
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (fetchError) {
            toast({
              title: "Error",
              description: `Failed to fetch existing profile: ${fetchError.message}`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Profile Found",
              description: "Profile already exists and was loaded successfully",
              variant: "default",
            });
          }
        } else {
          toast({
            title: "Error",
            description: `Failed to create profile: ${profileError.message}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Profile created successfully!",
          variant: "default",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Database Fix
            </h1>
          </div>
          <p className="text-muted-foreground">Fix database issues and create missing profiles</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle>Database Tools</CardTitle>
            <CardDescription>
              Test database connection and create missing profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connection Test */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Database Connection</h3>
              <Button 
                onClick={testConnection} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Database className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
              
              {testResults && (
                <Alert className={testResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <div className="flex items-center space-x-2">
                    {testResults.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={testResults.success ? "text-green-800" : "text-red-800"}>
                      {testResults.success ? testResults.message : testResults.error}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>

            {/* Profile Creation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create Missing Profile</h3>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={createProfile} 
                disabled={isLoading || !email}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Create Profile
              </Button>
            </div>

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

export default DatabaseFix;
