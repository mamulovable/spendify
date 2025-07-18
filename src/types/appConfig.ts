export interface AppConfig {
  id: string;
  configKey: string;
  configValue: any;
  description: string | null;
  lastUpdatedBy: string | null;
  updatedAt: string;
}

export interface ConfigHistoryEntry {
  id: string;
  configType: string;
  configId: string;
  previousValue: any;
  newValue: any;
  changedBy: string | null;
  createdAt: string;
}

export interface ConfigCategory {
  name: string;
  description: string;
  configs: ConfigDefinition[];
}

export interface ConfigDefinition {
  key: string;
  label: string;
  description?: string;
  type: 'text' | 'number' | 'boolean' | 'json' | 'select' | 'multiselect';
  options?: { label: string; value: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}