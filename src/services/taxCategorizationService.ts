import { BankTransaction } from "@/services/pdfService";
import { 
  TaxCategory, 
  TaxDeduction, 
  TaxMetric, 
  TaxInsight
} from "@/types/taxCategorization";
import { v4 as uuidv4 } from "uuid";

// Function to analyze transactions for tax categorization
export const analyzeTaxCategorization = (
  transactions: BankTransaction[]
): {
  taxCategories: TaxCategory[];
  taxDeductions: TaxDeduction[];
  metrics: TaxMetric[];
  insights: TaxInsight[];
} => {
  // Define tax categories
  const taxCategoryDefinitions: Record<string, { description: string, isDeductible: boolean }> = {
    'Business': { 
      description: 'Expenses related to business operations', 
      isDeductible: true 
    },
    'Medical': { 
      description: 'Healthcare and medical expenses', 
      isDeductible: true 
    },
    'Education': { 
      description: 'Educational expenses and tuition', 
      isDeductible: true 
    },
    'Charity': { 
      description: 'Charitable donations and contributions', 
      isDeductible: true 
    },
    'Housing': { 
      description: 'Mortgage interest and property taxes', 
      isDeductible: true 
    },
    'Transportation': { 
      description: 'Vehicle expenses for business use', 
      isDeductible: true 
    },
    'Personal': { 
      description: 'Personal and non-deductible expenses', 
      isDeductible: false 
    },
    'Entertainment': { 
      description: 'Entertainment and dining expenses', 
      isDeductible: false 
    },
    'Shopping': { 
      description: 'Retail purchases and shopping', 
      isDeductible: false 
    },
    'Uncategorized': { 
      description: 'Expenses that have not been categorized', 
      isDeductible: false 
    }
  };
  
  // Initialize tax categories
  const taxCategories: TaxCategory[] = Object.entries(taxCategoryDefinitions).map(([name, details]) => ({
    id: uuidv4(),
    name,
    description: details.description,
    isDeductible: details.isDeductible,
    totalAmount: 0,
    transactionCount: 0
  }));
  
  // Initialize tax deductions
  const taxDeductions: TaxDeduction[] = [];
  
  // Process transactions
  transactions.forEach(transaction => {
    // Skip income transactions - prioritize type over amount
    // IMPORTANT: We have a special case where debit transactions have positive amounts
    if (transaction.type === 'credit' || (transaction.type !== 'debit' && transaction.amount >= 0)) return;
    
    // Determine tax category based on transaction category or description
    let taxCategoryName = 'Uncategorized';
    const description = transaction.description.toLowerCase();
    const category = (transaction.category || '').toLowerCase();
    
    // Simple categorization logic (can be improved with ML in a real app)
    if (
      category.includes('business') || 
      description.includes('business') || 
      description.includes('office') ||
      description.includes('supplies')
    ) {
      taxCategoryName = 'Business';
    } else if (
      category.includes('medical') || 
      category.includes('health') || 
      description.includes('doctor') || 
      description.includes('hospital') ||
      description.includes('pharmacy')
    ) {
      taxCategoryName = 'Medical';
    } else if (
      category.includes('education') || 
      description.includes('school') || 
      description.includes('tuition') ||
      description.includes('university') ||
      description.includes('college')
    ) {
      taxCategoryName = 'Education';
    } else if (
      category.includes('charity') || 
      category.includes('donation') || 
      description.includes('donate') ||
      description.includes('foundation')
    ) {
      taxCategoryName = 'Charity';
    } else if (
      category.includes('housing') || 
      category.includes('mortgage') || 
      description.includes('rent') ||
      description.includes('property tax')
    ) {
      taxCategoryName = 'Housing';
    } else if (
      category.includes('transport') || 
      category.includes('travel') || 
      description.includes('gas') ||
      description.includes('fuel') ||
      description.includes('auto')
    ) {
      taxCategoryName = 'Transportation';
    } else if (
      category.includes('entertainment') || 
      category.includes('dining') || 
      description.includes('restaurant') ||
      description.includes('movie') ||
      description.includes('theater')
    ) {
      taxCategoryName = 'Entertainment';
    } else if (
      category.includes('shopping') || 
      description.includes('store') ||
      description.includes('market') ||
      description.includes('mall')
    ) {
      taxCategoryName = 'Shopping';
    } else if (
      category.includes('personal') || 
      description.includes('personal')
    ) {
      taxCategoryName = 'Personal';
    }
    
    // Update tax category totals
    const taxCategory = taxCategories.find(tc => tc.name === taxCategoryName);
    if (taxCategory) {
      taxCategory.totalAmount += Math.abs(transaction.amount);
      taxCategory.transactionCount += 1;
    }
    
    // Check if this might be a deductible expense
    const isDeductible = taxCategoryDefinitions[taxCategoryName]?.isDeductible || false;
    
    if (isDeductible) {
      // Calculate confidence score (simplified)
      let confidence = 70; // Base confidence
      
      // Adjust confidence based on transaction details
      if (description.includes('business') || category.includes('business')) confidence += 20;
      if (description.length < 5) confidence -= 20;
      if (Math.abs(transaction.amount) > 10000) confidence -= 10;
      
      // Ensure confidence is within 0-100 range
      confidence = Math.max(0, Math.min(100, confidence));
      
      // Add to tax deductions
      taxDeductions.push({
        id: uuidv4(),
        transactionId: transaction.id || uuidv4(),
        date: transaction.date,
        merchant: transaction.description,
        amount: Math.abs(transaction.amount),
        category: taxCategoryName,
        confidence,
        hasReceipt: false // Assuming no receipts in this simplified implementation
      });
    }
  });
  
  // Sort tax categories by total amount (highest first)
  taxCategories.sort((a, b) => b.totalAmount - a.totalAmount);
  
  // Sort tax deductions by amount (highest first)
  taxDeductions.sort((a, b) => b.amount - a.amount);
  
  // Calculate metrics
  const totalDeductible = taxDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'debit' || (t.type !== 'credit' && t.amount < 0))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const deductiblePercentage = totalExpenses > 0 ? (totalDeductible / totalExpenses) * 100 : 0;
  const businessExpenses = taxDeductions
    .filter(d => d.category === 'Business')
    .reduce((sum, d) => sum + d.amount, 0);
  
  const metrics: TaxMetric[] = [
    {
      label: "Potential Deductions",
      value: `₦${totalDeductible.toLocaleString()}`,
      description: "Total potential tax deductions"
    },
    {
      label: "Deductible Percentage",
      value: `${deductiblePercentage.toFixed(1)}%`,
      description: "Percentage of expenses that may be deductible"
    },
    {
      label: "Business Expenses",
      value: `₦${businessExpenses.toLocaleString()}`,
      description: "Total business-related expenses"
    },
    {
      label: "Deductible Categories",
      value: taxCategories.filter(tc => tc.isDeductible && tc.totalAmount > 0).length,
      description: "Number of deductible expense categories"
    }
  ];
  
  // Generate insights
  const insights = generateTaxInsights(taxCategories, taxDeductions, totalDeductible, totalExpenses);
  
  return {
    taxCategories,
    taxDeductions,
    metrics,
    insights
  };
};

