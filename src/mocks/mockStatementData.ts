import { ProcessedStatement, BankTransaction } from '@/services/pdfService';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate a random date within the last 3 months
const getRandomDate = (startDate?: Date, endDate?: Date): string => {
  const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
  const end = endDate || new Date();
  
  const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  const date = new Date(randomTimestamp);
  
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
};

// Helper function to generate a random amount within a range
const getRandomAmount = (min: number, max: number): number => {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
};

// Generate mock transactions
export const generateMockTransactions = (count: number = 50): BankTransaction[] => {
  const merchants = [
    { name: 'NETFLIX', category: 'Entertainment', isSubscription: true, frequency: 'monthly', amount: 4500 },
    { name: 'SPOTIFY', category: 'Entertainment', isSubscription: true, frequency: 'monthly', amount: 1900 },
    { name: 'DSTV', category: 'Entertainment', isSubscription: true, frequency: 'monthly', amount: 7500 },
    { name: 'AMAZON', category: 'Shopping', isSubscription: false },
    { name: 'JUMIA', category: 'Shopping', isSubscription: false },
    { name: 'UBER', category: 'Transportation', isSubscription: false },
    { name: 'BOLT', category: 'Transportation', isSubscription: false },
    { name: 'SHOPRITE', category: 'Groceries', isSubscription: false },
    { name: 'SPAR', category: 'Groceries', isSubscription: false },
    { name: 'CHICKEN REPUBLIC', category: 'Food & Dining', isSubscription: false },
    { name: 'KFC', category: 'Food & Dining', isSubscription: false },
    { name: 'GTBANK', category: 'Transfer', isSubscription: false },
    { name: 'FIRST BANK', category: 'Transfer', isSubscription: false },
    { name: 'MTN', category: 'Utilities', isSubscription: true, frequency: 'monthly', amount: 5000 },
    { name: 'AIRTEL', category: 'Utilities', isSubscription: true, frequency: 'monthly', amount: 5000 },
    { name: 'IKEJA ELECTRIC', category: 'Utilities', isSubscription: true, frequency: 'monthly', amount: 15000 },
    { name: 'LAWMA', category: 'Utilities', isSubscription: true, frequency: 'quarterly', amount: 7500 },
    { name: 'SPECTRANET', category: 'Internet', isSubscription: true, frequency: 'monthly', amount: 18000 },
    { name: 'SMILE', category: 'Internet', isSubscription: true, frequency: 'monthly', amount: 16000 },
    { name: 'WAKANOW', category: 'Travel', isSubscription: false },
    { name: 'ARIK AIR', category: 'Travel', isSubscription: false },
    { name: 'HILTON', category: 'Travel', isSubscription: false },
    { name: 'OANDO', category: 'Fuel', isSubscription: false },
    { name: 'TOTAL', category: 'Fuel', isSubscription: false },
    { name: 'QUICKTELLER', category: 'Bills', isSubscription: false },
    { name: 'PAYSTACK', category: 'Bills', isSubscription: false },
    { name: 'FLUTTERWAVE', category: 'Bills', isSubscription: false },
    { name: 'REMITA', category: 'Bills', isSubscription: false },
    { name: 'BINANCE', category: 'Cryptocurrency', isSubscription: false },
    { name: 'LUNO', category: 'Cryptocurrency', isSubscription: false },
    { name: 'SALARY PAYMENT', category: 'Income', isSubscription: false, isIncome: true, amount: 350000 },
    { name: 'INTEREST PAYMENT', category: 'Income', isSubscription: false, isIncome: true, amount: 5000 },
    { name: 'DIVIDEND', category: 'Income', isSubscription: false, isIncome: true, amount: 25000 },
    { name: 'RENT PAYMENT', category: 'Housing', isSubscription: true, frequency: 'yearly', amount: 1200000 },
    { name: 'SCHOOL FEES', category: 'Education', isSubscription: true, frequency: 'quarterly', amount: 250000 },
    { name: 'GYM MEMBERSHIP', category: 'Health & Fitness', isSubscription: true, frequency: 'monthly', amount: 25000 },
    { name: 'HEALTH INSURANCE', category: 'Insurance', isSubscription: true, frequency: 'monthly', amount: 15000 },
    { name: 'CAR INSURANCE', category: 'Insurance', isSubscription: true, frequency: 'yearly', amount: 75000 },
    { name: 'LIFE INSURANCE', category: 'Insurance', isSubscription: true, frequency: 'yearly', amount: 120000 },
    { name: 'UNKNOWN MERCHANT', category: 'Uncategorized', isSubscription: false, isSuspicious: true }
  ];

  const transactions: BankTransaction[] = [];
  let balance = 1500000; // Starting balance
  
  // Add salary payments for the last 3 months
  const today = new Date();
  for (let i = 0; i < 3; i++) {
    const salaryDate = new Date(today.getFullYear(), today.getMonth() - i, 25);
    const salaryMerchant = merchants.find(m => m.name === 'SALARY PAYMENT')!;
    
    balance += salaryMerchant.amount;
    
    transactions.push({
      id: uuidv4(),
      date: salaryDate.toISOString().split('T')[0],
      description: 'SALARY PAYMENT - ACME CORP',
      amount: salaryMerchant.amount,
      type: 'credit',
      category: salaryMerchant.category,
      balance
    });
  }
  
  // Add recurring subscription payments
  const subscriptions = merchants.filter(m => m.isSubscription);
  
  subscriptions.forEach(subscription => {
    if (subscription.frequency === 'monthly') {
      // Add for the last 3 months
      for (let i = 0; i < 3; i++) {
        const paymentDate = new Date(today.getFullYear(), today.getMonth() - i, Math.floor(Math.random() * 28) + 1);
        
        balance -= subscription.amount;
        
        transactions.push({
          id: uuidv4(),
          date: paymentDate.toISOString().split('T')[0],
          description: `${subscription.name} SUBSCRIPTION`,
          amount: subscription.amount,
          type: 'debit',
          category: subscription.category,
          balance
        });
      }
    } else if (subscription.frequency === 'quarterly') {
      // Add one quarterly payment
      const paymentDate = new Date(today.getFullYear(), today.getMonth() - Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1);
      
      balance -= subscription.amount;
      
      transactions.push({
        id: uuidv4(),
        date: paymentDate.toISOString().split('T')[0],
        description: `${subscription.name} QUARTERLY PAYMENT`,
        amount: subscription.amount,
        type: 'debit',
        category: subscription.category,
        balance
      });
    } else if (subscription.frequency === 'yearly') {
      // Add one yearly payment if it falls within our 3-month window
      if (Math.random() > 0.7) {
        const paymentDate = new Date(today.getFullYear(), today.getMonth() - Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1);
        
        balance -= subscription.amount;
        
        transactions.push({
          id: uuidv4(),
          date: paymentDate.toISOString().split('T')[0],
          description: `${subscription.name} ANNUAL PAYMENT`,
          amount: subscription.amount,
          type: 'debit',
          category: subscription.category,
          balance
        });
      }
    }
  });
  
  // Add random transactions to reach the desired count
  const remainingCount = count - transactions.length;
  
  for (let i = 0; i < remainingCount; i++) {
    const isIncome = Math.random() < 0.2; // 20% chance of being income
    const merchant = isIncome 
      ? merchants.filter(m => m.isIncome)[Math.floor(Math.random() * merchants.filter(m => m.isIncome).length)]
      : merchants.filter(m => !m.isSubscription && !m.isIncome)[Math.floor(Math.random() * merchants.filter(m => !m.isSubscription && !m.isIncome).length)];
    
    const amount = merchant.amount || getRandomAmount(1000, 50000);
    
    if (isIncome) {
      balance += amount;
    } else {
      balance -= amount;
    }
    
    // Add some suspicious transactions
    const isSuspicious = merchant.isSuspicious || (Math.random() < 0.05); // 5% chance of being suspicious
    
    let description = merchant.name;
    if (isSuspicious) {
      description += ' ' + ['INTERNATIONAL', 'UNUSUAL AMOUNT', 'UNRECOGNIZED MERCHANT'][Math.floor(Math.random() * 3)];
    }
    
    transactions.push({
      id: uuidv4(),
      date: getRandomDate(),
      description,
      amount,
      type: isIncome ? 'credit' : 'debit',
      category: merchant.category,
      balance
    });
  }
  
  // Sort transactions by date (newest first)
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return transactions;
};

// Generate mock statement data
export const generateMockStatementData = (): ProcessedStatement => {
  const transactions = generateMockTransactions(100);
  
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = transactions[0]?.balance || 0;
  
  return {
    transactions,
    totalIncome,
    totalExpense,
    balance,
    startDate: transactions[transactions.length - 1]?.date,
    endDate: transactions[0]?.date,
    accountName: 'John Doe',
    accountNumber: '0123456789'
  };
};

// Export a ready-to-use mock statement
export const mockStatementData = generateMockStatementData();