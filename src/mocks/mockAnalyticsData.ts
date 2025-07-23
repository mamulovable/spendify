import { v4 as uuidv4 } from 'uuid';
import { SecurityAlert, SecurityInsight, SecurityMetric, RiskLevelData, TimelineEvent } from '@/types/securityAlert';
import { RecurringExpense } from '@/types/recurringExpense';
import { CashFlowData, CashFlowGap } from '@/types/cashFlow';
import { MerchantData } from '@/types/merchantIntelligence';
import { FinancialHealthScore } from '@/types/financialHealth';
import { TaxCategory, TaxDeduction } from '@/types/taxCategorization';

// Mock Security Data
export const mockSecurityData = {
  alerts: [
    {
      id: uuidv4(),
      userId: 'current-user',
      transactionId: uuidv4(),
      date: '2025-07-15',
      merchant: 'BINANCE INTERNATIONAL',
      amount: 50000,
      riskScore: 85,
      riskLevel: 'high' as const,
      category: 'Cryptocurrency',
      description: 'International cryptocurrency transaction',
      isResolved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      transactionId: uuidv4(),
      date: '2025-07-10',
      merchant: 'UNKNOWN MERCHANT UNUSUAL AMOUNT',
      amount: 150000,
      riskScore: 90,
      riskLevel: 'critical' as const,
      category: 'Uncategorized',
      description: 'Unrecognized merchant with unusual amount',
      isResolved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      transactionId: uuidv4(),
      date: '2025-06-28',
      merchant: 'OANDO DUPLICATE CHARGE',
      amount: 15000,
      riskScore: 75,
      riskLevel: 'high' as const,
      category: 'Fuel',
      description: 'Duplicate transaction',
      isResolved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      transactionId: uuidv4(),
      date: '2025-06-20',
      merchant: 'WAKANOW INTERNATIONAL',
      amount: 250000,
      riskScore: 65,
      riskLevel: 'medium' as const,
      category: 'Travel',
      description: 'International transaction',
      isResolved: false,
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      transactionId: uuidv4(),
      date: '2025-06-15',
      merchant: 'LUNO',
      amount: 25000,
      riskScore: 60,
      riskLevel: 'medium' as const,
      category: 'Cryptocurrency',
      description: 'Cryptocurrency transaction',
      isResolved: false,
      createdAt: new Date().toISOString()
    }
  ] as SecurityAlert[],
  
  metrics: [
    {
      label: 'Total Alerts',
      value: 5,
      description: 'Security alerts detected'
    },
    {
      label: 'Critical Alerts',
      value: 1,
      description: 'High priority security concerns'
    },
    {
      label: 'High Risk Alerts',
      value: 2,
      description: 'Elevated risk transactions'
    },
    {
      label: 'Risk Amount',
      value: '₦490,000',
      description: 'Total amount in flagged transactions'
    }
  ] as SecurityMetric[],
  
  riskData: [
    { name: 'Critical', value: 1, color: '#ef4444' },
    { name: 'High', value: 2, color: '#f97316' },
    { name: 'Medium', value: 2, color: '#eab308' },
    { name: 'Low', value: 0, color: '#22c55e' }
  ] as RiskLevelData[],
  
  timelineData: [
    {
      id: uuidv4(),
      date: '2025-07-15',
      description: 'International cryptocurrency transaction',
      riskLevel: 'high' as const,
      amount: 50000,
      merchant: 'BINANCE INTERNATIONAL'
    },
    {
      id: uuidv4(),
      date: '2025-07-10',
      description: 'Unrecognized merchant with unusual amount',
      riskLevel: 'critical' as const,
      amount: 150000,
      merchant: 'UNKNOWN MERCHANT UNUSUAL AMOUNT'
    },
    {
      id: uuidv4(),
      date: '2025-06-28',
      description: 'Duplicate transaction',
      riskLevel: 'high' as const,
      amount: 15000,
      merchant: 'OANDO DUPLICATE CHARGE'
    },
    {
      id: uuidv4(),
      date: '2025-06-20',
      description: 'International transaction',
      riskLevel: 'medium' as const,
      amount: 250000,
      merchant: 'WAKANOW INTERNATIONAL'
    },
    {
      id: uuidv4(),
      date: '2025-06-15',
      description: 'Cryptocurrency transaction',
      riskLevel: 'medium' as const,
      amount: 25000,
      merchant: 'LUNO'
    }
  ] as TimelineEvent[],
  
  insights: [
    {
      title: 'Critical Security Alerts Detected',
      description: '1 critical security alert was detected in your transactions. This requires immediate attention.',
      actionItems: [
        'Review and verify this transaction immediately',
        'Contact your bank if you don\'t recognize this transaction',
        'Consider freezing your card if suspicious activity is confirmed'
      ],
      severity: 'critical' as const
    },
    {
      title: 'High Risk Transactions Identified',
      description: '2 high risk transactions were identified that may require your attention.',
      actionItems: [
        'Verify these transactions against your records',
        'Set up transaction alerts for similar future transactions',
        'Consider updating your security preferences'
      ],
      severity: 'warning' as const
    },
    {
      title: 'Security Recommendations',
      description: 'Based on your transaction patterns, here are some security recommendations to keep your accounts safe.',
      actionItems: [
        'Enable two-factor authentication on all financial accounts',
        'Regularly monitor your accounts for unauthorized transactions',
        'Use unique passwords for different financial services',
        'Consider setting up spending alerts for unusual activity'
      ],
      severity: 'info' as const
    }
  ] as SecurityInsight[]
};

