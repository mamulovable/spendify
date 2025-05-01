import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatCard from '@/components/StatCard';
import { PieChart as PieChartIcon, ArrowDown, ArrowUp, DollarSign, ShoppingBag, Home, Car, Coffee, Tag, SparkleIcon, Save } from 'lucide-react';
import { useStatement } from '@/contexts/StatementContext';
import ApiKeyInput from '@/components/ApiKeyInput';
import { generateInsights, hasGeminiApiKey } from '@/services/insightService';
import { useToast } from '@/components/ui/use-toast';
import { BankTransaction } from '@/services/pdfService';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AiChat } from '@/components/AiChat';
import { SaveAnalysisDialog } from '@/components/SaveAnalysisDialog';
import { SavedAnalyses } from '@/components/SavedAnalyses';
import Navbar from '@/components/Navbar';
import { MerchantAnalytics } from '@/components/MerchantAnalytics';

const processCategoriesFromTransactions = (transactions: BankTransaction[]) => {
  const categoryMap = new Map();
  // Calculate total amount only for expense-like transactions if applicable,
  // or adjust logic based on how 'Transfer from'/'Transfer to' should affect totals.
  // For simplicity, let's assume totalAmount includes all for percentage calculation for now.
  const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0); // Use absolute amount for total if transfers affect it differently

  transactions.forEach(t => {
    let finalCategory = t.category || 'Miscellaneous';
    const descriptionLower = t.description.toLowerCase();

    // Refined logic: Check description keywords robustly
    // Prioritize if category is already specific
    if (finalCategory === 'Transfer from' || finalCategory === 'Transfer to') {
      // Keep the specific category
    } 
    // Check description if category is generic 'Transfers' or if description indicates a transfer
    else if (finalCategory.toLowerCase().includes('transfer') || descriptionLower.includes('transfer from') || descriptionLower.includes('transfer to')) {
      if (descriptionLower.includes('transfer from')) {
        finalCategory = 'Transfer from';
      } else if (descriptionLower.includes('transfer to')) {
        finalCategory = 'Transfer to';
      } else {
        // If it's a transfer but direction unclear, or original category was generic 'Transfers'
        // Keep it as 'Transfers' only if the original category suggested it, otherwise 'Miscellaneous'
        if (!t.category?.toLowerCase().includes('transfer')) {
             finalCategory = 'Miscellaneous';
        } else {
             // Keep original 'Transfers' or similar if direction unknown
             finalCategory = t.category || 'Miscellaneous';
        }
      }
    }
    // else: keep the original finalCategory if it's not transfer-related

    const currentAmount = categoryMap.get(finalCategory)?.amount || 0;
    // Ensure amounts are handled correctly (e.g., maybe absolute values for transfers?)
    categoryMap.set(finalCategory, {
      amount: currentAmount + t.amount, // Or Math.abs(t.amount) depending on desired calculation
    });
  });

  // --- Remove categoryIcons definition from here ---
  // const categoryIcons: Record<string, any> = { ... }; // REMOVED

  // Define icons needed just for this function's return value if necessary,
  // OR better yet, define categoryIcons once outside or inside the main component
  // and pass it where needed. For now, let's assume icons/colors are added later
  // based on the name. We'll fetch them inside the Analyze component.

  return Array.from(categoryMap.entries()).map(([name, data]: [string, any]) => {
    const amount = data.amount;
    // Percentage calculation might need adjustment based on totalAmount definition
    // const percentage = Math.round((amount / totalAmount) * 100);

    return {
      name,
      amount,
      // percentage, // Calculate percentage inside Analyze component if needed
      // icon, color, pieColor will be added later in Analyze component
    };
  }).sort((a, b) => b.amount - a.amount);
};

