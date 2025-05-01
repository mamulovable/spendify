import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SubscriptionLimits } from '@/types/subscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionContextType {
  limits: SubscriptionLimits;
  activePlan: string | null;
  loading: boolean;
  updateSubscription: (planId: string) => Promise<void>;
}

export const defaultLimits = {
  maxStatements: 5,
  maxSavedAnalyses: 10,
  hasAdvancedAnalytics: false,
  canCompare: false,
  hasFinancialGoals: false,
  hasAIFinancialAdvisor: false,
  budgetPlanner: false,
};

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [limits, setLimits] = useState<SubscriptionLimits>(defaultLimits);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setLimits(defaultLimits);
        setActivePlan(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setActivePlan(data.plan);
          // Update limits based on the plan
          setLimits({
            maxStatements: data.plan === 'pro' ? 20 : 5,
            maxSavedAnalyses: data.plan === 'pro' ? 50 : 10,
            hasAdvancedAnalytics: data.plan === 'pro',
            canCompare: data.plan === 'pro',
            hasFinancialGoals: data.plan === 'pro',
            hasAIFinancialAdvisor: data.plan === 'pro',
          });
        } else {
          setLimits(defaultLimits);
          setActivePlan(null);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setLimits(defaultLimits);
        setActivePlan(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const updateSubscription = async (planId: string) => {
    if (!user) {
      throw new Error('User must be logged in to update subscription');
    }

    try {
      // Check if subscription already exists
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw fetchError;
      }

      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ plan: planId })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert([{ user_id: user.id, plan: planId }]);

        if (insertError) throw insertError;
      }

      // Update local state
      setActivePlan(planId);
      setLimits({
        maxStatements: planId === 'pro' ? 20 : 5,
        maxSavedAnalyses: planId === 'pro' ? 50 : 10,
        hasAdvancedAnalytics: planId === 'pro',
        canCompare: planId === 'pro',
        hasFinancialGoals: planId === 'pro',
        hasAIFinancialAdvisor: planId === 'pro',
      });

      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to the ${planId} plan.`,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Subscription Update Failed",
        description: error instanceof Error ? error.message : "Failed to update subscription",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider value={{ limits, activePlan, loading, updateSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export const plans = {
  free: {
    id: 'free',
    name: 'Free',
    limits: {
      maxStatements: 5,
      maxSavedAnalyses: 10,
      hasAdvancedAnalytics: false,
      canCompare: false,
      hasFinancialGoals: false,
      hasAIFinancialAdvisor: false,
      budgetPlanner: false,
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    limits: {
      maxStatements: 20,
      maxSavedAnalyses: 50,
      hasAdvancedAnalytics: true,
      canCompare: true,
      hasFinancialGoals: true,
      hasAIFinancialAdvisor: true,
      budgetPlanner: true,
    }
  },
};