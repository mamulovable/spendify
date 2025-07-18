import { supabase } from '@/lib/supabase';
import { AuditLog, AuditLogFilters } from '@/types/auditLog';
import { format } from 'date-fns';

export const auditLogService = {
  // Get audit logs with filtering
  async getAuditLogs(filters: AuditLogFilters = {}, page = 1, pageSize = 20): Promise<{ logs: AuditLog[]; total: number }> {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin:admin_users(full_name)
      `, { count: 'exact' });
    
    // Apply filters
    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }
    
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      // Add one day to include the end date fully
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }
    
    if (filters.searchTerm) {
      query = query.or(`entity_id.ilike.%${filters.searchTerm}%,details.ilike.%${filters.searchTerm}%`);
    }
    
    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Execute query
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }
    
    const logs = data.map(item => ({
      id: item.id,
      adminId: item.admin_id,
      adminName: item.admin?.full_name,
      action: item.action,
      entityType: item.entity_type,
      entityId: item.entity_id,
      details: item.details,
      ipAddress: item.ip_address,
      userAgent: item.user_agent,
      createdAt: item.created_at
    }));
    
    return {
      logs,
      total: count || 0
    };
  },
  
  // Get audit log details
  async getAuditLogDetails(id: string): Promise<AuditLog | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        admin:admin_users(full_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching audit log ${id}:`, error);
      throw new Error(`Failed to fetch audit log: ${error.message}`);
    }
    
    return {
      id: data.id,
      adminId: data.admin_id,
      adminName: data.admin?.full_name,
      action: data.action,
      entityType: data.entity_type,
      entityId: data.entity_id,
      details: data.details,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      createdAt: data.created_at
    };
  },
  
  // Get unique action types for filtering
  async getActionTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('action')
      .limit(1000);
    
    if (error) {
      console.error('Error fetching action types:', error);
      throw new Error(`Failed to fetch action types: ${error.message}`);
    }
    
    // Extract unique action types
    const actionTypes = [...new Set(data.map(item => item.action))];
    return actionTypes;
  },
  
  // Get unique entity types for filtering
  async getEntityTypes(): Promise<string[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('entity_type')
      .limit(1000);
    
    if (error) {
      console.error('Error fetching entity types:', error);
      throw new Error(`Failed to fetch entity types: ${error.message}`);
    }
    
    // Extract unique entity types
    const entityTypes = [...new Set(data.map(item => item.entity_type))];
    return entityTypes;
  },
  
  // Get admin users for filtering
  async getAdminUsers(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, full_name')
      .order('full_name');
    
    if (error) {
      console.error('Error fetching admin users:', error);
      throw new Error(`Failed to fetch admin users: ${error.message}`);
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.full_name
    }));
  },
  
  // Export audit logs to CSV
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<string> {
    // Get all logs matching filters (no pagination)
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        admin:admin_users(full_name)
      `);
    
    // Apply filters
    if (filters.adminId) {
      query = query.eq('admin_id', filters.adminId);
    }
    
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      // Add one day to include the end date fully
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }
    
    if (filters.searchTerm) {
      query = query.or(`entity_id.ilike.%${filters.searchTerm}%,details.ilike.%${filters.searchTerm}%`);
    }
    
    // Execute query
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(10000); // Limit to prevent huge exports
    
    if (error) {
      console.error('Error exporting audit logs:', error);
      throw new Error(`Failed to export audit logs: ${error.message}`);
    }
    
    // Convert to CSV
    const headers = ['Date', 'Time', 'Admin', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Details'];
    const rows = data.map(item => [
      format(new Date(item.created_at), 'yyyy-MM-dd'),
      format(new Date(item.created_at), 'HH:mm:ss'),
      item.admin?.full_name || 'System',
      item.action,
      item.entity_type,
      item.entity_id,
      item.ip_address || '',
      JSON.stringify(item.details)
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    return csvContent;
  }
};