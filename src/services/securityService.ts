import { BankTransaction } from "@/services/pdfService";
import { SecurityAlert, SecurityInsight, SecurityMetric, RiskLevelData, TimelineEvent } from "@/types/securityAlert";
import { v4 as uuidv4 } from "uuid";

// Function to analyze transactions and detect potential security issues
export const analyzeTransactionsForSecurity = (
  transactions: BankTransaction[]
): {
  alerts: SecurityAlert[];
  metrics: SecurityMetric[];
  riskData: RiskLevelData[];
  timelineData: TimelineEvent[];
  insights: SecurityInsight[];
} => {
  // Debug logging
  console.log("Security Service - Analyzing transactions:", transactions.length);
  console.log("Security Service - First few transactions:", transactions.slice(0, 3));
  
  // Initialize results
  const alerts: SecurityAlert[] = [];
  const timelineEvents: TimelineEvent[] = [];
  
  // Risk patterns to check
  const riskPatterns = [
    { pattern: /international|foreign|overseas/i, score: 60, description: "International transaction" },
    { pattern: /crypto|bitcoin|ethereum|binance|coinbase/i, score: 70, description: "Cryptocurrency transaction" },
    { pattern: /gambling|casino|bet|lottery/i, score: 65, description: "Gambling transaction" },
    { pattern: /unusual amount/i, score: 75, description: "Unusual transaction amount" },
    { pattern: /unrecognized merchant/i, score: 80, description: "Unrecognized merchant" },
    { pattern: /duplicate|multiple charges/i, score: 85, description: "Duplicate transaction" },
  ];

  // Process each transaction
  transactions.forEach((transaction) => {
    // Skip income transactions for security analysis
    // IMPORTANT: We have a special case where debit transactions have positive amounts
    // So we need to check the type first, and only check amount if type is not specified
    if (transaction.type === 'credit' || (transaction.type !== 'debit' && transaction.amount > 0)) return;
    
    // Calculate base risk score based on amount (higher amounts = higher risk)
    const absAmount = Math.abs(transaction.amount);
    let baseRiskScore = 0;
    
    // Higher amounts get higher base risk scores
    if (absAmount > 100000) baseRiskScore = 40;
    else if (absAmount > 50000) baseRiskScore = 30;
    else if (absAmount > 10000) baseRiskScore = 20;
    else if (absAmount > 5000) baseRiskScore = 10;
    
    // Check for risk patterns in description
    let highestRiskScore = baseRiskScore;
    let riskDescription = "";
    
    for (const { pattern, score, description } of riskPatterns) {
      if (pattern.test(transaction.description) && score > highestRiskScore) {
        highestRiskScore = score;
        riskDescription = description;
      }
    }
    
    // Check for unusual merchants (simplified example)
    const knownMerchants = [
      "NETFLIX", "AMAZON", "UBER", "SPOTIFY", "APPLE", "GOOGLE", "MICROSOFT",
      "WALMART", "TARGET", "STARBUCKS", "MCDONALDS", "SHELL", "EXXON"
    ];
    
    const merchantName = transaction.description.split(' ')[0].toUpperCase();
    if (!knownMerchants.includes(merchantName)) {
      highestRiskScore += 10;
      riskDescription += riskDescription ? ", Unknown merchant" : "Unknown merchant";
    }
    
    // Determine risk level based on score
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (highestRiskScore >= 80) riskLevel = 'critical';
    else if (highestRiskScore >= 60) riskLevel = 'high';
    else if (highestRiskScore >= 40) riskLevel = 'medium';
    
    // Only add alerts for medium risk and above
    if (highestRiskScore >= 40) {
      const alert: SecurityAlert = {
        id: uuidv4(),
        userId: "current-user", // This would be replaced with actual user ID
        transactionId: transaction.id || uuidv4(),
        date: transaction.date,
        merchant: transaction.description,
        amount: transaction.amount,
        riskScore: highestRiskScore,
        riskLevel,
        category: transaction.category || "Uncategorized",
        description: riskDescription || "Potential security concern",
        isResolved: false,
        createdAt: new Date().toISOString()
      };
      
      alerts.push(alert);
      
      // Add to timeline for medium risk and above
      const timelineEvent: TimelineEvent = {
        id: alert.id,
        date: alert.date,
        description: alert.description,
        riskLevel: alert.riskLevel,
        amount: alert.amount,
        merchant: alert.merchant
      };
      
      timelineEvents.push(timelineEvent);
    }
  });
  
  // Sort alerts by risk score (highest first)
  alerts.sort((a, b) => b.riskScore - a.riskScore);
  
  // Sort timeline events by date (newest first)
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate metrics
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.riskLevel === 'critical').length;
  const highRiskAlerts = alerts.filter(a => a.riskLevel === 'high').length;
  const totalRiskAmount = alerts.reduce((sum, alert) => sum + Math.abs(alert.amount), 0);
  
  const metrics: SecurityMetric[] = [
    {
      label: "Total Alerts",
      value: totalAlerts,
      description: "Security alerts detected"
    },
    {
      label: "Critical Alerts",
      value: criticalAlerts,
      description: "High priority security concerns"
    },
    {
      label: "High Risk Alerts",
      value: highRiskAlerts,
      description: "Elevated risk transactions"
    },
    {
      label: "Risk Amount",
      value: `₦${totalRiskAmount.toLocaleString()}`,
      description: "Total amount in flagged transactions"
    }
  ];
  
  // Generate risk level data for charts
  const riskData: RiskLevelData[] = [
    { name: "Critical", value: criticalAlerts, color: "#ef4444" },
    { name: "High", value: highRiskAlerts, color: "#f97316" },
    { name: "Medium", value: alerts.filter(a => a.riskLevel === 'medium').length, color: "#eab308" },
    { name: "Low", value: alerts.filter(a => a.riskLevel === 'low').length, color: "#22c55e" }
  ];
  
  // Generate insights based on the alerts
  const insights: SecurityInsight[] = [];
  
  if (criticalAlerts > 0) {
    insights.push({
      title: "Critical Security Alerts Detected",
      description: `${criticalAlerts} critical security alerts were detected in your transactions. These require immediate attention.`,
      actionItems: [
        "Review and verify these transactions immediately",
        "Contact your bank if you don't recognize these transactions",
        "Consider freezing your card if suspicious activity is confirmed"
      ],
      severity: "critical"
    });
  }
  
  if (highRiskAlerts > 0) {
    insights.push({
      title: "High Risk Transactions Identified",
      description: `${highRiskAlerts} high risk transactions were identified that may require your attention.`,
      actionItems: [
        "Verify these transactions against your records",
        "Set up transaction alerts for similar future transactions",
        "Consider updating your security preferences"
      ],
      severity: "warning"
    });
  }
  
  // Add general security recommendations
  insights.push({
    title: "Security Recommendations",
    description: "Based on your transaction patterns, here are some security recommendations to keep your accounts safe.",
    actionItems: [
      "Enable two-factor authentication on all financial accounts",
      "Regularly monitor your accounts for unauthorized transactions",
      "Use unique passwords for different financial services",
      "Consider setting up spending alerts for unusual activity"
    ],
    severity: "info"
  });
  
  return {
    alerts,
    metrics,
    riskData,
    timelineData: timelineEvents,
    insights
  };
};