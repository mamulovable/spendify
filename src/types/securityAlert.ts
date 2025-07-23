export interface SecurityAlert {
  id: string;
  userId: string;
  transactionId: string;
  date: string;
  merchant: string;
  amount: number;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface SecurityMetric {
  label: string;
  value: string | number;
  change?: number;
  description?: string;
}

export interface RiskLevelData {
  name: string;
  value: number;
  color: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  amount: number;
  merchant: string;
}

export interface SecurityInsight {
  title: string;
  description: string;
  actionItems: string[];
  severity: "info" | "warning" | "critical";
}