// Mock Recurring Expenses Data
export const mockRecurringExpensesData = {
  recurringExpenses: [
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'Netflix Subscription',
      merchantId: 'netflix-001',
      merchantName: 'NETFLIX',
      amount: 4500,
      frequency: 'monthly' as const,
      lastCharged: '2025-07-15',
      nextExpectedCharge: '2025-08-15',
      category: 'Entertainment',
      isActive: true,
      isForgotten: false,
      transactions: [uuidv4(), uuidv4(), uuidv4()]
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'Spotify Premium',
      merchantId: 'spotify-001',
      merchantName: 'SPOTIFY',
      amount: 1900,
      frequency: 'monthly' as const,
      lastCharged: '2025-07-10',
      nextExpectedCharge: '2025-08-10',
      category: 'Entertainment',
      isActive: true,
      isForgotten: false,
      transactions: [uuidv4(), uuidv4(), uuidv4()]
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'DSTV Subscription',
      merchantId: 'dstv-001',
      merchantName: 'DSTV',
      amount: 7500,
      frequency: 'monthly' as const,
      lastCharged: '2025-07-05',
      nextExpectedCharge: '2025-08-05',
      category: 'Entertainment',
      isActive: true,
      isForgotten: false,
      transactions: [uuidv4(), uuidv4(), uuidv4()]
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'MTN Data Plan',
      merchantId: 'mtn-001',
      merchantName: 'MTN',
      amount: 5000,
      frequency: 'monthly' as const,
      lastCharged: '2025-07-03',
      nextExpectedCharge: '2025-08-03',
      category: 'Utilities',
      isActive: true,
      isForgotten: false,
      transactions: [uuidv4(), uuidv4(), uuidv4()]
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'Ikeja Electric',
      merchantId: 'ikeja-001',
      merchantName: 'IKEJA ELECTRIC',
      amount: 15000,
      frequency: 'monthly' as const,
      lastCharged: '2025-07-12',
      nextExpectedCharge: '2025-08-12',
      category: 'Utilities',
      isActive: true,
      isForgotten: false,
      transactions: [uuidv4(), uuidv4(), uuidv4()]
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'Spectranet Internet',
      merchantId: 'spectranet-001',
      merchantName: 'SPECTRANET',
      amount: 18000,
      frequency: 'monthly' as const,
      lastCharged: '2025-07-08',
      nextExpectedCharge: '2025-08-08',
      category: 'Internet',
      isActive: true,
      isForgotten: false,
      transactions: [uuidv4(), uuidv4(), uuidv4()]
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'Gym Membership',
      merchantId: 'gym-001',
      merchantName: 'GYM MEMBERSHIP',
      amount: 25000,
      frequency: 'monthly' as const,
      lastCharged: '2025-06-20',
      nextExpectedCharge: '2025-07-20',
      category: 'Health & Fitness',
      isActive: true,
      isForgotten: true,
      transactions: [uuidv4(), uuidv4()]
    },
    {
      id: uuidv4(),
      userId: 'current-user',
      name: 'Health Insurance',
      merchantId: 'health-001',
      merchantName: 'HEALTH INSURANCE',
      amount: 15000,
      frequency: 'monthly' as const,
      lastCharged: '2025-07-01',
      nextExpectedCharge: '2025-08-01',
      category: 'Insurance',
      isActive: true,
      isForgotten: false,
      transactions: [uuidv4(), uuidv4(), uuidv4()]
    }
  ] as RecurringExpense[],
  
  metrics: [
    {
      label: 'Monthly Subscriptions',
      value: '₦91,900',
      description: 'Total recurring monthly expenses'
    },
    {
      label: 'Subscription Count',
      value: 8,
      description: 'Number of active subscriptions'
    },
    {
      label: 'Forgotten Subscriptions',
      value: 1,
      description: 'Potentially unused subscriptions'
    },
    {
      label: 'Annual Cost',
      value: '₦1,102,800',
      description: 'Yearly subscription expenses'
    }
  ],
  
  timelineData: [
    { date: '2025-07-01', amount: 15000, name: 'Health Insurance' },
    { date: '2025-07-03', amount: 5000, name: 'MTN Data Plan' },
    { date: '2025-07-05', amount: 7500, name: 'DSTV Subscription' },
    { date: '2025-07-08', amount: 18000, name: 'Spectranet Internet' },
    { date: '2025-07-10', amount: 1900, name: 'Spotify Premium' },
    { date: '2025-07-12', amount: 15000, name: 'Ikeja Electric' },
    { date: '2025-07-15', amount: 4500, name: 'Netflix Subscription' },
    { date: '2025-07-20', amount: 25000, name: 'Gym Membership' },
    { date: '2025-08-01', amount: 15000, name: 'Health Insurance' },
    { date: '2025-08-03', amount: 5000, name: 'MTN Data Plan' },
    { date: '2025-08-05', amount: 7500, name: 'DSTV Subscription' },
    { date: '2025-08-08', amount: 18000, name: 'Spectranet Internet' },
    { date: '2025-08-10', amount: 1900, name: 'Spotify Premium' },
    { date: '2025-08-12', amount: 15000, name: 'Ikeja Electric' },
    { date: '2025-08-15', amount: 4500, name: 'Netflix Subscription' },
    { date: '2025-08-20', amount: 25000, name: 'Gym Membership' }
  ],
  
  alternatives: [
    {
      subscriptionId: uuidv4(),
      currentService: 'Netflix Premium',
      currentCost: 4500,
      alternatives: [
        {
          name: 'Netflix Basic',
          price: 2900,
          savingsAmount: 1600,
          savingsPercentage: 36,
          link: 'https://netflix.com/plans'
        },
        {
          name: 'Showmax',
          price: 3500,
          savingsAmount: 1000,
          savingsPercentage: 22,
          link: 'https://showmax.com'
        }
      ]
    },
    {
      subscriptionId: uuidv4(),
      currentService: 'Spectranet Internet',
      currentCost: 18000,
      alternatives: [
        {
          name: 'Smile 4G',
          price: 15000,
          savingsAmount: 3000,
          savingsPercentage: 17,
          link: 'https://smile.com.ng'
        },
        {
          name: 'Swift 4G',
          price: 16000,
          savingsAmount: 2000,
          savingsPercentage: 11,
          link: 'https://swift.ng'
        }
      ]
    },
    {
      subscriptionId: uuidv4(),
      currentService: 'DSTV Premium',
      currentCost: 7500,
      alternatives: [
        {
          name: 'DSTV Compact',
          price: 5000,
          savingsAmount: 2500,
          savingsPercentage: 33,
          link: 'https://dstv.com/plans'
        },
        {
          name: 'StarTimes Classic',
          price: 3900,
          savingsAmount: 3600,
          savingsPercentage: 48,
          link: 'https://startimestv.com'
        }
      ]
    }
  ],
  
  insights: [
    {
      title: 'Forgotten Subscription Detected',
      description: 'You may have a forgotten gym membership subscription that hasn\'t been used recently.',
      actionItems: [
        'Review your gym membership usage',
        'Consider cancelling if you\'re not using it',
        'Look for pay-as-you-go alternatives'
      ],
      severity: 'warning' as const
    },
    {
      title: 'Potential Savings on Entertainment',
      description: 'You could save up to ₦7,100 per month by optimizing your entertainment subscriptions.',
      actionItems: [
        'Consider downgrading Netflix to a basic plan',
        'Look into StarTimes as a cheaper alternative to DSTV',
        'Consider sharing subscription costs with family members'
      ],
      severity: 'info' as const
    },
    {
      title: 'Subscription Management Tips',
      description: 'Here are some tips to better manage your recurring expenses.',
      actionItems: [
        'Set calendar reminders for annual subscription renewals',
        'Review all subscriptions quarterly',
        'Consider using a subscription management app',
        'Look for annual payment options that offer discounts'
      ],
      severity: 'info' as const
    }
  ]
};

