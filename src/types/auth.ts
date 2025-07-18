import { User, Session } from '@supabase/supabase-js';

export interface UserProfile extends User {
  user_metadata: {
    full_name: string;
    is_appsumo_user?: boolean;
    appsumo_code?: string;
    appsumo_redemption_date?: string;
  };
}

export interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export interface AppSumoRedemption {
  code: string;
  userId: string;
  redemptionDate: string;
  planType: 'lifetime' | 'annual' | 'monthly';
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  features?: Record<string, any>;
}

export interface AppSumoRedemptionResponse {
  success: boolean;
  message: string;
  redemption?: AppSumoRedemption;
  error?: string;
}