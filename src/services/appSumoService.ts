import { supabase } from '@/lib/supabase';
import { AppSumoRedemptionResponse } from '@/types/auth';

export interface ValidateCodeParams {
  code: string;
}

export interface RedeemCodeParams {
  code: string;
  userId: string;
}

/**
 * Service for handling AppSumo code validation and redemption
 */
export const appSumoService = {
  /**
   * Validate an AppSumo code format and check if it exists in the database
   * 
   * @param params The code to validate
   * @returns Validation result with status and message
   */
  async validateCode({ code }: ValidateCodeParams): Promise<{ 
    isValid: boolean; 
    message: string;
    isRedeemed?: boolean;
  }> {
    try {
      // Validate code format
      if (!code || code.trim().length < 8) {
        return {
          isValid: false,
          message: 'Invalid code format. AppSumo codes should be in the format AS-XXXXXX.'
        };
      }

      // Check if the code follows the required pattern
      const codePattern = /^AS-[A-Z0-9]{6,}$/i;
      if (!codePattern.test(code)) {
        return {
          isValid: false,
          message: 'Invalid code format. AppSumo codes should be in the format AS-XXXXXX.'
        };
      }

      // Check if the code exists in our database
      const { data: codeData, error: codeError } = await supabase
        .from('appsumo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (codeError || !codeData) {
        return {
          isValid: false,
          message: 'Invalid AppSumo code. Please check and try again.'
        };
      }

      // Check if the code has already been redeemed
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('appsumo_redemptions')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (redemptionError && redemptionError.code !== 'PGRST116') {
        // PGRST116 is the error code for "no rows returned" which is what we want
        return {
          isValid: false,
          message: 'Error checking code status. Please try again.'
        };
      }

      if (redemptionData) {
        return {
          isValid: true,
          isRedeemed: true,
          message: 'This AppSumo code has already been redeemed.'
        };
      }

      // Code is valid and not redeemed
      return {
        isValid: true,
        isRedeemed: false,
        message: 'Valid AppSumo code.'
      };
    } catch (error: any) {
      console.error('Error validating AppSumo code:', error);
      return {
        isValid: false,
        message: error.message || 'An error occurred while validating the code.'
      };
    }
  },

  /**
   * Redeem an AppSumo code for a user
   * 
   * @param params The code and user ID for redemption
   * @returns The redemption response
   */
  async redeemCode({ code, userId }: RedeemCodeParams): Promise<AppSumoRedemptionResponse> {
    try {
      // First validate the code
      const validation = await this.validateCode({ code });
      
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          error: 'INVALID_CODE'
        };
      }

      if (validation.isRedeemed) {
        return {
          success: false,
          message: 'This AppSumo code has already been redeemed.',
          error: 'CODE_ALREADY_REDEEMED'
        };
      }

      // Check if the user exists
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        return {
          success: false,
          message: 'User authentication required',
          error: 'USER_NOT_AUTHENTICATED'
        };
      }

      // Get the plan type from the code
      const { data: codeData, error: codeError } = await supabase
        .from('appsumo_codes')
        .select('plan_type')
        .eq('code', code.toUpperCase())
        .single();

      if (codeError || !codeData) {
        return {
          success: false,
          message: 'Error retrieving code details',
          error: 'CODE_DETAILS_ERROR'
        };
      }

      const planType = codeData.plan_type || 'lifetime';

      // Check if the user already has an active subscription
      const { data: existingSubscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      // If there's an existing subscription, we need to handle the upgrade
      if (existingSubscription && !subscriptionError) {
        // Archive the existing subscription
        const { error: archiveError } = await supabase
          .from('user_subscriptions')
          .update({ 
            status: 'archived',
            updated_at: new Date().toISOString(),
            archived_reason: 'Upgraded to AppSumo LTD'
          })
          .eq('id', existingSubscription.id);

        if (archiveError) {
          console.error('Error archiving existing subscription:', archiveError);
          // Continue anyway - this is not critical
        }
      }

      // Record the redemption in the database
      const redemptionDate = new Date().toISOString();
      const { error: insertError } = await supabase
        .from('appsumo_redemptions')
        .insert({
          code: code.toUpperCase(),
          user_id: userId,
          redemption_date: redemptionDate,
          plan_type: planType,
          status: 'active'
        });

      if (insertError) {
        return {
          success: false,
          message: 'Error recording code redemption',
          error: 'REDEMPTION_RECORD_ERROR'
        };
      }

      // Create a new subscription record for the user
      const { error: subscriptionCreateError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          payment_provider: 'appsumo',
          subscription_type: 'lifetime',
          starts_at: redemptionDate,
          created_at: redemptionDate,
          updated_at: redemptionDate,
          metadata: {
            appsumo_code: code.toUpperCase(),
            redemption_date: redemptionDate
          }
        });

      if (subscriptionCreateError) {
        console.error('Error creating subscription record:', subscriptionCreateError);
        // Continue anyway - we'll still update the user metadata
      }

      // Update user metadata with AppSumo information
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          is_appsumo_user: true,
          appsumo_code: code.toUpperCase(),
          appsumo_redemption_date: redemptionDate,
          subscription_tier: planType,
          subscription_type: 'lifetime'
        }
      });

      if (updateError) {
        return {
          success: false,
          message: 'Error updating user subscription',
          error: 'USER_UPDATE_ERROR'
        };
      }

      // Get plan features based on the plan type
      const planFeatures = this.getPlanFeatures(planType);

      // Return success response
      return {
        success: true,
        message: 'AppSumo code successfully redeemed',
        redemption: {
          code: code.toUpperCase(),
          userId,
          redemptionDate,
          planType: planType === 'premium' ? 'annual' : 'lifetime',
          status: 'active',
          features: planFeatures
        }
      };
    } catch (error: any) {
      console.error('Error redeeming AppSumo code:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: 'UNEXPECTED_ERROR'
      };
    }
  },
  
  /**
   * Get the features included in a specific plan type
   * 
   * @param planType The plan type to get features for
   * @returns An object containing the plan features
   */
  getPlanFeatures(planType: string): Record<string, any> {
    // Base features included in all plans
    const baseFeatures = {
      expenseTracking: true,
      budgetManagement: true,
      documentProcessing: true,
      aiAdvisor: true,
      support: 'standard',
      futureUpdates: true
    };
    
    // Plan-specific features
    switch (planType) {
      case 'basic_ltd':
        return {
          ...baseFeatures,
          expenseLimit: 1000,
          documentLimit: 50,
          aiQueriesPerMonth: 100,
          customCategories: 10,
          support: 'standard'
        };
        
      case 'premium_ltd':
        return {
          ...baseFeatures,
          expenseLimit: 5000,
          documentLimit: 200,
          aiQueriesPerMonth: 500,
          customCategories: 50,
          support: 'priority',
          advancedAnalytics: true,
          dataExport: true
        };
        
      case 'ultimate_ltd':
      case 'lifetime': // Default to ultimate for generic lifetime plans
      default:
        return {
          ...baseFeatures,
          expenseLimit: 'unlimited',
          documentLimit: 'unlimited',
          aiQueriesPerMonth: 'unlimited',
          customCategories: 'unlimited',
          support: 'premium',
          advancedAnalytics: true,
          dataExport: true,
          apiAccess: true,
          earlyAccess: true
        };
    }
  },

  /**
   * Check if a user has an active AppSumo subscription
   * 
   * @param userId The user ID to check
   * @returns Whether the user has an active AppSumo subscription
   */
  async hasActiveAppSumoSubscription(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('appsumo_redemptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking AppSumo subscription:', error);
      return false;
    }
  },
  
  /**
   * Check if a user has an existing subscription
   * 
   * @param userId The user ID to check
   * @returns Information about the user's existing subscription, if any
   */
  async getUserSubscriptionInfo(userId: string): Promise<{
    hasSubscription: boolean;
    subscriptionType?: string;
    planType?: string;
    willUpgrade: boolean;
  }> {
    try {
      // Check if the user has an active subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error || !data) {
        return {
          hasSubscription: false,
          willUpgrade: false
        };
      }
      
      // Determine if upgrading to AppSumo LTD would be an upgrade
      // For simplicity, we'll consider any non-lifetime plan as eligible for upgrade
      const willUpgrade = data.subscription_type !== 'lifetime';
      
      return {
        hasSubscription: true,
        subscriptionType: data.subscription_type,
        planType: data.plan_type,
        willUpgrade
      };
    } catch (error) {
      console.error('Error checking user subscription:', error);
      return {
        hasSubscription: false,
        willUpgrade: false
      };
    }
  },
  
  /**
   * Handle the upgrade of an existing user to an AppSumo LTD plan
   * 
   * @param userId The user ID to upgrade
   * @param code The AppSumo code to redeem
   * @returns The result of the upgrade operation
   */
  async upgradeExistingUser(userId: string, code: string): Promise<{
    success: boolean;
    message: string;
    preservedData?: string[];
    conflicts?: string[];
  }> {
    try {
      // Get the user's current subscription info
      const subscriptionInfo = await this.getUserSubscriptionInfo(userId);
      
      if (!subscriptionInfo.hasSubscription) {
        // If the user doesn't have a subscription, just redeem the code normally
        const redemptionResult = await this.redeemCode({ code, userId });
        return {
          success: redemptionResult.success,
          message: redemptionResult.message
        };
      }
      
      // If the user has a lifetime subscription already, check if this would be an upgrade
      if (subscriptionInfo.subscriptionType === 'lifetime') {
        // For simplicity, we'll consider any AppSumo code as an upgrade
        // In a real implementation, you'd compare plan features
        const redemptionResult = await this.redeemCode({ code, userId });
        
        if (redemptionResult.success) {
          return {
            success: true,
            message: 'Your lifetime plan has been upgraded with additional features!',
            preservedData: ['user_data', 'settings', 'expenses', 'documents']
          };
        } else {
          return {
            success: false,
            message: redemptionResult.message
          };
        }
      }
      
      // For users with monthly/annual subscriptions, handle the transition
      // 1. Archive their current subscription
      const { error: archiveError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
          archived_reason: 'Upgraded to AppSumo LTD'
        })
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (archiveError) {
        console.error('Error archiving existing subscription:', archiveError);
        return {
          success: false,
          message: 'Failed to archive existing subscription'
        };
      }
      
      // 2. Redeem the AppSumo code
      const redemptionResult = await this.redeemCode({ code, userId });
      
      if (!redemptionResult.success) {
        // If redemption failed, restore the original subscription
        const { error: restoreError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('archived_reason', 'Upgraded to AppSumo LTD');
        
        if (restoreError) {
          console.error('Error restoring original subscription:', restoreError);
        }
        
        return {
          success: false,
          message: `Failed to redeem AppSumo code: ${redemptionResult.message}`
        };
      }
      
      // 3. Return success with information about preserved data
      return {
        success: true,
        message: 'Your account has been successfully upgraded to a lifetime plan!',
        preservedData: ['user_data', 'settings', 'expenses', 'documents', 'categories']
      };
    } catch (error: any) {
      console.error('Error upgrading existing user:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during the upgrade process'
      };
    }
  }
};