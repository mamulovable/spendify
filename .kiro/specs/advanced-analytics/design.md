# Design Document: Advanced Analytics

## Overview

The Advanced Analytics feature extends the application's basic financial analysis capabilities with six specialized analytics tabs that provide deeper insights into the user's financial data. This feature will be accessible via a "View More Advanced Data" button on the basic analysis page, redirecting users to a dedicated advanced analytics page with tabbed navigation.

The design focuses on creating a cohesive user experience that maintains consistency with the existing application design while providing rich, interactive visualizations and AI-powered insights for each analytics category.

## Architecture

The Advanced Analytics feature will follow the existing application architecture patterns:

1. **Component Structure**:
   - Page component (`MoreAnalyticsPage.tsx`)
   - Tab container component (`AnalyticsTabs.tsx`)
   - Individual tab components for each analytics category
   - Shared visualization components
   - AI insight components

2. **Data Flow**:
   - Data will be fetched from Supabase using existing service patterns
   - React Query will be used for data fetching, caching, and state management
   - Context API will be used for sharing state between tabs if necessary

3. **Integration Points**:
   - Basic Analysis page (for the "View More Advanced Data" button)
   - Existing transaction data services
   - AI advisory services for generating insights
   - Authentication and subscription services for feature gating

## Components and Interfaces

### Page Components

#### MoreAnalyticsPage

```typescript
// src/pages/MoreAnalyticsPage.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScamAlertsTab } from "@/components/analytics/ScamAlertsTab";
import { RecurringExpensesTab } from "@/components/analytics/RecurringExpensesTab";
import { CashFlowTab } from "@/components/analytics/CashFlowTab";
import { MerchantIntelligenceTab } from "@/components/analytics/MerchantIntelligenceTab";
import { FinancialHealthTab } from "@/components/analytics/FinancialHealthTab";
import { TaxCategorizationTab } from "@/components/analytics/TaxCategorizationTab";

const MoreAnalyticsPage = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Advanced Analytics</h1>
      
      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid grid-cols-6 mb-8">
          <TabsTrigger value="security">Scam Alerts & Security</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Expenses</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow Analysis</TabsTrigger>
          <TabsTrigger value="merchants">Merchant Intelligence</TabsTrigger>
          <TabsTrigger value="health">Financial Health Score</TabsTrigger>
          <TabsTrigger value="tax">Tax & Expense Categorization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="security">
          <ScamAlertsTab />
        </TabsContent>
        
        <TabsContent value="recurring">
          <RecurringExpensesTab />
        </TabsContent>
        
        <TabsContent value="cashflow">
          <CashFlowTab />
        </TabsContent>
        
        <TabsContent value="merchants">
          <MerchantIntelligenceTab />
        </TabsContent>
        
        <TabsContent value="health">
          <FinancialHealthTab />
        </TabsContent>
        
        <TabsContent value="tax">
          <TaxCategorizationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MoreAnalyticsPage;
```

### Tab Components

Each tab will follow a consistent structure:

1. Header with tab title and description
2. Key metrics cards
3. Main visualization section
4. AI insights and recommendations panel
5. Detailed data table (expandable/collapsible)
6. Export options

#### Example: ScamAlertsTab

```typescript
// src/components/analytics/ScamAlertsTab.tsx
import { Card } from "@/components/ui/card";
import { MetricsCards } from "@/components/analytics/shared/MetricsCards";
import { RiskLevelChart } from "@/components/analytics/security/RiskLevelChart";
import { SuspiciousTransactionTimeline } from "@/components/analytics/security/SuspiciousTransactionTimeline";
import { AIInsightsPanel } from "@/components/analytics/shared/AIInsightsPanel";
import { TransactionTable } from "@/components/analytics/shared/TransactionTable";
import { ExportButton } from "@/components/analytics/shared/ExportButton";
import { useSecurityAlerts } from "@/hooks/useSecurityAlerts";

export const ScamAlertsTab = () => {
  const { 
    alerts, 
    metrics, 
    riskData, 
    timelineData, 
    insights, 
    isLoading 
  } = useSecurityAlerts();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Scam Alerts & Security</h2>
          <p className="text-muted-foreground">
            Monitor and protect your accounts from suspicious activities
          </p>
        </div>
        <ExportButton data={alerts} filename="security-alerts" />
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Risk Level Assessment</h3>
          <RiskLevelChart data={riskData} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Suspicious Activity Timeline</h3>
          <SuspiciousTransactionTimeline data={timelineData} />
        </Card>
      </div>
      
      <AIInsightsPanel insights={insights} />
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Flagged Transactions</h3>
        <TransactionTable 
          transactions={alerts} 
          columns={["date", "merchant", "amount", "riskScore", "category"]} 
        />
      </Card>
    </div>
  );
};
```

### Shared Components

#### MetricsCards

