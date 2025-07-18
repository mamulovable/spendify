# AI Integration & Business Logic Guidelines

## Google Gemini AI Integration
- **Proxy Service**: Use `geminiProxyService.ts` for all AI interactions
- **Error Handling**: Implement robust error handling for AI API failures
- **Rate Limiting**: Respect API rate limits and implement backoff strategies
- **Context Management**: Maintain conversation context for financial advisory
- **Prompt Engineering**: Use structured prompts for consistent AI responses

## AI Financial Advisory Features
```typescript
// AI Service Pattern
export const aiFinancialAdvisorService = {
  async getFinancialAdvice(
    userProfile: UserProfile,
    transactionData: Transaction[],
    query: string
  ): Promise<FinancialAdvice> {
    const context = buildFinancialContext(userProfile, transactionData);
    const prompt = createAdvisoryPrompt(context, query);
    
    try {
      const response = await geminiProxyService.generateContent(prompt);
      return parseFinancialAdvice(response);
    } catch (error) {
      throw new AIServiceError('Failed to generate financial advice', error);
    }
  }
};
```

## Document Processing & OCR
- **PDF Processing**: Use PDF.js for bank statement parsing
- **OCR Integration**: Tesseract.js for receipt text extraction
- **Data Validation**: Validate extracted data before processing
- **Error Recovery**: Handle OCR errors gracefully with manual input fallbacks
- **File Type Support**: Support PDF, JPG, PNG for document uploads

## Financial Data Processing
- **Transaction Categorization**: Automatic categorization using AI and rules
- **Expense Analysis**: Calculate spending patterns and trends
- **Budget Tracking**: Real-time budget vs actual spending comparisons
- **Goal Tracking**: Monitor progress towards financial goals
- **Insights Generation**: AI-powered financial insights and recommendations

## Business Rules & Validation
```typescript
// Financial Validation Rules
export const financialValidators = {
  validateTransaction: (transaction: TransactionInput): ValidationResult => {
    const errors: string[] = [];
    
    if (transaction.amount <= 0) {
      errors.push('Amount must be greater than zero');
    }
    
    if (!transaction.category) {
      errors.push('Category is required');
    }
    
    if (!isValidDate(transaction.date)) {
      errors.push('Valid date is required');
    }
    
    return { isValid: errors.length === 0, errors };
  },
  
  validateBudget: (budget: BudgetInput): ValidationResult => {
    // Budget validation logic
  }
};
```

## Subscription & Feature Gating
- **Tier Management**: Implement feature access based on subscription tiers
- **Usage Limits**: Track and enforce usage limits per subscription tier
- **Feature Gates**: Use `FeatureGate` component for conditional feature access
- **Upgrade Prompts**: Guide users to upgrade when hitting limits
- **Trial Management**: Handle trial periods and conversions

## Data Export & Reporting
- **PDF Generation**: Use jsPDF for financial reports
- **CSV Export**: Export transaction data in CSV format
- **Chart Generation**: Create visual reports with ECharts/Recharts
- **Email Reports**: Automated financial summary emails
- **Data Backup**: User data export for GDPR compliance

## Admin Business Logic
- **User Management**: Admin tools for user account management
- **Subscription Management**: Handle subscription lifecycle
- **Analytics Dashboard**: Business metrics and KPI tracking
- **Content Management**: Manage app content and configurations
- **Audit Logging**: Track all admin actions for compliance

## Financial Calculations
```typescript
// Financial Utility Functions
export const financialUtils = {
  calculateMonthlySpending: (transactions: Transaction[]): number => {
    const currentMonth = new Date().getMonth();
    return transactions
      .filter(t => new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0);
  },
  
  calculateCategoryBreakdown: (transactions: Transaction[]): CategoryBreakdown[] => {
    const breakdown = transactions.reduce((acc, transaction) => {
      const category = transaction.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / transactions.reduce((sum, t) => sum + t.amount, 0)) * 100
    }));
  }
};
```