// Mock Cash Flow Data
export const mockCashFlowData = {
  cashFlowData: [
    {
      month: '2025-05',
      income: 350000,
      expenses: 280000,
      netCashFlow: 70000,
      isPrediction: false
    },
    {
      month: '2025-06',
      income: 375000,
      expenses: 295000,
      netCashFlow: 80000,
      isPrediction: false
    },
    {
      month: '2025-07',
      income: 350000,
      expenses: 310000,
      netCashFlow: 40000,
      isPrediction: false
    },
    {
      month: '2025-08',
      income: 350000,
      expenses: 320000,
      netCashFlow: 30000,
      predictedIncome: 350000,
      predictedExpenses: 320000,
      predictedNetCashFlow: 30000,
      isPrediction: true
    },
    {
      month: '2025-09',
      income: 350000,
      expenses: 335000,
      netCashFlow: 15000,
      predictedIncome: 350000,
      predictedExpenses: 335000,
      predictedNetCashFlow: 15000,
      isPrediction: true
    },
    {
      month: '2025-10',
      income: 350000,
      expenses: 345000,
      netCashFlow: 5000,
      predictedIncome: 350000,
      predictedExpenses: 345000,
      predictedNetCashFlow: 5000,
      isPrediction: true
    }
  ] as CashFlowData[],
  
  cashFlowGaps: [
    {
      startDate: '2025-09-25',
      endDate: '2025-10-05',
      amount: 25000,
      severity: 'medium' as const,
      recommendation: 'Consider setting aside ₦25,000 by September 20th to cover this gap'
    },
    {
      startDate: '2025-10-20',
      endDate: '2025-10-30',
      amount: 40000,
      severity: 'high' as const,
      recommendation: 'Reduce discretionary spending in early October to prepare for this gap'
    }
  ] as CashFlowGap[],
  
  metrics: [
    {
      label: 'Monthly Income',
      value: '₦350,000',
      change: 0,
      description: 'Average monthly income'
    },
    {
      label: 'Monthly Expenses',
      value: '₦310,000',
      change: 5.1,
      description: 'Current monthly expenses'
    },
    {
      label: 'Savings Rate',
      value: '11.4%',
      change: -5.7,
      description: 'Portion of income saved'
    },
    {
      label: 'Cash Flow Trend',
      value: 'Decreasing',
      description: 'Direction of net cash flow'
    }
  ],
  
  insights: [
    {
      title: 'Cash Flow Gaps Detected',
      description: 'We\'ve identified potential cash flow gaps in the coming months that may require attention.',
      actionItems: [
        'Set aside ₦25,000 by September 20th',
        'Reduce discretionary spending in early October',
        'Consider a small emergency fund for these periods'
      ],
      severity: 'warning' as const
    },
    {
      title: 'Declining Savings Rate',
      description: 'Your savings rate has decreased from 17.1% to 11.4% over the last three months.',
      actionItems: [
        'Review recent increases in spending categories',
        'Set a budget for discretionary spending',
        'Consider automating savings transfers'
      ],
      severity: 'warning' as const
    },
    {
      title: 'Budget Recommendations',
      description: 'Based on your cash flow patterns, here are some budget recommendations.',
      actionItems: [
        'Aim to keep monthly expenses under ₦300,000',
        'Prioritize building an emergency fund of ₦1,050,000 (3 months expenses)',
        'Consider a 50/30/20 budget: 50% needs, 30% wants, 20% savings'
      ],
      severity: 'info' as const
    }
  ]
};

