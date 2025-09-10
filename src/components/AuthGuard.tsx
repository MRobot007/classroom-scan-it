import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'student';
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AuthGuard - user:', user?.id, 'profile:', profile?.role, 'loading:', loading, 'requiredRole:', requiredRole);
    
    if (loading) {
      console.log('AuthGuard - Still loading...');
      return;
    }

    if (!user) {
      console.log('AuthGuard - No user, redirecting to login');
      navigate('/login');
      return;
    }

    if (!profile) {
      console.log('AuthGuard - User exists but no profile, redirecting to login');
      toast({
        title: "Authentication Error",
        description: "Your profile could not be loaded. Please try logging in again.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (requiredRole && profile.role !== requiredRole) {
      console.log('AuthGuard - Wrong role, redirecting to appropriate dashboard');
      toast({
        title: "Access Denied",
        description: `You don't have permission to access this page.`,
        variant: "destructive",
      });
      
      // Redirect to appropriate dashboard based on user's actual role
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
      return;
    }

    console.log('AuthGuard - Access granted');
  }, [user, profile, loading, requiredRole, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && profile.role !== requiredRole) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

export default AuthGuard;
