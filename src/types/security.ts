export interface SecurityAlert {
  id: string;
  alertType: SecurityAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, any>;
  userId?: string | null;
  adminId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  resolved: boolean;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export type SecurityAlertType = 
  | 'failed_login_attempt'
  | 'suspicious_login_location'
  | 'brute_force_attempt'
  | 'permission_violation'
  | 'api_abuse'
  | 'unusual_activity'
  | 'data_access_anomaly'
  | 'configuration_change';

export interface SecurityMetrics {
  totalAlerts: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  alertsByType: Record<SecurityAlertType, number>;
  alertsBySeverity: Record<string, number>;
  alertsTrend: {
    date: string;
    count: number;
  }[];
  loginAttempts: {
    successful: number;
    failed: number;
  };
}

export interface SecuritySettings {
  loginAttemptThreshold: number;
  loginLockoutDuration: number;
  enableGeoIpCheck: boolean;
  allowedCountries: string[];
  enableBruteForceProtection: boolean;
  enableAnomalyDetection: boolean;
  alertEmailRecipients: string[];
}

export interface SecurityAlertFilters {
  alertType?: SecurityAlertType;
  severity?: string;
  resolved?: boolean;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}