// Mock Merchant Intelligence Data
export const mockMerchantIntelligenceData = {
  merchants: [
    {
      id: uuidv4(),
      name: 'SHOPRITE',
      totalSpent: 85000,
      transactionCount: 5,
      averageTransaction: 17000,
      frequencyPerMonth: 1.67,
      lastVisited: '2025-07-15',
      category: 'Groceries',
      seasonalPattern: [
        { quarter: 1, spending: 75000 },
        { quarter: 2, spending: 85000 },
        { quarter: 3, spending: 90000 },
        { quarter: 4, spending: 110000 }
      ],
      priceComparisons: [
        {
          competitor: 'SPAR',
          potentialSavings: 8500,
          savingsPercentage: 10
        },
        {
          competitor: 'MARKET SQUARE',
          potentialSavings: 12750,
          savingsPercentage: 15
        }
      ],
      loyaltyPrograms: [
        {
          name: 'Shoprite Xtra',
          description: 'Earn points on every purchase and get exclusive discounts',
          potentialSavings: 4250,
          link: 'https://shoprite.com/loyalty'
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'CHICKEN REPUBLIC',
      totalSpent: 45000,
      transactionCount: 9,
      averageTransaction: 5000,
      frequencyPerMonth: 3,
      lastVisited: '2025-07-18',
      category: 'Food & Dining',
      seasonalPattern: [
        { quarter: 1, spending: 40000 },
        { quarter: 2, spending: 45000 },
        { quarter: 3, spending: 42000 },
        { quarter: 4, spending: 48000 }
      ],
      priceComparisons: [
        {
          competitor: 'KFC',
          potentialSavings: 0,
          savingsPercentage: 0
        },
        {
          competitor: 'LOCAL RESTAURANT',
          potentialSavings: 9000,
          savingsPercentage: 20
        }
      ],
      loyaltyPrograms: [
        {
          name: 'Chicken Republic Rewards',
          description: 'Buy 10 meals and get 1 free',
          potentialSavings: 5000,
          link: 'https://chickenrepublic.com/rewards'
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'UBER',
      totalSpent: 35000,
      transactionCount: 7,
      averageTransaction: 5000,
      frequencyPerMonth: 2.33,
      lastVisited: '2025-07-17',
      category: 'Transportation',
      seasonalPattern: [
        { quarter: 1, spending: 30000 },
        { quarter: 2, spending: 35000 },
        { quarter: 3, spending: 32000 },
        { quarter: 4, spending: 38000 }
      ],
      priceComparisons: [
        {
          competitor: 'BOLT',
          potentialSavings: 7000,
          savingsPercentage: 20
        },
        {
          competitor: 'PUBLIC TRANSPORT',
          potentialSavings: 24500,
          savingsPercentage: 70
        }
      ],
      loyaltyPrograms: [
        {
          name: 'Uber Rewards',
          description: 'Earn points on rides and food delivery',
          potentialSavings: 3500,
          link: 'https://uber.com/rewards'
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'OANDO',
      totalSpent: 30000,
      transactionCount: 3,
      averageTransaction: 10000,
      frequencyPerMonth: 1,
      lastVisited: '2025-07-10',
      category: 'Fuel',
      seasonalPattern: [
        { quarter: 1, spending: 28000 },
        { quarter: 2, spending: 30000 },
        { quarter: 3, spending: 32000 },
        { quarter: 4, spending: 30000 }
      ],
      priceComparisons: [
        {
          competitor: 'TOTAL',
          potentialSavings: 0,
          savingsPercentage: 0
        },
        {
          competitor: 'INDEPENDENT STATION',
          potentialSavings: 1500,
          savingsPercentage: 5
        }
      ],
      loyaltyPrograms: [
        {
          name: 'Oando ClubO',
          description: 'Earn points on fuel purchases',
          potentialSavings: 1500,
          link: 'https://oando.com/clubo'
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'JUMIA',
      totalSpent: 25000,
      transactionCount: 2,
      averageTransaction: 12500,
      frequencyPerMonth: 0.67,
      lastVisited: '2025-07-05',
      category: 'Shopping',
      seasonalPattern: [
        { quarter: 1, spending: 20000 },
        { quarter: 2, spending: 25000 },
        { quarter: 3, spending: 22000 },
        { quarter: 4, spending: 45000 }
      ],
      priceComparisons: [
        {
          competitor: 'AMAZON',
          potentialSavings: 2500,
          savingsPercentage: 10
        },
        {
          competitor: 'LOCAL STORES',
          potentialSavings: 5000,
          savingsPercentage: 20
        }
      ],
      loyaltyPrograms: [
        {
          name: 'Jumia Prime',
          description: 'Free delivery and exclusive deals',
          potentialSavings: 3750,
          link: 'https://jumia.com.ng/prime'
        }
      ]
    }
  ] as MerchantData[],
  
  metrics: [
    {
      label: 'Top Merchant',
      value: 'SHOPRITE',
      description: 'Highest spending merchant'
    },
    {
      label: 'Monthly Merchant Spend',
      value: '₦220,000',
      description: 'Total merchant spending'
    },
    {
      label: 'Most Frequent',
      value: 'CHICKEN REPUBLIC',
      description: 'Most frequently visited'
    },
    {
      label: 'Potential Savings',
      value: '₦28,750',
      description: 'Possible monthly savings'
    }
  ],
  
  insights: [
    {
      title: 'Price Comparison Opportunities',
      description: 'You could save up to ₦28,750 per month by shopping at alternative merchants.',
      actionItems: [
        'Consider BOLT instead of UBER for 20% savings',
        'Try SPAR instead of SHOPRITE for 10% savings',
        'Look into local restaurants as alternatives to chain restaurants'
      ],
      severity: 'info' as const
    },
    {
      title: 'Loyalty Program Benefits',
      description: 'Enrolling in loyalty programs could save you approximately ₦14,750 per month.',
      actionItems: [
        'Sign up for Shoprite Xtra rewards program',
        'Join Chicken Republic Rewards for a free meal after 10 purchases',
        'Enroll in Uber Rewards for discounts on future rides'
      ],
      severity: 'info' as const
    },
    {
      title: 'Seasonal Spending Patterns',
      description: 'Your spending tends to increase in Q4, particularly on shopping and groceries.',
      actionItems: [
        'Budget extra for Q4 grocery expenses',
        'Plan ahead for holiday shopping to avoid last-minute premium prices',
        'Look for bulk deals on regularly purchased items'
      ],
      severity: 'info' as const
    }
  ]
};

// Mock Financial Health Data
export const mockFinancialHealthData = {
  financialHealth: {
    userId: 'current-user',
    overallScore: 68,
    creditUtilization: 35,
    savingsRate: 11.4,
    debtToIncome: 0.32,
    emergencyFundMonths: 1.5,
    goalProgress: [
      {
        goalId: uuidv4(),
        goalName: 'Emergency Fund',
        targetAmount: 1050000,
        currentAmount: 465000,
        progressPercentage: 44.3
      },
      {
        goalId: uuidv4(),
        goalName: 'New Car',
        targetAmount: 5000000,
        currentAmount: 1250000,
        progressPercentage: 25
      },
      {
        goalId: uuidv4(),
        goalName: 'Vacation',
        targetAmount: 800000,
        currentAmount: 600000,
        progressPercentage: 75
      }
    ],
    recommendations: [
      {
        category: 'savings' as const,
        description: 'Increase emergency fund to 3 months of expenses',
        impact: 12,
        difficulty: 'medium' as const
      },
      {
        category: 'debt' as const,
        description: 'Reduce credit card utilization to below 30%',
        impact: 8,
        difficulty: 'easy' as const
      },
      {
        category: 'spending' as const,
        description: 'Reduce dining out expenses by 20%',
        impact: 5,
        difficulty: 'medium' as const
      },
      {
        category: 'income' as const,
        description: 'Explore side income opportunities',
        impact: 10,
        difficulty: 'hard' as const
      }
    ],
    historicalScores: [
      { date: '2025-02-01', score: 60 },
      { date: '2025-03-01', score: 62 },
      { date: '2025-04-01', score: 65 },
      { date: '2025-05-01', score: 67 },
      { date: '2025-06-01', score: 68 },
      { date: '2025-07-01', score: 68 }
    ]
  } as FinancialHealthScore,
  
  metrics: [
    {
      label: 'Health Score',
      value: '68/100',
      description: 'Overall financial health'
    },
    {
      label: 'Savings Rate',
      value: '11.4%',
      change: -5.7,
      description: 'Portion of income saved'
    },
    {
      label: 'Debt-to-Income',
      value: '32%',
      description: 'Debt payments vs income'
    },
    {
      label: 'Emergency Fund',
      value: '1.5 months',
      description: 'Months of expenses covered'
    }
  ],
  
  insights: [
    {
      title: 'Emergency Fund Needs Attention',
      description: 'Your emergency fund covers 1.5 months of expenses, below the recommended 3-6 months.',
      actionItems: [
        'Aim to save an additional ₦585,000 to reach 3 months coverage',
        'Consider automating transfers to your emergency fund',
        'Prioritize this goal before increasing other investments'
      ],
      severity: 'warning' as const
    },
    {
      title: 'Credit Utilization Improvement',
      description: 'Reducing your credit utilization from 35% to below 30% could improve your credit score.',
      actionItems: [
        'Pay down ₦50,000 in credit card debt',
        'Consider requesting a credit limit increase',
        'Avoid making large purchases on credit before applying for loans'
      ],
      severity: 'info' as const
    },
    {
      title: 'Positive Progress on Goals',
      description: 'You\'re making good progress on your vacation savings goal (75% complete).',
      actionItems: [
        'Continue your current savings rate for this goal',
        'Consider setting a specific date for your vacation',
        'Research early booking discounts to maximize your savings'
      ],
      severity: 'info' as const
    }
  ]
};

// Mock Tax Categorization Data
export const mockTaxCategorizationData = {
  taxCategories: [
    {
      id: uuidv4(),
      name: 'Business Travel',
      description: 'Travel expenses related to business activities',
      isDeductible: true,
      totalAmount: 250000,
      transactionCount: 3
    },
    {
      id: uuidv4(),
      name: 'Office Supplies',
      description: 'Supplies and equipment for business use',
      isDeductible: true,
      totalAmount: 45000,
      transactionCount: 5
    },
    {
      id: uuidv4(),
      name: 'Professional Services',
      description: 'Legal, accounting, and consulting services',
      isDeductible: true,
      totalAmount: 120000,
      transactionCount: 2
    },
    {
      id: uuidv4(),
      name: 'Business Meals',
      description: 'Meals with clients or for business purposes',
      isDeductible: true,
      totalAmount: 35000,
      transactionCount: 7
    },
    {
      id: uuidv4(),
      name: 'Internet & Phone',
      description: 'Communication services for business',
      isDeductible: true,
      totalAmount: 23000,
      transactionCount: 3
    },
    {
      id: uuidv4(),
      name: 'Personal Expenses',
      description: 'Non-deductible personal expenses',
      isDeductible: false,
      totalAmount: 450000,
      transactionCount: 45
    }
  ] as TaxCategory[],
  
  deductions: [
    {
      id: uuidv4(),
      transactionId: uuidv4(),
      date: '2025-07-15',
      merchant: 'WAKANOW',
      amount: 150000,
      category: 'Business Travel',
      confidence: 95,
      hasReceipt: true,
      receiptId: uuidv4()
    },
    {
      id: uuidv4(),
      transactionId: uuidv4(),
      date: '2025-07-10',
      merchant: 'ARIK AIR',
      amount: 85000,
      category: 'Business Travel',
      confidence: 90,
      hasReceipt: true,
      receiptId: uuidv4()
    },
    {
      id: uuidv4(),
      transactionId: uuidv4(),
      date: '2025-07-05',
      merchant: 'JUMIA',
      amount: 25000,
      category: 'Office Supplies',
      confidence: 85,
      hasReceipt: false
    },
    {
      id: uuidv4(),
      transactionId: uuidv4(),
      date: '2025-06-28',
      merchant: 'ACCOUNTANT SERVICES',
      amount: 75000,
      category: 'Professional Services',
      confidence: 98,
      hasReceipt: true,
      receiptId: uuidv4()
    },
    {
      id: uuidv4(),
      transactionId: uuidv4(),
      date: '2025-06-20',
      merchant: 'CHICKEN REPUBLIC',
      amount: 15000,
      category: 'Business Meals',
      confidence: 75,
      hasReceipt: false,
      notes: 'Client meeting with ABC Corp'
    }
  ] as TaxDeduction[],
  
  metrics: [
    {
      label: 'Potential Deductions',
      value: '₦473,000',
      description: 'Total deductible expenses'
    },
    {
      label: 'Business Expenses',
      value: '51.2%',
      description: 'Business vs personal'
    },
    {
      label: 'Missing Receipts',
      value: 8,
      description: 'Transactions without receipts'
    },
    {
      label: 'Tax Savings',
      value: '₦141,900',
      description: 'Estimated tax savings'
    }
  ],
  
  insights: [
    {
      title: 'Missing Receipt Documentation',
      description: '8 potentially deductible transactions are missing receipt documentation.',
      actionItems: [
        'Upload receipts for the flagged transactions',
        'Set up a receipt capture system for future expenses',
        'Consider using the app\'s receipt scanning feature'
      ],
      severity: 'warning' as const
    },
    {
      title: 'Business vs Personal Separation',
      description: 'Clearly separating business and personal expenses can improve tax compliance.',
      actionItems: [
        'Consider using separate payment methods for business expenses',
        'Add notes to transactions at the time of purchase',
        'Review categorizations monthly instead of at tax time'
      ],
      severity: 'info' as const
    },
    {
      title: 'Tax Preparation Recommendations',
      description: 'Prepare for tax season with these recommendations.',
      actionItems: [
        'Export a tax report at the end of each quarter',
        'Schedule a mid-year review with your accountant',
        'Set reminders for tax payment deadlines'
      ],
      severity: 'info' as const
    }
  ]
};