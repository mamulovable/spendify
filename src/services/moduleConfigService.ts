import { supabase } from '@/lib/supabase';
import { ModuleConfig, ModuleConfigFormData, ModuleDefinition } from '@/types/moduleConfig';

// Module definitions - in a real app, these might come from the backend
const moduleDefinitions: ModuleDefinition[] = [
  {
    id: 'document_processing',
    name: 'Document Processing',
    description: 'Process and analyze financial documents',
    settings: [
      {
        key: 'max_file_size',
        label: 'Maximum File Size (MB)',
        type: 'number',
        description: 'Maximum file size allowed for document uploads',
        defaultValue: 10,
        validation: {
          required: true,
          min: 1,
          max: 50
        }
      },
      {
        key: 'allowed_file_types',
        label: 'Allowed File Types',
        type: 'multiselect',
        description: 'File types that can be uploaded',
        defaultValue: ['pdf', 'jpg', 'png'],
        options: [
          { label: 'PDF', value: 'pdf' },
          { label: 'JPG', value: 'jpg' },
          { label: 'PNG', value: 'png' },
          { label: 'TIFF', value: 'tiff' },
          { label: 'DOCX', value: 'docx' }
        ]
      },
      {
        key: 'ocr_enabled',
        label: 'Enable OCR',
        type: 'boolean',
        description: 'Enable Optical Character Recognition for documents',
        defaultValue: true
      }
    ]
  },
  {
    id: 'ai_advisor',
    name: 'AI Financial Advisor',
    description: 'AI-powered financial advice and insights',
    settings: [
      {
        key: 'max_queries_per_day',
        label: 'Max Queries Per Day',
        type: 'number',
        description: 'Maximum number of AI queries allowed per day',
        defaultValue: 50,
        validation: {
          required: true,
          min: 10,
          max: 1000
        }
      },
      {
        key: 'response_mode',
        label: 'Response Mode',
        type: 'select',
        description: 'How AI responses should be formatted',
        defaultValue: 'detailed',
        options: [
          { label: 'Concise', value: 'concise' },
          { label: 'Balanced', value: 'balanced' },
          { label: 'Detailed', value: 'detailed' }
        ]
      },
      {
        key: 'enable_suggestions',
        label: 'Enable Proactive Suggestions',
        type: 'boolean',
        description: 'Allow AI to provide proactive financial suggestions',
        defaultValue: true
      }
    ]
  },
  {
    id: 'budget_tracking',
    name: 'Budget Tracking',
    description: 'Track and manage budgets and spending',
    settings: [
      {
        key: 'max_budgets',
        label: 'Maximum Budgets',
        type: 'number',
        description: 'Maximum number of budgets a user can create',
        defaultValue: 10,
        validation: {
          required: true,
          min: 1,
          max: 50
        }
      },
      {
        key: 'alert_threshold',
        label: 'Alert Threshold (%)',
        type: 'number',
        description: 'Percentage of budget spent to trigger alerts',
        defaultValue: 80,
        validation: {
          required: true,
          min: 50,
          max: 100
        }
      },
      {
        key: 'enable_recurring_budgets',
        label: 'Enable Recurring Budgets',
        type: 'boolean',
        description: 'Allow users to create recurring budgets',
        defaultValue: true
      }
    ]
  },
  {
    id: 'analytics_dashboard',
    name: 'Analytics Dashboard',
    description: 'Financial analytics and reporting',
    settings: [
      {
        key: 'data_retention_days',
        label: 'Data Retention (Days)',
        type: 'number',
        description: 'Number of days to retain detailed analytics data',
        defaultValue: 365,
        validation: {
          required: true,
          min: 30,
          max: 3650
        }
      },
      {
        key: 'default_view',
        label: 'Default View',
        type: 'select',
        description: 'Default analytics view for users',
        defaultValue: 'monthly',
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly' }
        ]
      },
      {
        key: 'enable_export',
        label: 'Enable Data Export',
        type: 'boolean',
        description: 'Allow users to export analytics data',
        defaultValue: true
      }
    ]
  }
];

export const moduleConfigService = {
  // Get all module definitions
  getModuleDefinitions(): ModuleDefinition[] {
    return moduleDefinitions;
  },
  
  // Get a specific module definition
  getModuleDefinition(moduleId: string): ModuleDefinition | undefined {
    return moduleDefinitions.find(module => module.id === moduleId);
  },
  
  // Get all module configurations
  async getModuleConfigs(): Promise<ModuleConfig[]> {
    const { data, error } = await supabase
      .from('module_configurations')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching module configurations:', error);
      throw new Error(`Failed to fetch module configurations: ${error.message}`);
    }
    
    return data || [];
  },
  
  // Get a specific module configuration
  async getModuleConfig(moduleId: string): Promise<ModuleConfig | null> {
    const { data, error } = await supabase
      .from('module_configurations')
      .select('*')
      .eq('id', moduleId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching module configuration ${moduleId}:`, error);
      throw new Error(`Failed to fetch module configuration: ${error.message}`);
    }
    
    return data;
  },
  
  // Create or update a module configuration
  async saveModuleConfig(moduleId: string, configData: ModuleConfigFormData): Promise<string> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    // Check if the module config already exists
    const existingConfig = await this.getModuleConfig(moduleId);
    
    if (existingConfig) {
      // Update existing config
      const { error } = await supabase
        .from('module_configurations')
        .update({
          name: configData.name,
          description: configData.description,
          enabled: configData.enabled,
          required_plan: configData.requiredPlan,
          settings: configData.settings,
          last_updated_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);
      
      if (error) {
        console.error(`Error updating module configuration ${moduleId}:`, error);
        throw new Error(`Failed to update module configuration: ${error.message}`);
      }
      
      return moduleId;
    } else {
      // Create new config
      const { data, error } = await supabase
        .from('module_configurations')
        .insert({
          id: moduleId,
          name: configData.name,
          description: configData.description,
          enabled: configData.enabled,
          required_plan: configData.requiredPlan,
          settings: configData.settings,
          created_by: userId,
          last_updated_by: userId
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating module configuration:', error);
        throw new Error(`Failed to create module configuration: ${error.message}`);
      }
      
      return data.id;
    }
  },
  
  // Toggle module enabled status
  async toggleModuleEnabled(moduleId: string, enabled: boolean): Promise<boolean> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { error } = await supabase
      .from('module_configurations')
      .update({
        enabled: enabled,
        last_updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId);
    
    if (error) {
      console.error(`Error toggling module ${moduleId}:`, error);
      throw new Error(`Failed to toggle module: ${error.message}`);
    }
    
    return enabled;
  }
};