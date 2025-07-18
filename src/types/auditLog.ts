export interface AuditLog {
  id: string;
  adminId: string | null;
  adminName?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  'admin_users': 'Admin User',
  'admin_roles': 'Admin Role',
  'users': 'User',
  'feature_flags': 'Feature Flag',
  'app_configuration': 'App Configuration',
  'app_announcements': 'Announcement',
  'support_tickets': 'Support Ticket',
  'ai_feedback': 'AI Feedback',
  'module_configurations': 'Module Configuration',
  'subscription': 'Subscription',
  'document': 'Document',
};

export const ACTION_TYPE_LABELS: Record<string, string> = {
  'create': 'Create',
  'update': 'Update',
  'delete': 'Delete',
  'toggle_feature_flag': 'Toggle Feature Flag',
  'update_app_configuration': 'Update Configuration',
  'create_announcement': 'Create Announcement',
  'update_announcement': 'Update Announcement',
  'login': 'Login',
  'logout': 'Logout',
  'password_reset': 'Password Reset',
  'assign_ticket': 'Assign Ticket',
  'close_ticket': 'Close Ticket',
  'suspend_user': 'Suspend User',
  'activate_user': 'Activate User',
};