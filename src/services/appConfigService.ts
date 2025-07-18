import { supabase } from '@/lib/supabase';
import { AppConfig, ConfigHistoryEntry, ConfigCategory } from '@/types/appConfig';

// Configuration definitions - in a real app, these might come from the backend
const configCategories: ConfigCategory[] = [
  {
    name: 'System Limits',
    description: 'Configure system-wide limits and thresholds',
    configs: [
      {
        key: 'max_uploads_per_month',
        label: 'Maximum Uploads Per Month',
        description: 'Maximum document uploads allowed per month by plan',
        type: 'json',
      },
      {
        key: 'ai_limits',
        label: 'AI Query Limits',
        description: 'Maximum AI queries allowed per month by plan',
        type: 'json',
      },
      {
        key: 'alert_limits',
        label: 'Alert Thresholds',
        description: 'Thresholds for user notifications',
        type: 'json',
      }
    ]
  },
  {
    name: 'System Settings',
    description: 'General system configuration settings',
    configs: [
      {
        key: 'system_maintenance',
        label: 'System Maintenance',
        description: 'Configure system maintenance schedule',
        type: 'json',
      },
      {
        key: 'default_currency',
        label: 'Default Currency',
        description: 'Default currency for new users',
        type: 'select',
        options: [
          { label: 'USD ($)', value: 'USD' },
          { label: 'EUR (€)', value: 'EUR' },
          { label: 'GBP (£)', value: 'GBP' },
          { label: 'JPY (¥)', value: 'JPY' },
          { label: 'CAD ($)', value: 'CAD' },
          { label: 'AUD ($)', value: 'AUD' },
        ]
      },
      {
        key: 'default_language',
        label: 'Default Language',
        description: 'Default language for new users',
        type: 'select',
        options: [
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
          { label: 'Japanese', value: 'ja' },
          { label: 'Chinese', value: 'zh' },
        ]
      }
    ]
  },
  {
    name: 'Security Settings',
    description: 'Security and authentication settings',
    configs: [
      {
        key: 'password_policy',
        label: 'Password Policy',
        description: 'Configure password requirements',
        type: 'json',
      },
      {
        key: 'session_timeout',
        label: 'Session Timeout',
        description: 'User session timeout in minutes',
        type: 'number',
        validation: {
          required: true,
          min: 5,
          max: 1440
        }
      },
      {
        key: 'mfa_required',
        label: 'Require MFA',
        description: 'Require multi-factor authentication for all users',
        type: 'boolean',
      }
    ]
  }
];

export const appConfigService = {
  // Get all configuration categories
  getConfigCategories(): ConfigCategory[] {
    return configCategories;
  },
  
  // Get a specific configuration category
  getConfigCategory(categoryName: string): ConfigCategory | undefined {
    return configCategories.find(category => category.name === categoryName);
  },
  
  // Get all app configurations
  async getAppConfigs(): Promise<AppConfig[]> {
    const { data, error } = await supabase
      .from('app_configuration')
      .select('*')
      .order('config_key');
    
    if (error) {
      console.error('Error fetching app configurations:', error);
      throw new Error(`Failed to fetch app configurations: ${error.message}`);
    }
    
    return data.map(item => ({
      id: item.id,
      configKey: item.config_key,
      configValue: item.config_value,
      description: item.description,
      lastUpdatedBy: item.last_updated_by,
      updatedAt: item.updated_at
    })) || [];
  },
  
  // Get a specific app configuration
  async getAppConfig(configKey: string): Promise<AppConfig | null> {
    const { data, error } = await supabase
      .from('app_configuration')
      .select('*')
      .eq('config_key', configKey)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching app configuration ${configKey}:`, error);
      throw new Error(`Failed to fetch app configuration: ${error.message}`);
    }
    
    return {
      id: data.id,
      configKey: data.config_key,
      configValue: data.config_value,
      description: data.description,
      lastUpdatedBy: data.last_updated_by,
      updatedAt: data.updated_at
    };
  },
  
  // Update app configuration
  async updateAppConfig(configKey: string, configValue: any, description?: string): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { error } = await supabase.rpc('update_app_configuration', {
      config_key: configKey,
      config_value: configValue,
      admin_id: userId
    });
    
    if (error) {
      console.error(`Error updating app configuration ${configKey}:`, error);
      throw new Error(`Failed to update app configuration: ${error.message}`);
    }
    
    return true;
  },
  
  // Get configuration history
  async getConfigHistory(configId: string): Promise<ConfigHistoryEntry[]> {
    const { data, error } = await supabase
      .from('configuration_history')
      .select('*, admin_users(full_name)')
      .eq('config_id', configId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Error fetching configuration history for ${configId}:`, error);
      throw new Error(`Failed to fetch configuration history: ${error.message}`);
    }
    
    return data.map(item => ({
      id: item.id,
      configType: item.config_type,
      configId: item.config_id,
      previousValue: item.previous_value,
      newValue: item.new_value,
      changedBy: item.admin_users?.full_name || null,
      createdAt: item.created_at
    })) || [];
  }
};