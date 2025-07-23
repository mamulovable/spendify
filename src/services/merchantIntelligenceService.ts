import { BankTransaction } from "@/services/pdfService";
import { 
  MerchantData, 
  MerchantMetric, 
  MerchantInsight,
  SeasonalPattern,
  PriceComparison,
  LoyaltyProgram
} from "@/types/merchantIntelligence";
import { v4 as uuidv4 } from "uuid";

// Function to analyze merchant intelligence from transactions
export const analyzeMerchantIntelligence = (
  transactions: BankTransaction[]
): {
  merchants: MerchantData[];
  metrics: MerchantMetric[];
  insights: MerchantInsight[];
} => {
  // Debug logging
  console.log("Merchant Intelligence Service - Analyzing transactions:", transactions.length);
  console.log("Merchant Intelligence Service - First few transactions:", transactions.slice(0, 3));
  
  // Group transactions by merchant
  const merchantMap: Record<string, BankTransaction[]> = {};
  
  // Only consider expense transactions - prioritize type over amount
  // IMPORTANT: We have a special case where debit transactions have positive amounts
  const expenseTransactions = transactions.filter(t => t.type === 'debit' || (t.type !== 'credit' && t.amount < 0));
  
  // Group by merchant name
  expenseTransactions.forEach(transaction => {
    // Extract merchant name from description (simplified)
    const merchantName = extractMerchantName(transaction.description);
    
    if (!merchantMap[merchantName]) {
      merchantMap[merchantName] = [];
    }
    
    merchantMap[merchantName].push(transaction);
  });
  
  // Process merchant data
  const merchants: MerchantData[] = [];
  
  Object.entries(merchantMap).forEach(([merchantName, merchantTransactions]) => {
    // Skip merchants with only one transaction
    if (merchantTransactions.length < 2) return;
    
    // Calculate total spent
    const totalSpent = merchantTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate average transaction amount
    const averageTransaction = totalSpent / merchantTransactions.length;
    
    // Calculate frequency per month
    const dates = merchantTransactions.map(t => new Date(t.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const monthsDiff = (maxDate.getFullYear() - minDate.getFullYear()) * 12 + (maxDate.getMonth() - minDate.getMonth()) + 1;
    const frequencyPerMonth = merchantTransactions.length / Math.max(1, monthsDiff);
    
    // Get last visited date
    const lastVisited = maxDate.toISOString().split('T')[0];
    
    // Get most common category
    const categoryMap: Record<string, number> = {};
    merchantTransactions.forEach(t => {
      const category = t.category || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    const category = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])[0][0];
    
    // Generate seasonal patterns
    const seasonalPatterns = generateSeasonalPatterns(merchantTransactions);
    
    // Generate price comparisons
    const priceComparisons = generatePriceComparisons(merchantName, averageTransaction);
    
    // Generate loyalty programs
    const loyaltyPrograms = generateLoyaltyPrograms(merchantName, totalSpent);
    
    merchants.push({
      id: uuidv4(),
      name: merchantName,
      totalSpent,
      transactionCount: merchantTransactions.length,
      averageTransaction,
      frequencyPerMonth,
      lastVisited,
      category,
      seasonalPattern: seasonalPatterns,
      priceComparisons: priceComparisons.length > 0 ? priceComparisons : undefined,
      loyaltyPrograms: loyaltyPrograms.length > 0 ? loyaltyPrograms : undefined
    });
  });
  
  // Sort merchants by total spent (highest first)
  merchants.sort((a, b) => b.totalSpent - a.totalSpent);
  
  // Calculate metrics
  const totalMerchants = merchants.length;
  const totalSpent = merchants.reduce((sum, m) => sum + m.totalSpent, 0);
  const topMerchantSpend = merchants.length > 0 ? merchants[0].totalSpent : 0;
  const topMerchantPercentage = totalSpent > 0 ? (topMerchantSpend / totalSpent) * 100 : 0;
  
  const metrics: MerchantMetric[] = [
    {
      label: "Total Merchants",
      value: totalMerchants,
      description: "Unique merchants identified"
    },
    {
      label: "Total Spent",
      value: `₦${totalSpent.toLocaleString()}`,
      description: "Total amount spent across all merchants"
    },
    {
      label: "Top Merchant",
      value: merchants.length > 0 ? merchants[0].name : "N/A",
      description: merchants.length > 0 ? `₦${merchants[0].totalSpent.toLocaleString()} (${topMerchantPercentage.toFixed(1)}%)` : ""
    },
    {
      label: "Average Per Merchant",
      value: `₦${(totalSpent / Math.max(1, totalMerchants)).toLocaleString()}`,
      description: "Average spending per merchant"
    }
  ];
  
  // Generate insights
  const insights = generateMerchantInsights(merchants);
  
  return {
    merchants,
    metrics,
    insights
  };
};

// Helper function to extract merchant name from transaction description
const extractMerchantName = (description: string): string => {
  // Basic extraction logic (can be improved)
  const parts = description.split(/\s+/);
  return parts[0]; // Use first word as merchant name
};

// Helper function to generate seasonal patterns
const generateSeasonalPatterns = (transactions: BankTransaction[]): SeasonalPattern[] => {
  const quarterlySpending: Record<number, number> = {
    1: 0, // Q1 (Jan-Mar)
    2: 0, // Q2 (Apr-Jun)
    3: 0, // Q3 (Jul-Sep)
    4: 0  // Q4 (Oct-Dec)
  };
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const month = date.getMonth();
    let quarter = 1;
    
    if (month >= 3 && month < 6) quarter = 2;
    else if (month >= 6 && month < 9) quarter = 3;
    else if (month >= 9) quarter = 4;
    
    quarterlySpending[quarter] += Math.abs(transaction.amount);
  });
  
  return Object.entries(quarterlySpending)
    .map(([quarter, spending]) => ({
      quarter: parseInt(quarter),
      spending
    }));
};