// New function to process merchants from transactions
const processMerchantsFromTransactions = (transactions: BankTransaction[], categoryIcons: Record<string, any>) => {
  const merchantMap = new Map<string, { amount: number; count: number; categories: Set<string> }>();

  transactions.forEach(t => {
    // Ensure amount is a number before processing
    const amount = typeof t.amount === 'number' ? t.amount : 0;
    if (amount === 0) return; // Skip transactions with zero amount if desired

    // Basic merchant extraction logic (you might need a more sophisticated approach)
    let merchantName = t.description;
    const separators = [' - ', ' / ', ' AT ', ' TO ', ' FROM ']; // Added more separators
    for (const sep of separators) {
        if (t.description.toUpperCase().includes(sep)) {
            // Split and take the part that's likely the merchant
            // This logic might need refinement based on patterns
            const parts = t.description.split(new RegExp(sep, 'i'));
            // Heuristic: often the merchant is the first part, or the part after 'TO'/'FROM'
            if (sep === ' TO ' || sep === ' FROM ') {
                merchantName = parts[1]?.trim() || parts[0]?.trim();
            } else {
                merchantName = parts[0]?.trim();
            }
            // Avoid using generic terms like 'Transfer' as merchant name
            if (merchantName.toLowerCase().includes('transfer')) {
                merchantName = t.description; // Revert if extraction seems wrong
            } else {
                 break; // Found a potential merchant name
            }
        }
    }

    // Fallback to a cleaned-up description if no specific merchant pattern is found
    // Remove potential transaction codes or dates at the end
    merchantName = merchantName.replace(/[\d\/\s-]{6,}$/, '').trim(); // Remove trailing date-like patterns
    merchantName = merchantName || t.description; // Use original if empty after cleaning

    // Normalize merchant name
    const normalizedMerchant = merchantName.toLowerCase().replace(/\s+/g, ' ').trim();

    // Filter out generic or unclear names
    const ignoreList = ['transfer', 'payment', 'deposit', 'withdrawal', 'reversal', 'charge', 'fee'];
    if (!normalizedMerchant || ignoreList.some(term => normalizedMerchant.includes(term))) {
        return; // Skip if the name seems too generic or is empty
    }

    const current = merchantMap.get(normalizedMerchant) || { amount: 0, count: 0, categories: new Set<string>() };
    // Aggregate absolute amounts for spending analysis
    current.amount += Math.abs(amount);
    current.count += 1;
    if (t.category && t.category !== 'Miscellaneous') { // Prioritize specific categories
        current.categories.add(t.category);
    }
    merchantMap.set(normalizedMerchant, current);
  });

  return Array.from(merchantMap.entries()).map(([name, data]) => {
    // Determine primary category more robustly
    const primaryCategory = data.categories.size > 0 ? [...data.categories][0] : 'Miscellaneous';
    // Capitalize merchant name for display
    const displayName = name.split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');

    // Get icon and color from categoryIcons based on primaryCategory
    const { icon, color, pieColor } = categoryIcons[primaryCategory] || categoryIcons['Miscellaneous'];

    return {
      name: displayName,
      category: primaryCategory,
      totalSpent: data.amount,
      frequency: data.count,
      averageSpent: data.amount / data.count, // Calculate average
      icon: icon, // Add icon
      color: color, // Add color class
      pieColor: pieColor // Add hex color for chart
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent); // Sort by total spent
};


const mockCategories = [
  { name: 'Shopping', amount: 1240, percentage: 20, icon: ShoppingBag, color: 'bg-blue-500', pieColor: '#4285F4' },
  { name: 'Housing', amount: 1500, percentage: 24, icon: Home, color: 'bg-green-500', pieColor: '#34A853' },
  { name: 'Transportation', amount: 450, percentage: 7, icon: Car, color: 'bg-amber-500', pieColor: '#FBBC05' },
  { name: 'Food & Dining', amount: 680, percentage: 11, icon: Coffee, color: 'bg-red-500', pieColor: '#EA4335' },
  { name: 'Airtime', amount: 250, percentage: 4, icon: SparkleIcon, color: 'bg-sky-500', pieColor: '#0EA5E9' },
  { name: 'Electricity', amount: 320, percentage: 5, icon: Home, color: 'bg-yellow-500', pieColor: '#EAB308' },
  { name: 'Online Payment', amount: 280, percentage: 4, icon: ShoppingBag, color: 'bg-blue-700', pieColor: '#1D4ED8' },
  { name: 'TV', amount: 250, percentage: 4, icon: Home, color: 'bg-purple-600', pieColor: '#9333EA' },
  { name: 'Bank Deposit', amount: 180, percentage: 3, icon: ArrowDown, color: 'bg-emerald-500', pieColor: '#10B981' },
  { name: 'Transfer from', amount: 220, percentage: 3, icon: ArrowDown, color: 'bg-indigo-500', pieColor: '#6366F1' },
  { name: 'Transfer to', amount: 190, percentage: 3, icon: ArrowUp, color: 'bg-rose-500', pieColor: '#F43F5E' },
  { name: 'Betting', amount: 150, percentage: 2, icon: Tag, color: 'bg-orange-500', pieColor: '#F97316' },
  { name: 'Mobile Data', amount: 120, percentage: 2, icon: SparkleIcon, color: 'bg-cyan-500', pieColor: '#06B6D4' },
  { name: 'Cash Withdraw', amount: 200, percentage: 3, icon: ArrowUp, color: 'bg-red-600', pieColor: '#DC2626' },
  { name: 'Targets', amount: 170, percentage: 3, icon: DollarSign, color: 'bg-amber-600', pieColor: '#D97706' },
  { name: 'USSD Charge', amount: 100, percentage: 2, icon: Tag, color: 'bg-slate-500', pieColor: '#64748B' }
];

const mockTransactions = [
  { id: 1, date: '2023-06-15', description: 'Whole Foods Market', amount: 78.35, category: 'Food & Dining' },
  { id: 2, date: '2023-06-14', description: 'Amazon.com', amount: 124.99, category: 'Shopping' },
  { id: 3, date: '2023-06-13', description: 'Uber', amount: 24.50, category: 'Transportation' },
  { id: 4, date: '2023-06-10', description: 'Rent Payment', amount: 1500, category: 'Housing' },
  { id: 5, date: '2023-06-08', description: 'Starbucks', amount: 5.65, category: 'Food & Dining' },
  { id: 6, date: '2023-06-06', description: 'Target', amount: 95.47, category: 'Shopping' },
  { id: 7, date: '2023-06-05', description: 'Gas Station', amount: 45.23, category: 'Transportation' },
  { id: 8, date: '2023-06-03', description: 'Grocery Store', amount: 112.34, category: 'Food & Dining' },
  { id: 9, date: '2023-06-02', description: 'Mobile Network', amount: 250, category: 'Airtime' },
  { id: 10, date: '2023-06-01', description: 'Electric Company', amount: 320, category: 'Electricity' },
  { id: 11, date: '2023-05-30', description: 'Netflix Subscription', amount: 150, category: 'TV' },
  { id: 12, date: '2023-05-28', description: 'Online Store', amount: 280, category: 'Online Payment' },
  { id: 13, date: '2023-05-25', description: 'Cable TV', amount: 100, category: 'TV' },
  { id: 14, date: '2023-05-24', description: 'Bank Deposit', amount: 180, category: 'Bank Deposit' },
  { id: 15, date: '2023-05-23', description: 'Transfer from John', amount: 220, category: 'Transfer from' },
  { id: 16, date: '2023-05-22', description: 'Transfer to Savings', amount: 190, category: 'Transfer to' },
  { id: 17, date: '2023-05-21', description: 'Sports Betting', amount: 150, category: 'Betting' },
  { id: 18, date: '2023-05-20', description: 'Data Bundle Purchase', amount: 120, category: 'Mobile Data' },
  { id: 19, date: '2023-05-19', description: 'ATM Withdrawal', amount: 200, category: 'Cash Withdraw' },
  { id: 20, date: '2023-05-18', description: 'Savings Target', amount: 170, category: 'Targets' },
  { id: 21, date: '2023-05-17', description: 'USSD Banking Fee', amount: 100, category: 'USSD Charge' },
  { id: 22, date: '2023-05-16', description: 'Cash Deposit at Branch', amount: 250, category: 'Cash Deposit' },
  { id: 23, date: '2023-05-15', description: 'OWealth Investment', amount: 300, category: 'OWealth' },
  { id: 24, date: '2023-05-14', description: 'Add Money to Wallet', amount: 200, category: 'Add Money' },
  { id: 25, date: '2023-05-13', description: 'OPay Card Purchase', amount: 150, category: 'OPay Card Payment' },
  { id: 26, date: '2023-05-12', description: 'Failed Transaction Reversal', amount: 50, category: 'Reversal' },
  { id: 27, date: '2023-05-11', description: 'Fixed Deposit', amount: 500, category: 'Fixed' },
  { id: 28, date: '2023-05-10', description: 'Spend & Save Transaction', amount: 120, category: 'Spend & Save' },
  { id: 29, date: '2023-05-09', description: 'SafeBox Deposit', amount: 200, category: 'SafeBox' },
  { id: 30, date: '2023-05-08', description: 'SMS Alert Subscription', amount: 50, category: 'SMS Subscription' }
];

const COLORS = ['#8e44ad', '#00C49F', '#FFBB28', '#FF8042', '#4285F4', '#EA4335', '#34A853', '#F97316', '#6366F1', '#10B981', '#DC2626', '#EAB308', '#9333EA', '#06B6D4', '#D97706', '#64748B'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Analyze = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { statementData } = useStatement();
  const [loaded, setLoaded] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [useRealData, setUseRealData] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  useEffect(() => {
    if (statementData && statementData.transactions && statementData.transactions.length > 0) {
      console.log("Using real statement data with", statementData.transactions.length, "transactions");
      setUseRealData(true);
    } else {
      console.log("No statement data available, using mock data");
      setUseRealData(false);
    }
  }, [statementData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (statementData && statementData.transactions.length > 0) {
      generateAIInsights();
    }
  }, [statementData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex(prevIndex => {
        const categories = useRealData && statementData?.transactions 
          ? processCategoriesFromTransactions(statementData.transactions)
          : mockCategories;
          
        return (prevIndex + 1) % categories.length;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [statementData, useRealData]);

  // --- Define categoryIcons ONCE here inside the component ---
  const categoryIcons: Record<string, any> = {
    'Shopping': { icon: ShoppingBag, color: 'bg-blue-500', pieColor: '#4285F4' },
    'Housing': { icon: Home, color: 'bg-green-500', pieColor: '#34A853' },
    'Transportation': { icon: Car, color: 'bg-amber-500', pieColor: '#FBBC05' },
    'Food & Dining': { icon: Coffee, color: 'bg-red-500', pieColor: '#EA4335' },
    'Miscellaneous': { icon: Tag, color: 'bg-purple-500', pieColor: '#9334EA' },
    'TV': { icon: Home, color: 'bg-purple-600', pieColor: '#9333EA' },
    'Bank Deposit': { icon: ArrowDown, color: 'bg-emerald-500', pieColor: '#10B981' },
    'Transfer from': { icon: ArrowDown, color: 'bg-indigo-500', pieColor: '#6366F1' },
    'Transfer to': { icon: ArrowUp, color: 'bg-rose-500', pieColor: '#F43F5E' },
    'Betting': { icon: Tag, color: 'bg-orange-500', pieColor: '#F97316' },
    'Mobile Data': { icon: SparkleIcon, color: 'bg-cyan-500', pieColor: '#06B6D4' },
    'Cash Withdraw': { icon: ArrowUp, color: 'bg-red-600', pieColor: '#DC2626' },
    'Targets': { icon: DollarSign, color: 'bg-amber-600', pieColor: '#D97706' },
    'USSD Charge': { icon: Tag, color: 'bg-slate-500', pieColor: '#64748B' }
};

  const processedCategoriesData = useRealData && statementData?.transactions
    ? processCategoriesFromTransactions(statementData.transactions)
    : mockCategories.map(c => ({ name: c.name, amount: c.amount }));

  const totalAmountForPercentage = useRealData && statementData?.transactions
    ? statementData.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    : mockCategories.reduce((sum, c) => sum + c.amount, 0);

  const categories = processedCategoriesData.map(cat => {
    const { icon, color, pieColor } = categoryIcons[cat.name] || categoryIcons['Miscellaneous'];
    const percentage = totalAmountForPercentage > 0 ? Math.round((Math.abs(cat.amount) / totalAmountForPercentage) * 100) : 0;
    return {
      ...cat,
      icon,
      color,
      pieColor,
      percentage
    };
  }).sort((a, b) => b.amount - a.amount);

  const transactions = useRealData && statementData?.transactions
    ? statementData.transactions
    : mockTransactions;

  // --- Pass categoryIcons to processMerchantsFromTransactions ---
  const merchants = processMerchantsFromTransactions(transactions, categoryIcons); // Pass categoryIcons here

  const totalSpent = useRealData && statementData?.totalExpense
    ? statementData.totalExpense
    // Adjust mock total calculation if needed based on mockCategories structure
    : mockCategories.reduce((sum, category) => sum + (category.amount > 0 ? category.amount : 0), 0); // Sum only positive amounts for expense total

  // Filter chartData to only include expense categories (amount > 0 or specific logic)
  const expenseCategoriesChartData = categories
    .filter(category => category.amount > 0 && category.name !== 'Income' && !category.name.includes('Transfer from') && !category.name.includes('Deposit')) // Example filter for expenses
    .map(category => ({
      name: category.name,
      value: category.amount, // Use positive amount for chart value
      color: category.pieColor
  }));

  // Prepare data for merchant bar chart (top N merchants)
  const topMerchantsChartData = merchants.slice(0, 8).map((m, idx) => ({
    name: m.name,
    totalSpent: m.totalSpent,
    fill: COLORS[idx % COLORS.length] // Assign a unique color from the palette
  }));

  const chartData = categories.map(category => ({
    name: category.name,
    value: category.amount,
    color: category.pieColor
  }));

  const CHART_CONFIG = {
    expenses: {
      label: "Expenses",
      theme: {
        light: "hsl(var(--chart-1))",
        dark: "hsl(var(--chart-1))"
      }
    }
  };

  const generateAIInsights = async () => {
    // Add stricter check for statementData and transactions
    if (!statementData || !statementData.transactions || statementData.transactions.length === 0) {
      toast({
        variant: "destructive",
        title: "No data available",
        // Updated description for clarity
        description: "Please upload a bank statement with valid transactions to generate insights."
      });
      return;
    }

    setIsGeneratingInsights(true);

    try {
      // Log the raw data structure for debugging comparison (PDF vs Image)
      console.log('Attempting to generate insights with raw statementData:', JSON.stringify(statementData, null, 2));

      // Basic Data Sanitization: Ensure critical fields have correct types/defaults
      const sanitizedTransactions = statementData.transactions.map(t => ({
        ...t,
        // Ensure amount is a number, handle potential null/undefined/string values
        amount: typeof t.amount === 'string'
                  ? parseFloat(t.amount.replace(/[^0-9.-]+/g,"")) // Remove non-numeric chars (except dot/minus)
                  : (typeof t.amount === 'number' ? t.amount : 0), // Use number if already is, else default to 0
        // Ensure category is a non-empty string
        category: typeof t.category === 'string' && t.category.trim() !== '' ? t.category : 'Miscellaneous',
        // Ensure description is a string
        description: typeof t.description === 'string' ? t.description : '',
        // Ensure date is a string
        date: typeof t.date === 'string' ? t.date : '',
      })).filter(t => !isNaN(t.amount)); // Filter out any transactions where amount parsing failed

      // Check if any valid transactions remain after sanitization
      if (sanitizedTransactions.length === 0) {
         throw new Error("No valid transactions found after sanitization. Check data quality.");
      }

      // Prepare the data payload for the insight service
      const dataToSend = {
        ...statementData,
        transactions: sanitizedTransactions,
        // Ensure totals are numbers, default to 0 if missing/invalid
        totalIncome: typeof statementData.totalIncome === 'number' ? statementData.totalIncome : 0,
        totalExpense: typeof statementData.totalExpense === 'number' ? statementData.totalExpense : 0,
      };

      // Log the sanitized data being sent
      console.log('Sending sanitized data to generateInsights:', JSON.stringify(dataToSend, null, 2));

      // Call the insight service with the sanitized data
      const generatedInsights = await generateInsights(dataToSend);
      setInsights(generatedInsights);

      toast({
        title: "Insights Generated",
        description: "AI analysis of your statement is complete!",
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      // Log the specific error message for easier debugging
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error('Error details:', errorMessage);

      // Update fallback insights to include the error message
      setInsights([
        `Failed to generate AI insights. Error: ${errorMessage}`,
        'Consider reviewing your largest transactions for savings opportunities.',
        'Try categorizing your transactions to better understand spending patterns.'
      ]);

      toast({
        variant: "destructive",
        title: "Error Generating Insights", // More specific title
        // Provide more detail in the toast description
        description: `Failed: ${errorMessage}. Please check console logs for details.`,
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleNoDataRedirect = () => {
    toast({
      title: "No Statement Data",
      description: "Please upload a bank statement first.",
    });
    navigate('/dashboard/upload');
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handleLoadAnalysis = async (analysis: any) => {
    if (statementData) {
      // Ensure transactions have the correct type
      const typedTransactions = analysis.transactions.map((t: any) => ({
        ...t,
        type: t.type || (t.amount < 0 ? 'expense' : 'income')
      }));

      // Update the statement data in the context
      statementData.transactions = typedTransactions;
      statementData.totalIncome = analysis.totalIncome;
      statementData.totalExpense = analysis.totalExpense;
      
      // Update local state
      setInsights(analysis.insights || []);
      setUseRealData(true);
      
      // Show success message
      toast({
        title: "Analysis Loaded",
        description: "Your saved analysis has been loaded successfully.",
      });
    }
  };

  // Modify the categories display section to show all categories
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 animate-slide-down">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Spending Analysis</h1>
            <p className="text-muted-foreground">
              {useRealData 
                ? `Analysis of your uploaded statement with ${statementData?.transactions.length} transactions`
                : 'Example data shown. Please upload a statement for real insights.'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            {!useRealData && (
              <Button 
                variant="default" 
                className="gap-2 text-sm"
                onClick={handleNoDataRedirect}
              >
                <DollarSign className="w-4 h-4" />
                Upload Statement
              </Button>
            )}
            {useRealData && (
              <>
                <Button 
                  variant="outline" 
                  className="gap-2 text-sm mr-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Your Statement
                </Button>
                <Button 
                  variant="default" 
                  className="gap-2 text-sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="w-4 h-4" />
                  Save Analysis
                </Button>
              </>
            )}
          </div>
        </div>
        
        {!loaded ? (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-28">
                  <CardContent className="p-6">
                    <div className="h-5 w-24 bg-muted/50 rounded-md mb-4"></div>
                    <div className="h-6 w-16 bg-muted/50 rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="h-96">
              <CardContent className="p-6">
                <div className="h-full w-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 mb-4"></div>
                  <div className="h-4 w-32 bg-muted/50 rounded-md"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
              <StatCard
                title="Total Expenses"
                value={`$${totalSpent.toLocaleString()}`}
                icon={<DollarSign className="w-4 h-4 text-primary" />}
                trend="up"
                trendValue={statementData ? `${statementData.transactions.length} items` : "+12%"}
              />
              <StatCard
                title="Top Category"
                value={categories[0]?.name || "N/A"}
                icon={categories[0]?.icon ? React.createElement(categories[0].icon, { className: "w-4 h-4 text-green-500" }) : <Tag className="w-4 h-4 text-green-500" />}
                trend="neutral"
                trendValue={categories[0] ? `${categories[0].percentage}%` : "0%"}
              />
              <StatCard
                title="Transactions"
                value={transactions.length}
                icon={<Tag className="w-4 h-4 text-amber-500" />}
                trend="down"
                trendValue={statementData ? `From ${statementData.startDate || 'unknown'}` : "-3%"}
              />
            </div>
            
            <Tabs defaultValue="categories" className="animate-blur-in" style={{ animationDelay: '200ms' }}>
              <TabsList className="mb-6">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="merchants">Merchants</TabsTrigger>
                {/* Add Merchant Analytics Tab Trigger */}
                <TabsTrigger value="merchant-analytics">Merchant Analytics</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="saved">Saved Analyses</TabsTrigger>
              </TabsList>

              <TabsContent value="categories">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
                        
                        <div className="space-y-4 mt-6 max-h-[500px] overflow-y-auto pr-2">
                          {categories.map((category, index) => (
                            <div key={index} className={cn(
                              "animate-fade-in",
                              index === activeIndex ? "scale-105 transition-transform" : ""
                            )} style={{ animationDelay: `${index * 100}ms` }}>
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <div className={cn("p-1.5 rounded-md mr-2", category.color)}>
                                    {React.createElement(category.icon, { className: "w-3.5 h-3.5 text-white" })}
                                  </div>
                                  <span className="text-sm font-medium">{category.name}</span>
                                </div>
                                <span className="text-sm font-medium">${category.amount.toFixed(2)}</span>
                              </div>
                              <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full", category.color)}
                                  style={{ width: `${category.percentage}%`, transition: "width 1s ease-in-out" }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>{category.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className="h-64 w-full max-w-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                animationBegin={0}
                                animationDuration={1500}
                                animationEasing="ease-out"
                                onMouseEnter={onPieEnter}
                              >
                                {chartData.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.color} 
                                    className={cn(
                                      "transition-opacity duration-300",
                                      index === activeIndex ? "filter drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))" : "opacity-70"
                                    )}
                                    stroke={index === activeIndex ? "#fff" : "none"}
                                    strokeWidth={index === activeIndex ? 2 : 0}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-background border border-border p-2 rounded-md shadow-md">
                                        <p className="font-medium">{data.name}</p>
                                        <p className="text-sm">${data.value.toFixed(2)}</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Legend 
                                layout="horizontal" 
                                verticalAlign="bottom" 
                                align="center"
                                wrapperStyle={{ paddingTop: "20px" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="transactions">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Description</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((transaction, index) => {
                            // Determine the display category for the transaction list
                            let displayCategory = transaction.category || "Uncategorized";
                            if (displayCategory === 'Transfers') {
                              const description = transaction.description.toLowerCase();
                              if (description.includes('from')) {
                                displayCategory = 'Transfer from';
                              } else if (description.includes('to')) {
                                displayCategory = 'Transfer to';
                              }
                              // Keep 'Transfers' if neither 'from' nor 'to' is found
                            }

                            return (
                              <tr 
                                key={transaction.id || index}
                                className={cn(
                                  "border-b border-border/50 hover:bg-muted/20 transition-colors",
                                  "animate-fade-in"
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <td className="py-3 px-4 text-sm">
                                  {transaction.date}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium">{transaction.description}</td>
                                <td className="py-3 px-4 text-sm">
                                  <span className="px-2 py-1 rounded-full text-xs bg-muted/50">
                                    {/* Use the determined displayCategory */}
                                    {displayCategory}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-medium">
                                  ${transaction.amount.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Add Merchants Tab Content */}
              <TabsContent value="merchants">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Top Merchants</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Merchant</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Spent</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Frequency</th>
                          </tr>
                        </thead>
                        <tbody>
                          {merchants.map((merchant, index) => (
                            <tr
                              key={index}
                              className={cn(
                                "border-b border-border/50 hover:bg-muted/20 transition-colors",
                                "animate-fade-in"
                              )}
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <td className="py-3 px-4 text-sm font-medium">{merchant.name}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className="px-2 py-1 rounded-full text-xs bg-muted/50">
                                  {merchant.category}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-medium">
                                ${merchant.totalSpent.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-medium">
                                {merchant.frequency}x
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                     {merchants.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No merchant data could be extracted from the transactions.
                        </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="merchant-analytics">
                <Card>
                  <CardContent className="p-6">
                    <MerchantAnalytics
                      merchants={merchants}
                      topMerchantsChartData={topMerchantsChartData}
                      COLORS={COLORS}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                          <h3 className="text-lg font-medium">AI-Powered Insights</h3>
                          <div className="mt-2 md:mt-0">
                            <Button 
                              onClick={generateAIInsights} 
                              disabled={isGeneratingInsights}
                              className="gap-2"
                            >
                              <SparkleIcon className="w-4 h-4" />
                              {isGeneratingInsights ? 'Generating...' : 'Generate Insights'}
                            </Button>
                          </div>
                        </div>
                        
                        {insights.length > 0 ? (
                          <div className="space-y-6">
                            <div className="p-4 rounded-md bg-primary/5 border border-primary/20 animate-slide-up">
                              <h4 className="font-medium flex items-center gap-2 mb-2">
                                <ArrowDown className="w-4 h-4 text-green-500" />
                                {insights[0] ? 'Spending Opportunity' : 'No Insights Available'}
                              </h4>
                              <p className="text-muted-foreground">
                                {insights[0] || 'Generate insights to see recommendations based on your spending patterns.'}
                              </p>
                            </div>
                            
                            {insights[1] && (
                              <div className="p-4 rounded-md bg-amber-500/5 border border-amber-500/20 animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <h4 className="font-medium flex items-center gap-2 mb-2">
                                  <PieChartIcon className="w-4 h-4 text-amber-500" />
                                  Category Analysis
                                </h4>
                                <p className="text-muted-foreground">{insights[1]}</p>
                              </div>
                            )}
                            
                            {insights[2] && (
                              <div className="p-4 rounded-md bg-green-500/5 border border-green-500/20 animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <h4 className="font-medium flex items-center gap-2 mb-2">
                                  <ArrowUp className="w-4 h-4 text-green-500" />
                                  Savings Recommendation
                                </h4>
                                <p className="text-muted-foreground">{insights[2]}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="bg-muted/30 p-4 rounded-full mb-4">
                              <SparkleIcon className="w-8 h-8 text-primary/50" />
                            </div>
                            <h4 className="text-lg font-medium mb-2">No insights generated yet</h4>
                            <p className="text-muted-foreground max-w-md mb-6">
                              Click the "Generate Insights" button to get AI-powered recommendations based on your financial data.
                            </p>
                            {!hasGeminiApiKey() && (
                              <div className="mt-2 p-3 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-md text-sm max-w-md">
                                <p className="font-medium mb-1">API Key Required</p>
                                <p>Please set your Gemini API key in the settings to enable AI insights.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">AI Chat Assistant</h3>
                        <AiChat 
                          transactions={transactions}
                          totalIncome={useRealData && statementData?.totalIncome ? statementData.totalIncome : 0}
                          totalExpense={totalSpent}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="saved">
                <SavedAnalyses onLoadAnalysis={handleLoadAnalysis} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <SaveAnalysisDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          transactions={transactions}
          totalIncome={useRealData && statementData?.totalIncome ? statementData.totalIncome : 0}
          totalExpense={totalSpent}
          categories={categories}
          insights={insights}
        />
      </div>
    </div>
  );
};

export default Analyze;

