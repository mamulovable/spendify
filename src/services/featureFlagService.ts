import { supabase } from '@/lib/supabase';
import { FeatureFlag, FeatureFlagFormData } from '@/types/featureFlag';

export const featureFlagService = {
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const { data, error } = await supabase
      .from('admin_feature_flags')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching feature flags:', error);
      throw new Error(`Failed to fetch feature flags: ${error.message}`);
    }
    
    return data || [];
  },
  
  async getFeatureFlag(id: string): Promise<FeatureFlag> {
    const { data, error } = await supabase
      .from('admin_feature_flags')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching feature flag ${id}:`, error);
      throw new Error(`Failed to fetch feature flag: ${error.message}`);
    }
    
    return data;
  },
  
  async createFeatureFlag(flagData: FeatureFlagFormData): Promise<string> {
    const { data, error } = await supabase.rpc('create_feature_flag', {
      name: flagData.name,
      description: flagData.description || null,
      enabled: flagData.enabled,
      user_percentage: flagData.user_percentage || null,
      allowed_plans: flagData.allowed_plans || null,
      admin_id: (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) {
      console.error('Error creating feature flag:', error);
      throw new Error(`Failed to create feature flag: ${error.message}`);
    }
    
    return data;
  },
  
  async toggleFeatureFlag(flagName: string, enabled: boolean): Promise<boolean> {
    const { data, error } = await supabase.rpc('toggle_feature_flag', {
      flag_name: flagName,
      enabled: enabled,
      admin_id: (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) {
      console.error(`Error toggling feature flag ${flagName}:`, error);
      throw new Error(`Failed to toggle feature flag: ${error.message}`);
    }
    
    return data;
  },
  
  async updateFeatureFlag(id: string, flagData: Partial<FeatureFlagFormData>): Promise<void> {
    const { error } = await supabase
      .from('feature_flags')
      .update({
        description: flagData.description,
        user_percentage: flagData.user_percentage,
        allowed_plans: flagData.allowed_plans,
        last_updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating feature flag ${id}:`, error);
      throw new Error(`Failed to update feature flag: ${error.message}`);
    }
  },
  
  async deleteFeatureFlag(id: string): Promise<void> {
    const { error } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting feature flag ${id}:`, error);
      throw new Error(`Failed to delete feature flag: ${error.message}`);
    }
  }
};