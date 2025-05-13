import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  enabled: boolean;
  description: string;
}

export interface ApiIntegration {
  id: string;
  name: string;
  api_key: string;
  is_enabled: boolean;
  last_used: string | null;
  config: Record<string, any>;
}

export interface BackupSchedule {
  id: string;
  type: string;
  frequency: string;
  last_run: string | null;
  next_run: string | null;
  status: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
}

interface SettingsResponse {
  settings: SystemSetting[];
  featureFlags: FeatureFlag[];
  apiIntegrations: ApiIntegration[];
  backupSchedules: BackupSchedule[];
  roles: Role[];
  permissions: Permission[];
  emailTemplates: EmailTemplate[];
  loading: {
    settings: boolean;
    featureFlags: boolean;
    apiIntegrations: boolean;
    backupSchedules: boolean;
    roles: boolean;
    permissions: boolean;
    emailTemplates: boolean;
  };
  error: Error | null;
  updateSetting: (key: string, value: any) => Promise<void>;
  updateFeatureFlag: (key: string, enabled: boolean) => Promise<void>;
  updateApiIntegration: (id: string, data: Partial<ApiIntegration>) => Promise<void>;
  updateBackupSchedule: (id: string, data: Partial<BackupSchedule>) => Promise<void>;
  createRole: (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateRole: (id: string, data: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  assignPermissionToRole: (roleId: string, permissionId: string) => Promise<void>;
  removePermissionFromRole: (roleId: string, permissionId: string) => Promise<void>;
  updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) => Promise<void>;
  triggerBackup: (type: string) => Promise<void>;
  testEmailTemplate: (templateId: string, recipientEmail: string) => Promise<void>;
}

// Mock data for development when database isn't available
const mockSettings: SystemSetting[] = [
  {
    id: '1',
    key: 'max_file_size',
    value: 10,
    category: 'document_processing',
    description: 'Maximum File Size (MB)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    key: 'concurrent_processes',
    value: 5,
    category: 'document_processing',
    description: 'Maximum Concurrent Processes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    key: 'processing_timeout',
    value: 120,
    category: 'document_processing',
    description: 'Processing Timeout (seconds)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    key: 'auto_categorize',
    value: true,
    category: 'analysis',
    description: 'Auto-categorize Transactions',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    key: 'api_key',
    value: 'sk_test_123456789',
    category: 'environment',
    description: 'API Key for external services',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockFeatureFlags: FeatureFlag[] = [
  {
    id: '1',
    name: 'AI Features',
    key: 'ai_features',
    enabled: true,
    description: 'Enable AI-powered analysis and recommendations',
  },
  {
    id: '2',
    name: 'Beta Features',
    key: 'beta_features',
    enabled: false,
    description: 'Enable experimental beta features',
  },
  {
    id: '3',
    name: 'Maintenance Mode',
    key: 'maintenance_mode',
    enabled: false,
    description: 'Put the application in maintenance mode',
  },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'admin',
    description: 'Administrator with full access',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'user',
    description: 'Regular user with limited access',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'analyst',
    description: 'Financial analyst with reporting access',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockPermissions: Permission[] = [
  { id: '1', name: 'view_dashboard', description: 'View admin dashboard', resource: 'dashboard', action: 'view', created_at: new Date().toISOString() },
  { id: '2', name: 'manage_users', description: 'Manage user accounts', resource: 'users', action: 'manage', created_at: new Date().toISOString() },
  { id: '3', name: 'view_reports', description: 'View financial reports', resource: 'reports', action: 'view', created_at: new Date().toISOString() },
  { id: '4', name: 'manage_documents', description: 'Manage document processing', resource: 'documents', action: 'manage', created_at: new Date().toISOString() },
  { id: '5', name: 'manage_settings', description: 'Manage system settings', resource: 'settings', action: 'manage', created_at: new Date().toISOString() },
];

const mockApiIntegrations = [
  {
    id: '1',
    name: 'Google Cloud Vision API',
    key: 'gcv',
    enabled: true,
    api_key: 'dummy-api-key',
    last_used: new Date().toISOString(),
    credentials: {
      api_key: '',
      project_id: '',
    },
    config: {
      use_enhanced_ocr: true,
      max_results: 10,
    },
    description: 'Used for OCR and document analysis',
  },
  {
    id: '2',
    name: 'OpenAI API',
    key: 'openai',
    enabled: true,
    api_key: 'dummy-api-key',
    last_used: new Date().toISOString(),
    credentials: {
      api_key: '',
    },
    config: {
      model: 'gpt-4',
      temperature: 0.7,
    },
    description: 'Used for AI analysis and recommendations',
  },
];

const mockEmailTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to Spendify Guru',
    body: '<h1>Welcome to Spendify Guru!</h1><p>Thank you for joining our platform...</p>',
    variables: ['user.first_name', 'user.last_name', 'user.email'],
    is_active: true,
    description: 'Sent to new users upon registration',
  },
  {
    id: '2',
    name: 'Password Reset',
    subject: 'Reset Your Password',
    body: '<h1>Password Reset</h1><p>Click the link below to reset your password...</p>',
    variables: ['user.first_name', 'reset.link', 'reset.expiry'],
    is_active: true,
    description: 'Sent when users request password reset',
  },
];

const mockBackupSchedules = [
  {
    id: '1',
    type: 'auto',
    frequency: 'daily',
    last_run: new Date(Date.now() - 86400000).toISOString(),
    next_run: new Date(Date.now() + 86400000).toISOString(),
    status: 'active',
    enabled: true,
    retention_days: 30,
    storage_location: 'local',
  },
];

export function useAdminSettings(): SettingsResponse {
  const { logActivity } = useAdmin();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [apiIntegrations, setApiIntegrations] = useState<ApiIntegration[]>([]);
  const [backupSchedules, setBackupSchedules] = useState<BackupSchedule[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState({
    settings: true,
    featureFlags: true,
    apiIntegrations: true,
    backupSchedules: true,
    roles: true,
    permissions: true,
    emailTemplates: true,
  });
  const [error, setError] = useState<Error | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(prev => ({ ...prev, settings: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('system_settings')
        .select('*')
        .order('category');

      if (dbError) throw dbError;

      setSettings(data || []);
      await logActivity('fetched', 'settings');
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
      await logActivity('error', 'settings', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, settings: false }));
    }
  };

  const fetchFeatureFlags = async () => {
    try {
      setLoading(prev => ({ ...prev, featureFlags: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('feature_flags')
        .select('*');

      if (dbError) throw dbError;

      setFeatureFlags(data || []);
      await logActivity('fetched', 'feature_flags');
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch feature flags'));
      await logActivity('error', 'feature_flags', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, featureFlags: false }));
    }
  };

  const fetchApiIntegrations = async () => {
    try {
      setLoading(prev => ({ ...prev, apiIntegrations: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('api_integrations')
        .select('*');

      if (dbError) throw dbError;

      setApiIntegrations(data || []);
      await logActivity('fetched', 'api_integrations');
    } catch (err) {
      console.error('Error fetching API integrations:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch API integrations'));
      await logActivity('error', 'api_integrations', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, apiIntegrations: false }));
    }
  };

  const fetchBackupSchedules = async () => {
    try {
      setLoading(prev => ({ ...prev, backupSchedules: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('backup_schedules')
        .select('*')
        .order('next_run', { ascending: true });

      if (dbError) throw dbError;

      setBackupSchedules(data || []);
      await logActivity('fetched', 'backup_schedules');
    } catch (err) {
      console.error('Error fetching backup schedules:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch backup schedules'));
      await logActivity('error', 'backup_schedules', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, backupSchedules: false }));
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(prev => ({ ...prev, roles: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('admin_roles')
        .select('*')
        .order('name');

      if (dbError) throw dbError;

      setRoles(data || []);
      await logActivity('fetched', 'roles');
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch roles'));
      await logActivity('error', 'roles', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(prev => ({ ...prev, permissions: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('admin_permissions')
        .select('*')
        .order('resource', { ascending: true });

      if (dbError) throw dbError;

      setPermissions(data || []);
      await logActivity('fetched', 'permissions');
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch permissions'));
      await logActivity('error', 'permissions', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, permissions: false }));
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      setLoading(prev => ({ ...prev, emailTemplates: true }));
      setError(null);

      const { data, error: dbError } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (dbError) throw dbError;

      setEmailTemplates(data || []);
      await logActivity('fetched', 'email_templates');
    } catch (err) {
      console.error('Error fetching email templates:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch email templates'));
      await logActivity('error', 'email_templates', { error: err.message });
    } finally {
      setLoading(prev => ({ ...prev, emailTemplates: false }));
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const settingToUpdate = settings.find(s => s.key === key);
      if (!settingToUpdate) throw new Error(`Setting with key ${key} not found`);

      if (useMockData) {
        // Update local state only when using mock data
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
        return;
      }

      const { error: dbError } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (dbError) throw dbError;

      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
      await logActivity('updated', 'settings', { key, value });
    } catch (err) {
      console.error(`Error updating setting ${key}:`, err);
      throw err;
    }
  };

  const updateFeatureFlag = async (key: string, enabled: boolean) => {
    try {
      const flagToUpdate = featureFlags.find(f => f.key === key);
      if (!flagToUpdate) throw new Error(`Feature flag with key ${key} not found`);

      if (useMockData) {
        // Update local state only when using mock data
        setFeatureFlags(prev => prev.map(f => f.key === key ? { ...f, enabled } : f));
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
        return;
      }

      const { error: dbError } = await supabase
        .from('feature_flags')
        .update({ enabled })
        .eq('key', key);

      if (dbError) throw dbError;

      setFeatureFlags(prev => prev.map(f => f.key === key ? { ...f, enabled } : f));
      await logActivity('updated', 'feature_flags', { key, enabled });
    } catch (err) {
      console.error(`Error updating feature flag ${key}:`, err);
      throw err;
    }
  };

  const updateApiIntegration = async (id: string, data: Partial<ApiIntegration>) => {
    try {
      const integrationToUpdate = apiIntegrations.find(i => i.id === id);
      if (!integrationToUpdate) throw new Error(`API integration with id ${id} not found`);

      if (useMockData) {
        // Update local state only when using mock data
        setApiIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
        return;
      }

      const { error: dbError } = await supabase
        .from('api_integrations')
        .update(data)
        .eq('id', id);

      if (dbError) throw dbError;

      setApiIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      await logActivity('updated', 'api_integrations', { id, ...data });
    } catch (err) {
      console.error(`Error updating API integration ${id}:`, err);
      throw err;
    }
  };

  const updateBackupSchedule = async (id: string, data: Partial<BackupSchedule>) => {
    try {
      const scheduleToUpdate = backupSchedules.find(s => s.id === id);
      if (!scheduleToUpdate) throw new Error(`Backup schedule with id ${id} not found`);

      if (useMockData) {
        // Update local state only when using mock data
        setBackupSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
        return;
      }

      const { error: dbError } = await supabase
        .from('backup_schedules')
        .update(data)
        .eq('id', id);

      if (dbError) throw dbError;

      setBackupSchedules(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      await logActivity('updated', 'backup_schedules', { id, ...data });
    } catch (err) {
      console.error(`Error updating backup schedule ${id}:`, err);
      throw err;
    }
  };

  const createRole = async (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: dbError } = await supabase
        .from('admin_roles')
        .insert(role)
        .select()
        .single();

      if (dbError) throw dbError;

      setRoles(prev => [...prev, data]);
      await logActivity('created', 'role', { name: role.name });
    } catch (err) {
      console.error('Error creating role:', err);
      throw err instanceof Error ? err : new Error('Failed to create role');
    }
  };

  const updateRole = async (id: string, data: Partial<Role>) => {
    try {
      const roleToUpdate = roles.find(r => r.id === id);
      if (!roleToUpdate) throw new Error(`Role with id ${id} not found`);

      if (useMockData) {
        // Update local state only when using mock data
        setRoles(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
        return;
      }

      const { error: dbError } = await supabase
        .from('admin_roles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (dbError) throw dbError;

      setRoles(prev => prev.map(r => r.id === id ? { ...r, ...data, updated_at: new Date().toISOString() } : r));
      await logActivity('updated', 'role', { id, ...data });
    } catch (err) {
      console.error(`Error updating role ${id}:`, err);
      throw err;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      const { error: dbError } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setRoles(prev => prev.filter(role => role.id !== id));
      await logActivity('deleted', 'role', { id });
    } catch (err) {
      console.error('Error deleting role:', err);
      throw err instanceof Error ? err : new Error('Failed to delete role');
    }
  };

  const assignPermissionToRole = async (roleId: string, permissionId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('role_permissions')
        .insert({ role_id: roleId, permission_id: permissionId });

      if (dbError) throw dbError;

      await logActivity('assigned', 'permission', { role_id: roleId, permission_id: permissionId });
    } catch (err) {
      console.error('Error assigning permission to role:', err);
      throw err instanceof Error ? err : new Error('Failed to assign permission');
    }
  };

  const removePermissionFromRole = async (roleId: string, permissionId: string) => {
    try {
      const { error: dbError } = await supabase
        .from('role_permissions')
        .delete()
        .match({ role_id: roleId, permission_id: permissionId });

      if (dbError) throw dbError;

      await logActivity('removed', 'permission', { role_id: roleId, permission_id: permissionId });
    } catch (err) {
      console.error('Error removing permission from role:', err);
      throw err instanceof Error ? err : new Error('Failed to remove permission');
    }
  };

  const updateEmailTemplate = async (id: string, data: Partial<EmailTemplate>) => {
    try {
      const templateToUpdate = emailTemplates.find(t => t.id === id);
      if (!templateToUpdate) throw new Error(`Email template with id ${id} not found`);

      if (useMockData) {
        // Update local state only when using mock data
        setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call delay
        return;
      }

      const { error: dbError } = await supabase
        .from('email_templates')
        .update(data)
        .eq('id', id);

      if (dbError) throw dbError;

      setEmailTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
      await logActivity('updated', 'email_template', { id, ...data });
    } catch (err) {
      console.error(`Error updating email template ${id}:`, err);
      throw err;
    }
  };

  const triggerBackup = async (type: string) => {
    try {
      const { error: dbError } = await supabase.rpc('trigger_backup', {
        backup_type: type,
      });

      if (dbError) throw dbError;

      await fetchBackupSchedules();
      await logActivity('triggered', 'backup', { type });
    } catch (err) {
      console.error('Error triggering backup:', err);
      throw err instanceof Error ? err : new Error('Failed to trigger backup');
    }
  };

  const testEmailTemplate = async (templateId: string, recipientEmail: string) => {
    try {
      const { error: dbError } = await supabase.rpc('test_email_template', {
        template_id: templateId,
        recipient: recipientEmail,
      });

      if (dbError) throw dbError;

      await logActivity('tested', 'email_template', { template_id: templateId, recipient: recipientEmail });
    } catch (err) {
      console.error('Error testing email template:', err);
      throw err instanceof Error ? err : new Error('Failed to test email template');
    }
  };

  useEffect(() => {
    // Initialize all data
    fetchSettings();
    fetchFeatureFlags();
    fetchApiIntegrations();
    fetchBackupSchedules();
    fetchRoles();
    fetchPermissions();
    fetchEmailTemplates();

    // If all fetches fail after 3 seconds, use mock data
    const timeoutId = setTimeout(() => {
      if (loading.settings || loading.featureFlags || loading.roles || loading.permissions) {
        console.log('Database connection failed, using mock data');
        setUseMockData(true);
        setSettings(mockSettings);
        setFeatureFlags(mockFeatureFlags);
        
        // Convert mockApiIntegrations to match the ApiIntegration interface
        const formattedApiIntegrations = mockApiIntegrations.map(api => ({
          id: api.id,
          name: api.name,
          key: api.key,
          is_enabled: api.enabled,
          api_key: api.api_key,
          last_used: api.last_used,
          config: api.config,
          credentials: api.credentials,
          description: api.description
        }));
        
        setApiIntegrations(formattedApiIntegrations as ApiIntegration[]);
        setBackupSchedules(mockBackupSchedules as BackupSchedule[]);
        setRoles(mockRoles);
        setPermissions(mockPermissions);
        setEmailTemplates(mockEmailTemplates as EmailTemplate[]);
        
        setLoading({
          settings: false,
          featureFlags: false,
          apiIntegrations: false,
          backupSchedules: false,
          roles: false,
          permissions: false,
          emailTemplates: false,
        });
        setError(null);
      }
    }, 3000);

    // Set up real-time subscriptions only if not using mock data
    let settingsChannel: any = null;
    let flagsChannel: any = null;
    let apiIntegrationsChannel: any = null;

    if (!useMockData) {
      // Set up real-time subscription for settings updates
      settingsChannel = supabase
        .channel('admin-settings')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'system_settings',
          },
          () => {
            fetchSettings();
          }
        )
        .subscribe();

      // Set up real-time subscription for feature flags
      flagsChannel = supabase
        .channel('feature-flags')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'feature_flags',
          },
          () => {
            fetchFeatureFlags();
          }
        )
        .subscribe();

      // Set up real-time subscription for API integrations
      apiIntegrationsChannel = supabase
        .channel('api-integrations')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'api_integrations',
          },
          () => {
            fetchApiIntegrations();
          }
        )
        .subscribe();
    }

    // Clean up function
    return () => {
      clearTimeout(timeoutId);
      if (settingsChannel) settingsChannel.unsubscribe();
      if (flagsChannel) flagsChannel.unsubscribe();
      if (apiIntegrationsChannel) apiIntegrationsChannel.unsubscribe();
    };
  }, []);

  return {
    settings,
    featureFlags,
    apiIntegrations,
    backupSchedules,
    roles,
    permissions,
    emailTemplates,
    loading,
    error,
    updateSetting,
    updateFeatureFlag,
    updateApiIntegration,
    updateBackupSchedule,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionToRole,
    removePermissionFromRole,
    updateEmailTemplate,
    triggerBackup,
    testEmailTemplate,
  };
}
