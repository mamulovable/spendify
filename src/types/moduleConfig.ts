export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiredPlan: string[];
  settings: Record<string, any>;
  lastUpdatedBy: string | null;
  updatedAt: string;
}

export interface ModuleConfigFormData {
  name: string;
  description: string;
  enabled: boolean;
  requiredPlan: string[];
  settings: Record<string, any>;
}

export interface ModuleSettingField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  description?: string;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  settings: ModuleSettingField[];
}