// Helper function to generate tax insights
const generateTaxInsights = (
  taxCategories: TaxCategory[],
  taxDeductions: TaxDeduction[],
  totalDeductible: number,
  totalExpenses: number
): TaxInsight[] => {
  const insights: TaxInsight[] = [];
  
  // Deductible expenses insight
  const deductiblePercentage = totalExpenses > 0 ? (totalDeductible / totalExpenses) * 100 : 0;
  
  let deductibleSeverity: "info" | "warning" | "critical" = "info";
  if (deductiblePercentage < 10) deductibleSeverity = "warning";
  
  insights.push({
    title: "Tax Deduction Potential",
    description: `Approximately ${deductiblePercentage.toFixed(1)}% of your expenses may be tax deductible, totaling ₦${totalDeductible.toLocaleString()}.`,
    actionItems: [
      "Review potential deductions for accuracy",
      "Collect and organize receipts for deductible expenses",
      "Consult with a tax professional for personalized advice"
    ],
    severity: deductibleSeverity
  });
  
  // Missing receipts insight
  const deductionsWithoutReceipts = taxDeductions.filter(d => !d.hasReceipt).length;
  const deductionsWithoutReceiptsAmount = taxDeductions
    .filter(d => !d.hasReceipt)
    .reduce((sum, d) => sum + d.amount, 0);
  
  if (deductionsWithoutReceipts > 0) {
    insights.push({
      title: "Missing Receipt Documentation",
      description: `${deductionsWithoutReceipts} potential deductions totaling ₦${deductionsWithoutReceiptsAmount.toLocaleString()} lack receipt documentation.`,
      actionItems: [
        "Collect and digitize receipts for all deductible expenses",
        "Use receipt scanning apps to organize tax documents",
        "Create a system for tracking receipts throughout the year"
      ],
      severity: "warning"
    });
  }
  
  // Business expense insight
  const businessExpenses = taxCategories.find(tc => tc.name === 'Business');
  if (businessExpenses && businessExpenses.totalAmount > 0) {
    insights.push({
      title: "Business Expense Management",
      description: `You have ₦${businessExpenses.totalAmount.toLocaleString()} in potential business expenses across ${businessExpenses.transactionCount} transactions.`,
      actionItems: [
        "Separate business and personal expenses more clearly",
        "Consider setting up a dedicated business account",
        "Track business mileage and travel expenses separately"
      ],
      severity: "info"
    });
  }
  
  // Tax category distribution insight
  const deductibleCategories = taxCategories.filter(tc => tc.isDeductible && tc.totalAmount > 0);
  if (deductibleCategories.length > 0) {
    insights.push({
      title: "Tax Category Distribution",
      description: `Your expenses span ${deductibleCategories.length} potentially deductible categories, with the largest being ${deductibleCategories[0].name}.`,
      actionItems: [
        "Review categorization for accuracy",
        "Look for additional deductible expenses in underrepresented categories",
        "Consider tax planning strategies for next year"
      ],
      severity: "info"
    });
  }
  
  return insights;
};