```typescript
// src/components/analytics/shared/MetricsCards.tsx
import { Card, CardContent } from "@/components/ui/card";

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

interface MetricsCardsProps {
  metrics: Metric[];
}

export const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              {metric.icon}
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              {metric.change !== undefined && (
                <span className={`ml-2 text-sm ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

#### AIInsightsPanel

```typescript
// src/components/analytics/shared/AIInsightsPanel.tsx
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface Insight {
  title: string;
  description: string;
  actionItems?: string[];
}

interface AIInsightsPanelProps {
  insights: Insight[];
}

export const AIInsightsPanel = ({ insights }: AIInsightsPanelProps) => {
  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">AI-Powered Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <h4 className="font-medium mb-1">{insight.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
            
            {insight.actionItems && insight.actionItems.length > 0 && (
              <div className="mt-2">
                <h5 className="text-sm font-medium mb-1">Recommended Actions:</h5>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {insight.actionItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
```

## Data Models

### Security Alert

```typescript
// src/types/securityAlert.ts
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
```

### Recurring Expense

```typescript
// src/types/recurringExpense.ts
export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastCharged: string;
  nextExpectedCharge: string;
  category: string;
  isActive: boolean;
  isForgotten: boolean; // Flagged as potentially forgotten
  alternativeSuggestions?: {
    name: string;
    price: number;
    savingsAmount: number;
    savingsPercentage: number;
    link?: string;
  }[];
  transactions: string[]; // Array of transaction IDs
}
```

### Cash Flow

```typescript
// src/types/cashFlow.ts
export interface CashFlowData {
  month: string; // YYYY-MM format
  income: number;
  expenses: number;
  netCashFlow: number;
  predictedIncome?: number;
  predictedExpenses?: number;
  predictedNetCashFlow?: number;
  isPrediction: boolean;
}

export interface CashFlowGap {
  startDate: string;
  endDate: string;
  amount: number;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}
```

### Merchant Intelligence

```typescript
// src/types/merchantIntelligence.ts
export interface MerchantData {
  id: string;
  name: string;
  totalSpent: number;
  transactionCount: number;
  averageTransaction: number;
  frequencyPerMonth: number;
  lastVisited: string;
  category: string;
  seasonalPattern?: {
    quarter: number;
    spending: number;
  }[];
  priceComparisons?: {
    competitor: string;
    potentialSavings: number;
    savingsPercentage: number;
  }[];
  loyaltyPrograms?: {
    name: string;
    description: string;
    potentialSavings: number;
    link?: string;
  }[];
}
```

### Financial Health

```typescript
// src/types/financialHealth.ts
export interface FinancialHealthScore {
  userId: string;
  overallScore: number; // 0-100
  creditUtilization?: number; // Percentage
  savingsRate: number; // Percentage
  debtToIncome: number; // Ratio
  emergencyFundMonths: number;
  goalProgress: {
    goalId: string;
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
  }[];
  recommendations: {
    category: 'savings' | 'debt' | 'spending' | 'income' | 'investment';
    description: string;
    impact: number; // Potential score improvement
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  historicalScores: {
    date: string;
    score: number;
  }[];
}
```

### Tax Categorization

```typescript
// src/types/taxCategorization.ts
export interface TaxCategory {
  id: string;
  name: string;
  description: string;
  isDeductible: boolean;
  totalAmount: number;
  transactionCount: number;
}

export interface TaxDeduction {
  id: string;
  transactionId: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  confidence: number; // 0-100
  hasReceipt: boolean;
  receiptId?: string;
  notes?: string;
}
```

## Error Handling

1. **Data Loading Errors**:
   - Display user-friendly error messages
   - Implement retry mechanisms for failed API calls
   - Provide fallback UI components when data is unavailable

2. **Empty State Handling**:
   - Design empty states for each tab when no data is available
   - Provide guidance on how to generate data (e.g., "Upload bank statements to see security alerts")

3. **Permission Errors**:
   - Handle subscription tier limitations gracefully
   - Show upgrade prompts when users attempt to access premium features

4. **Data Processing Errors**:
   - Log errors for debugging
   - Display appropriate error messages to users
   - Implement graceful degradation of features

## Testing Strategy

1. **Unit Tests**:
   - Test individual components in isolation
   - Verify correct rendering of charts and visualizations
   - Test data transformation functions

2. **Integration Tests**:
   - Test tab navigation and state preservation
   - Verify data fetching and error handling
   - Test interactions between components

3. **End-to-End Tests**:
   - Test complete user flows
   - Verify redirections from basic analysis to advanced analytics
   - Test export functionality

4. **Visual Regression Tests**:
   - Ensure consistent rendering across different screen sizes
   - Verify dark/light mode compatibility

5. **Accessibility Testing**:
   - Ensure all components are keyboard navigable
   - Verify screen reader compatibility
   - Test color contrast for all UI elements