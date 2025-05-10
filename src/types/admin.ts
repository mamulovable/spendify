export interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  role_id: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  role?: AdminRole;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  permissions?: AdminPermission[];
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface AdminDashboardSettings {
  id: string;
  admin_user_id: string;
  layout: Record<string, any>;
  widgets: Record<string, any>;
  preferences: Record<string, any>;
}

export interface AdminMetric {
  id: string;
  metric_name: string;
  metric_value: any;
  metric_type: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin_email?: string;
  role_name?: string;
}
