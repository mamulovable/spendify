import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

// Define a type for the onboarding data
export interface OnboardingAnswers {
  documentTypes?: string;
  mainGoal?: string;
  analysisFrequency?: string;
  interestedTools?: string[];
  selectedPlanId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  updateUserOnboardingData: (onboardingData: OnboardingAnswers) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Sign In Error",
        description: error.message || "Failed to sign in. Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      // Options can be added here if needed in the future, like initial metadata
    });
    if (error) {
      toast({
        title: "Sign Up Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
    // The user object might be immediately available in data.user
    // Or we rely on onAuthStateChange to update the user state
    return data.user; // Return the user object or null
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Error",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Function to update user's onboarding data in user_metadata
  const updateUserOnboardingData = async (onboardingData: OnboardingAnswers) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { onboarding_completed: true, ...onboardingData } // Store under user_metadata.data
    });

    if (error) {
      toast({
        title: "Onboarding Error",
        description: error.message || "Failed to save onboarding information.",
        variant: "destructive",
      });
      throw error;
    }
    // Optionally update local user state if needed, though onAuthStateChange might handle it if metadata updates trigger it.
    // setUser(data.user); 
    toast({
      title: "Onboarding Complete!",
      description: "Your preferences have been saved.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserOnboardingData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
