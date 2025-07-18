import { supabase } from '@/lib/supabase';
import { SecurityAlert, SecurityMetrics, SecuritySettings, SecurityAlertFilters } from '@/types/security';

export const securityService = {
  // Get security alerts with filtering
  async getSecurityAlerts(filters: SecurityAlertFilters = {}, page = 1, pageSize = 20): Promise<{ alerts: SecurityAlert[]; total: number }> {
    let query = supabase
      .from('security_alerts')
      .select(`
        *,
        user:users(email, display_name),
        admin:admin_users(email, full_name),
        resolved_by:admin_users(full_name)
      `, { count: 'exact' });
    
    // Apply filters
    if (filters.alertType) {
      query = query.eq('alert_type', filters.alertType);
    }
    
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    
    if (filters.resolved !== undefined) {
      query = query.eq('resolved', filters.resolved);
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
      query = query.or(`message.ilike.%${filters.searchTerm}%,details.ilike.%${filters.searchTerm}%`);
    }
    
    // Add pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Execute query
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) {
      console.error('Error fetching security alerts:', error);
      throw new Error(`Failed to fetch security alerts: ${error.message}`);
    }
    
    const alerts = data.map(item => ({
      id: item.id,
      alertType: item.alert_type,
      severity: item.severity,
      message: item.message,
      details: item.details,
      userId: item.user_id,
      adminId: item.admin_id,
      ipAddress: item.ip_address,
      userAgent: item.user_agent,
      resolved: item.resolved,
      resolvedBy: item.resolved_by,
      resolvedAt: item.resolved_at,
      createdAt: item.created_at
    }));
    
    return {
      alerts,
      total: count || 0
    };
  },
  
  // Get security alert details
  async getSecurityAlertDetails(id: string): Promise<SecurityAlert | null> {
    const { data, error } = await supabase
      .from('security_alerts')
      .select(`
        *,
        user:users(email, display_name),
        admin:admin_users(email, full_name),
        resolved_by:admin_users(full_name)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error(`Error fetching security alert ${id}:`, error);
      throw new Error(`Failed to fetch security alert: ${error.message}`);
    }
    
    return {
      id: data.id,
      alertType: data.alert_type,
      severity: data.severity,
      message: data.message,
      details: data.details,
      userId: data.user_id,
      adminId: data.admin_id,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      resolved: data.resolved,
      resolvedBy: data.resolved_by,
      resolvedAt: data.resolved_at,
      createdAt: data.created_at
    };
  },
  
  // Resolve a security alert
  async resolveAlert(id: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { error } = await supabase
      .from('security_alerts')
      .update({
        resolved: true,
        resolved_by: userId,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error(`Error resolving security alert ${id}:`, error);
      throw new Error(`Failed to resolve security alert: ${error.message}`);
    }
  },
  
  // Get security metrics
  async getSecurityMetrics(days = 30): Promise<SecurityMetrics> {
    // In a real implementation, this would fetch actual metrics from the database
    // For now, we'll return mock data
    
    // Generate dates for trend data
    const trendData = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      trendData.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) // Random count between 0-4
      });
    }
    
    return {
      totalAlerts: 127,
      unresolvedAlerts: 23,
      criticalAlerts: 5,
      alertsByType: {
        failed_login_attempt: 42,
        suspicious_login_location: 18,
        brute_force_attempt: 7,
        permission_violation: 15,
        api_abuse: 23,
        unusual_activity: 12,
        data_access_anomaly: 5,
        configuration_change: 5
      },
      alertsBySeverity: {
        low: 48,
        medium: 52,
        high: 22,
        critical: 5
      },
      alertsTrend: trendData,
      loginAttempts: {
        successful: 1245,
        failed: 87
      }
    };
  },
  
  // Get security settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    // In a real implementation, this would fetch actual settings from the database
    // For now, we'll return mock data
    return {
      loginAttemptThreshold: 5,
      loginLockoutDuration: 30,
      enableGeoIpCheck: true,
      allowedCountries: ['US', 'CA', 'GB', 'AU'],
      enableBruteForceProtection: true,
      enableAnomalyDetection: true,
      alertEmailRecipients: ['admin@spendify.com', 'security@spendify.com']
    };
  },
  
  // Update security settings
  async updateSecuritySettings(settings: SecuritySettings): Promise<void> {
    // In a real implementation, this would update settings in the database
    console.log('Updating security settings:', settings);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};