// Helper function to generate price comparisons
const generatePriceComparisons = (merchantName: string, averageTransaction: number): PriceComparison[] => {
  const comparisons: PriceComparison[] = [];
  
  // Example price comparisons for common merchants
  if (merchantName.toLowerCase().includes('netflix')) {
    comparisons.push({
      competitor: 'Disney+',
      potentialSavings: averageTransaction * 0.4,
      savingsPercentage: 40
    });
    comparisons.push({
      competitor: 'Amazon Prime',
      potentialSavings: averageTransaction * 0.5,
      savingsPercentage: 50
    });
  } else if (merchantName.toLowerCase().includes('uber')) {
    comparisons.push({
      competitor: 'Bolt',
      potentialSavings: averageTransaction * 0.3,
      savingsPercentage: 30
    });
    comparisons.push({
      competitor: 'Public Transportation',
      potentialSavings: averageTransaction * 0.7,
      savingsPercentage: 70
    });
  } else if (merchantName.toLowerCase().includes('starbucks')) {
    comparisons.push({
      competitor: 'Local Coffee Shop',
      potentialSavings: averageTransaction * 0.25,
      savingsPercentage: 25
    });
    comparisons.push({
      competitor: 'Home Brewing',
      potentialSavings: averageTransaction * 0.8,
      savingsPercentage: 80
    });
  }
  
  return comparisons;
};

