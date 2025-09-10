import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  enrollment_no?: string;
  semester?: string;
  branch?: string;
  course?: string;
  role: 'admin' | 'student';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile for user:', session.user.id);
          // Fetch user profile with RLS bypass for debugging
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          console.log('Profile query result:', { profileData, error });
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            setProfile(null);
            toast({
              title: "Profile Error",
              description: `Failed to fetch user profile: ${error.message}`,
              variant: "destructive",
            });
          } else if (profileData) {
            console.log('Profile fetched successfully:', profileData);
            setProfile(profileData as Profile);
          } else {
            console.log('No profile found for user, attempting to create one...');
            
            // Try to create a profile for the user
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                user_id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: session.user.user_metadata?.role || 'student',
                enrollment_no: session.user.user_metadata?.enrollment_no || null,
                semester: session.user.user_metadata?.semester || null,
                branch: session.user.user_metadata?.branch || null,
                course: session.user.user_metadata?.course || null,
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Failed to create profile:', createError);
              
              // If it's a duplicate key error, try to fetch the existing profile
              if (createError.code === '23505') {
                console.log('Profile already exists, fetching it...');
                const { data: existingProfile, error: fetchError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('user_id', session.user.id)
                  .single();
                
                if (fetchError) {
                  console.error('Failed to fetch existing profile:', fetchError);
                  setProfile(null);
                  toast({
                    title: "Profile Error",
                    description: "Could not load your profile. Please contact support.",
                    variant: "destructive",
                  });
                } else {
                  console.log('Existing profile fetched:', existingProfile);
                  setProfile(existingProfile as Profile);
                }
              } else {
                setProfile(null);
                toast({
                  title: "Profile Creation Failed",
                  description: `Could not create profile: ${createError.message}`,
                  variant: "destructive",
                });
              }
            } else {
              console.log('Profile created successfully:', newProfile);
              setProfile(newProfile as Profile);
            }
          }
        } else {
          console.log('No user session, clearing profile');
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', session?.user?.id);
      // The auth state change listener will handle the rest
    };
    
    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      console.log('Starting user registration for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role,
            enrollment_no: userData.enrollmentNo,
            semester: userData.semester,
            branch: userData.branch,
            course: userData.course,
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      console.log('User created successfully:', data.user?.id);
      
      // Don't try to create profile immediately - let the auth state change handle it
      // This prevents issues with timing and authentication state
      console.log('Registration completed, profile will be created on login');
      
      return { error: null };
    } catch (error) {
      console.error('Signup catch error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign in successful');
      }
      
      return { error };
    } catch (error) {
      console.error('Sign in catch error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('user_id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, ...data });
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};