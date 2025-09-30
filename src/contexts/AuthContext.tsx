import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { UserProfile, AuthState } from '@/types/auth';

export interface OnboardingAnswers {
  documentTypes?: string;
  mainGoal?: string;
  analysisFrequency?: string;
  selectedPlanId?: string;
  interestedTools?: string[];
}
// Create the auth context
export const AuthContext = createContext<{
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<User | null | undefined>;
  updateUserOnboardingData: (onboardingAnswers: OnboardingAnswers) => Promise<void>;
  isAppSumoUser: boolean;
  isDealifyUser: boolean;
}>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => undefined,
  updateUserOnboardingData: async () => {},
  isAppSumoUser: false,
  isDealifyUser: false,
});

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Check if the user is an AppSumo user
  const isAppSumoUser = !!authState.user?.user_metadata?.is_appsumo_user;
  const isDealifyUser = !!authState.user?.user_metadata?.is_dealify_user;

  useEffect(() => {
    // Get the initial session
    const getInitialSession = async () => {
      try {
        const session = await authService.getSession();
        
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          setAuthState({
            user: user as UserProfile,
            session,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error as Error,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          setAuthState({
            user: user as UserProfile,
            session,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const { user, session } = await authService.loginUser({ email, password });
      setAuthState({
        user: user as UserProfile,
        session,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing in:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setAuthState(prev => ({
        ...prev,
        user: data.user as UserProfile,
        session: data.session,
        loading: false,
      }));

      return data.user;
    } catch (error) {
      console.error('Error signing up:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  const updateUserOnboardingData = async (onboardingAnswers: OnboardingAnswers) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          ...onboardingAnswers,
        },
      });

      if (error) {
        throw error;
      }

      setAuthState(prev => ({
        ...prev,
        user: data.user as UserProfile,
        loading: false,
      }));
    } catch (error) {
      console.error('Error updating user onboarding data:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signOut();
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  // Context value
  const value = {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signOut,
    signUp,
    updateUserOnboardingData,
    isAppSumoUser,
    isDealifyUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};