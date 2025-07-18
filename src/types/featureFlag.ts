export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  user_percentage: number | null;
  allowed_plans: string[] | null;
  last_updated_by_name: string | null;
  updated_at: string;
}

export interface FeatureFlagFormData {
  name: string;
  description: string;
  enabled: boolean;
  user_percentage?: number | null;
  allowed_plans?: string[] | null;
}

export interface FeatureFlagToggleData {
  flagId: string;
  enabled: boolean;
}

export interface ABTestConfig {
  enabled: boolean;
  userPercentage: number;
  variants: {
    name: string;
    weight: number;
  }[];
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
}