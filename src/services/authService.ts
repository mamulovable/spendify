import { supabase } from '@/lib/supabase';
import { UserProfile, AppSumoRedemption, AppSumoRedemptionResponse } from '@/types/auth';
import { appSumoService } from './appSumoService';

export interface RegisterUserParams {
  email: string;
  password: string;
  fullName: string;
  isAppSumoUser?: boolean;
  appsumoCode?: string;
}

export interface LoginUserParams {
  email: string;
  password: string;
}

export interface RedeemAppSumoCodeParams {
  code: string;
  userId: string;
}

export const authService = {
  /**
   * Register a new user
   * 
   * @param params Registration parameters including AppSumo-specific data
   * @returns The registered user data and session
   */
  async registerUser({ email, password, fullName, isAppSumoUser = false, appsumoCode }: RegisterUserParams) {
    // Create user metadata - don't set AppSumo flag until code is redeemed
    const metadata: Record<string, any> = {
      full_name: fullName,
      is_appsumo_user: false, // Always false until code is redeemed
    };
    
    // Add AppSumo code to metadata if provided
    if (appsumoCode) {
      metadata.appsumo_code = appsumoCode;
    }
    
    // Register the user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw error;
    }

    // If AppSumo code was provided, attempt to redeem it immediately
    if (data.user && appsumoCode) {
      try {
        await this.redeemAppSumoCode({
          code: appsumoCode,
          userId: data.user.id,
        });
      } catch (redemptionError) {
        console.error('Failed to redeem AppSumo code during registration:', redemptionError);
        // We don't throw here to avoid blocking registration if redemption fails
        // The user can try again later
      }
    }

    return data;
  },

  /**
   * Login an existing user
   */
  async loginUser({ email, password }: LoginUserParams) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  },

  /**
   * Get the current user session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    return data.session;
  },

  /**
   * Get the current user
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return data.user;
  },

  /**
   * Redeem an AppSumo code for a user
   * 
   * @param params The code and user ID for redemption
   * @returns The redemption response
   */
  async redeemAppSumoCode({ code, userId }: RedeemAppSumoCodeParams): Promise<AppSumoRedemptionResponse> {
    // Use the dedicated appSumoService for code redemption
    return appSumoService.redeemCode({ code, userId });
  },

  /**
   * Verify an AppSumo code with the AppSumo API
   * 
   * @param code The AppSumo code to verify
   * @returns Verification result
   */
  async verifyAppSumoCode(code: string): Promise<{ valid: boolean; tier?: string }> {
    // Use the dedicated appSumoService for code validation
    const validation = await appSumoService.validateCode({ code });
    return {
      valid: validation.isValid && !validation.isRedeemed,
      tier: validation.isValid ? 'lifetime' : undefined
    };
  },

  /**
   * Check if a user has an active AppSumo subscription
   * 
   * @param userId The user ID to check
   * @returns Whether the user has an active AppSumo subscription
   */
  async hasActiveAppSumoSubscription(userId: string): Promise<boolean> {
    // Use the dedicated appSumoService to check subscription status
    return appSumoService.hasActiveAppSumoSubscription(userId);
  }
};