// Helper function to generate loyalty programs
const generateLoyaltyPrograms = (merchantName: string, totalSpent: number): LoyaltyProgram[] => {
  const programs: LoyaltyProgram[] = [];
  
  // Example loyalty programs for common merchants
  if (merchantName.toLowerCase().includes('amazon')) {
    programs.push({
      name: 'Amazon Prime',
      description: 'Free shipping, streaming, and more',
      potentialSavings: totalSpent * 0.1,
      link: 'https://www.amazon.com/prime'
    });
  } else if (merchantName.toLowerCase().includes('starbucks')) {
    programs.push({
      name: 'Starbucks Rewards',
      description: 'Earn stars for free drinks and food',
      potentialSavings: totalSpent * 0.15,
      link: 'https://www.starbucks.com/rewards'
    });
  } else if (merchantName.toLowerCase().includes('walmart')) {
    programs.push({
      name: 'Walmart+',
      description: 'Free delivery, fuel discounts, and more',
      potentialSavings: totalSpent * 0.08,
      link: 'https://www.walmart.com/plus'
    });
  } else if (totalSpent > 10000) {
    // Generic loyalty program suggestion for high-spend merchants
    programs.push({
      name: `${merchantName} Loyalty Program`,
      description: 'Check if this merchant offers a loyalty program',
      potentialSavings: totalSpent * 0.05
    });
  }
  
  return programs;
};

// Helper function to generate merchant insights
const generateMerchantInsights = (merchants: MerchantData[]): MerchantInsight[] => {
  const insights: MerchantInsight[] = [];
  
  // Top spending merchants insight
  if (merchants.length > 0) {
    const topMerchants = merchants.slice(0, 3);
    const topMerchantsTotal = topMerchants.reduce((sum, m) => sum + m.totalSpent, 0);
    const totalSpent = merchants.reduce((sum, m) => sum + m.totalSpent, 0);
    const topMerchantsPercentage = (topMerchantsTotal / totalSpent) * 100;
    
    insights.push({
      title: "Top Spending Merchants",
      description: `Your top 3 merchants account for ${topMerchantsPercentage.toFixed(1)}% of your total spending.`,
      actionItems: [
        "Review your spending at these merchants for potential savings",
        "Look for loyalty programs or discounts at these merchants",
        "Consider if there are more cost-effective alternatives"
      ],
      severity: topMerchantsPercentage > 50 ? "warning" : "info"
    });
  }
  
  // Merchants with price comparison opportunities
  const merchantsWithComparisons = merchants.filter(m => m.priceComparisons && m.priceComparisons.length > 0);
  if (merchantsWithComparisons.length > 0) {
    insights.push({
      title: "Price Comparison Opportunities",
      description: `We found ${merchantsWithComparisons.length} merchants where you might save money with alternatives.`,
      actionItems: [
        "Compare features and benefits of alternative options",
        "Calculate potential annual savings from switching",
        "Consider if the convenience is worth the price difference"
      ],
      severity: "info"
    });
  }
  
  // Merchants with loyalty program opportunities
  const merchantsWithLoyalty = merchants.filter(m => m.loyaltyPrograms && m.loyaltyPrograms.length > 0);
  if (merchantsWithLoyalty.length > 0) {
    insights.push({
      title: "Loyalty Program Opportunities",
      description: `You could benefit from loyalty programs at ${merchantsWithLoyalty.length} of your frequent merchants.`,
      actionItems: [
        "Sign up for loyalty programs at your most-visited merchants",
        "Consolidate spending at fewer merchants to maximize rewards",
        "Check for credit cards that offer bonus rewards at your top merchants"
      ],
      severity: "info"
    });
  }
  
  // Seasonal spending patterns
  const merchantsWithSeasonality = merchants.filter(m => {
    if (!m.seasonalPattern) return false;
    const values = m.seasonalPattern.map(p => p.spending);
    const max = Math.max(...values);
    const min = Math.min(...values);
    return max > min * 2; // Significant seasonality
  });
  
  if (merchantsWithSeasonality.length > 0) {
    insights.push({
      title: "Seasonal Spending Patterns",
      description: `${merchantsWithSeasonality.length} merchants show significant seasonal spending patterns.`,
      actionItems: [
        "Budget for higher spending periods at these merchants",
        "Look for off-season discounts and promotions",
        "Plan major purchases during lower-price seasons"
      ],
      severity: "info"
    });
  }
  
  return insights;
};