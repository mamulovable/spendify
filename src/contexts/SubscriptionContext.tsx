import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SubscriptionLimits } from '@/types/subscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionContextType {
  limits: SubscriptionLimits;
  activePlan: string | null;
  trialEndsAt: Date | null;
  trialType: 'seven_day' | 'thirty_day' | null;
  cardAdded: boolean;
  loading: boolean;
  updateSubscription: (planId: string, trialOptions?: { 
    isTrialStart: boolean;
    withCard?: boolean;
  }) => Promise<void>;
  addCardToTrial: (planId: string) => Promise<void>;
}

export const defaultLimits: SubscriptionLimits = {
  maxStatements: 5,
  maxSavedAnalyses: 10,
  hasAdvancedAnalytics: false,
  advancedAnalysis: true, // Enabled for testing the new feature
  canCompare: false,
  hasFinancialGoals: false,
  hasAIFinancialAdvisor: false,
  budgetPlanner: false,
};

const getTrialEndDate = (withCard: boolean = false): Date => {
  const date = new Date();
  date.setDate(date.getDate() + (withCard ? 30 : 7));
  return date;
};

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [limits, setLimits] = useState<SubscriptionLimits>(defaultLimits);
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [trialType, setTrialType] = useState<'seven_day' | 'thirty_day' | null>(null);
  const [cardAdded, setCardAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setLimits(defaultLimits);
        setActivePlan(null);
        setTrialEndsAt(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, trial_ends_at, trial_type, card_added')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
          const isTrialActive = trialEnd && trialEnd > new Date();

          if (isTrialActive) {
            setActivePlan(data.plan);
            setTrialEndsAt(trialEnd);
            setTrialType(data.trial_type);
            setCardAdded(data.card_added);
            setLimits({
              maxStatements: data.plan === 'pro' ? 20 : 5,
              maxSavedAnalyses: data.plan === 'pro' ? 50 : 10,
              hasAdvancedAnalytics: data.plan === 'pro',
              advancedAnalysis: true, // Always enabled for testing
              canCompare: data.plan === 'pro',
              hasFinancialGoals: data.plan === 'pro',
              hasAIFinancialAdvisor: data.plan === 'pro',
              budgetPlanner: data.plan === 'pro',
            });
          } else {
            setActivePlan(data.plan);
            setTrialEndsAt(null);
            setLimits({
              maxStatements: data.plan === 'pro' ? 20 : 5,
              maxSavedAnalyses: data.plan === 'pro' ? 50 : 10,
              hasAdvancedAnalytics: data.plan === 'pro',
              advancedAnalysis: true, // Always enabled for testing
              canCompare: data.plan === 'pro' || data.plan === 'enterprise',
              hasFinancialGoals: data.plan === 'pro' || data.plan === 'enterprise',
              hasAIFinancialAdvisor: data.plan === 'pro' || data.plan === 'enterprise',
              budgetPlanner: data.plan === 'pro' || data.plan === 'enterprise',
            });
            if (data.plan !== 'pro' && data.plan !== 'enterprise') {
              setLimits(defaultLimits);
            }
          }
        } else {
          setLimits(defaultLimits);
          setActivePlan(null);
          setTrialEndsAt(null);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setLimits(defaultLimits);
        setActivePlan(null);
        setTrialEndsAt(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  const updateSubscription = async (planId: string, trialOptions?: { isTrialStart: boolean; withCard?: boolean }) => {
    if (!user) {
      throw new Error('User must be logged in to update subscription');
    }

    setLoading(true);
    try {
      const isTrialStart = trialOptions?.isTrialStart ?? false;
      const withCard = trialOptions?.withCard ?? false;
      const now = new Date();
      const trialEndDate = isTrialStart ? getTrialEndDate(withCard).toISOString() : null;

      // Check if subscription exists first
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError);
        throw fetchError;
      }

      // Always provide NOT NULL fields
      const subscriptionData: any = {
        user_id: user.id,
        plan: planId,
        updated_at: now.toISOString(),
        status: 'active',
        current_period_end: isTrialStart
          ? trialEndDate // For trial, set to trial end
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // For paid, 30 days from now
        cancel_at_period_end: false,
      };

      if (isTrialStart) {
        subscriptionData.trial_ends_at = trialEndDate;
        subscriptionData.trial_type = withCard ? 'thirty_day' : 'seven_day';
        subscriptionData.card_added = withCard;
      } else {
        subscriptionData.trial_ends_at = null;
        subscriptionData.trial_type = null;
        subscriptionData.card_added = false;
      }

      console.log('Updating subscription with:', subscriptionData);
      
      let error;
      if (existingSubscription) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(subscriptionData);
        error = insertError;
      }

      if (error) {
        console.error('Error in supabase operation:', error);
        throw error;
      }

      setActivePlan(planId);
      setTrialEndsAt(isTrialStart && trialEndDate ? new Date(trialEndDate) : null);
      setLimits({
        maxStatements: planId === 'enterprise' ? 100 : planId === 'pro' ? 20 : 5,
        maxSavedAnalyses: planId === 'enterprise' ? 250 : planId === 'pro' ? 50 : 10,
        hasAdvancedAnalytics: planId === 'enterprise' || planId === 'pro',
        advancedAnalysis: true,
        canCompare: planId === 'enterprise' || planId === 'pro',
        hasFinancialGoals: planId === 'enterprise' || planId === 'pro',
        hasAIFinancialAdvisor: planId === 'enterprise' || planId === 'pro',
        budgetPlanner: planId === 'enterprise' || planId === 'pro',
      });
      if (planId !== 'pro' && planId !== 'enterprise' && !isTrialStart) {
        setLimits(defaultLimits);
      }

      toast({
        title: isTrialStart ? "Trial Started" : "Subscription Updated",
        description: isTrialStart ? `Your ${withCard ? '30' : '7'}-day trial for the ${planId} plan has started.` : `Your subscription has been updated to the ${planId} plan.`,
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      // Log exact error details for debugging
      if (typeof error === 'object' && error !== null) {
        console.error('Full error object:', JSON.stringify(error));
      }
      toast({
        title: "Subscription Update Failed",
        description: error instanceof Error ? error.message : "Failed to update subscription. Please try again or contact support.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

    const addCardToTrial = async (planId: string) => {
    if (!user) {
      throw new Error('User must be logged in to add a card');
    }

    if (!trialEndsAt || trialType !== 'seven_day') {
      throw new Error('Can only add card during a 7-day trial');
    }

    setLoading(true);
    try {
      const newTrialEndDate = getTrialEndDate(true).toISOString();

      const { error } = await supabase
        .from('subscriptions')
        .update({
          trial_ends_at: newTrialEndDate,
          trial_type: 'thirty_day',
          card_added: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setTrialEndsAt(new Date(newTrialEndDate));
      setTrialType('thirty_day');
      setCardAdded(true);

      toast({
        title: 'Trial Extended!',
        description: 'Your trial has been extended to 30 days with card verification.',
      });
    } catch (error) {
      console.error('Error adding card to trial:', error);
      toast({
        title: 'Failed to Add Card',
        description: error instanceof Error ? error.message : 'Failed to add card to trial',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubscriptionContext.Provider value={{ 
      limits, 
      activePlan, 
      trialEndsAt, 
      trialType,
      cardAdded,
      loading, 
      updateSubscription,
      addCardToTrial 
    }}>
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