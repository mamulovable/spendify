import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSavedAnalyses } from '@/services/storageService';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { useMemo } from 'react';
import CategoryCharts from './CategoryCharts';
import CategoryTotalsChart from './CategoryTotalsChart';
import RecurringExpensesChart from './RecurringExpensesChart';
import PredictionsTab from './PredictionsTab';
import { PieChart, Pie, Cell } from 'recharts'; // Add this import

// Define a type for the raw analysis data including transactions
interface RawAnalysisData {
  date: string | Date;
  totalIncome: number;
  totalExpense: number;
  name: string;
  transactions: any[] | string; // Keep flexible for parsing
  // Add other fields if necessary, e.g., id
  id?: string | number;
}

// Define a type for the processed chart data
interface ChartItem {
  name: string; // Use a generic 'name' for compatibility
  amount: number;
}

// Simple color palette for comparison chart bars
const COMPARISON_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

const Charts = () => {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [rawTransactions, setRawTransactions] = useState<any[]>([]);
  // Add state to store the raw analyses data
  const [rawAnalysesData, setRawAnalysesData] = useState<RawAnalysisData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyses = async () => {
      try {
        // Ensure savedAnalyses is an array, defaulting to [] if null/undefined
        const savedAnalyses: RawAnalysisData[] = await getSavedAnalyses() || [];

        // Explicitly check if it's an array (extra safety)
        const validAnalyses = Array.isArray(savedAnalyses) ? savedAnalyses : [];

        // Store the raw analyses data (now guaranteed to be an array)
        setRawAnalysesData(validAnalyses);

        // Use the validated array for mapping
        const formattedData = validAnalyses.map(analysis => ({
          date: new Date(analysis.date).toLocaleDateString(),
          totalIncome: analysis.totalIncome,
          totalExpense: analysis.totalExpense,
          name: analysis.name
        }));
        setAnalyses(formattedData); // Assuming AnalysisData[] is the correct type for analyses state

        // Use the validated array for flatMapping transactions
        const allTransactions = validAnalyses.flatMap(a => {
            let transactions = [];
            if (Array.isArray(a.transactions)) {
              transactions = a.transactions;
            } else if (typeof a.transactions === 'string') {
              try {
                transactions = JSON.parse(a.transactions);
                if (!Array.isArray(transactions)) transactions = [];
              } catch { transactions = []; }
            }
            // Ensure filtering happens on a valid array
            return Array.isArray(transactions) ? transactions.filter(tx => typeof tx === 'object' && tx !== null) : [];
        });

        console.log('Raw Transactions:', allTransactions);
        // Add this to inspect the first transaction's keys and a sample transaction
        if (allTransactions.length > 0) {
          console.log('Sample Transaction:', allTransactions[0]);
          console.log('Transaction Keys:', Object.keys(allTransactions[0]));
        }
        setRawTransactions(allTransactions);
      } catch (error) {
        console.error('Failed to load analyses:', error);
        // Set states to empty arrays in case of error
        setRawAnalysesData([]);
        setAnalyses([]);
        setRawTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyses();
  }, []);

  // --- CATEGORY CHART DATA (Top Spending Overall) ---
  const categoryData: ChartItem[] = useMemo(() => {
    const totals: { [key: string]: number } = {};
    rawTransactions.forEach(tx => {
      if (typeof tx !== 'object' || tx === null) return;
      const category = tx.category;
      const type = tx.type;
      const amount = Number(tx.amount);
      if (type === 'debit' && category && typeof category === 'string' && category.trim() !== '' && !isNaN(amount)) {
        totals[category] = (totals[category] || 0) + amount;
      }
    });
    const result = Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
    console.log('Calculated Category Data:', result);
    return result;
  }, [rawTransactions]);

  // --- MERCHANT CHART DATA ---
  const merchantData: ChartItem[] = useMemo(() => {
    const totals: { [key: string]: number } = {};
    rawTransactions.forEach(tx => {
       if (typeof tx !== 'object' || tx === null) return;
       // Change this line to use the correct field, e.g., 'payee' or 'description'
       const merchant = tx.payee || tx.description; // <-- update as needed
       const type = tx.type;
       const amount = Number(tx.amount);
       if (type === 'debit' && merchant && typeof merchant === 'string' && merchant.trim() !== '' && !isNaN(amount)) {
         totals[merchant] = (totals[merchant] || 0) + amount;
       }
    });
    const result = Object.entries(totals)
       .map(([name, amount]) => ({ name, amount }))
       .sort((a, b) => b.amount - a.amount)
       .slice(0, 10);
    console.log('Calculated Merchant Data:', result);
    return result;
  }, [rawTransactions]);

  // --- CATEGORY COMPARISON CHART DATA ---
  const categoryComparisonData = useMemo(() => {
    const totalsByAnalysis: { [analysisName: string]: { [category: string]: number } } = {};
    const allCategories = new Set<string>();
    const analysisNames: string[] = [];

    rawAnalysesData.forEach(analysis => {
      const analysisName = analysis.name || `Analysis_${analysis.id || analysis.date}`; // Use name or fallback
      if (!analysisNames.includes(analysisName)) {
        analysisNames.push(analysisName);
      }
      totalsByAnalysis[analysisName] = {};

      let transactions = [];
      if (Array.isArray(analysis.transactions)) {
        transactions = analysis.transactions;
      } else if (typeof analysis.transactions === 'string') {
        try {
          transactions = JSON.parse(analysis.transactions);
          if (!Array.isArray(transactions)) transactions = [];
        } catch { transactions = []; }
      }

      transactions.filter(tx => typeof tx === 'object' && tx !== null).forEach(tx => {
        const category = tx.category;
        const type = tx.type;
        const amount = Number(tx.amount);

        if (type === 'debit' && category && typeof category === 'string' && category.trim() !== '' && !isNaN(amount)) {
          totalsByAnalysis[analysisName][category] = (totalsByAnalysis[analysisName][category] || 0) + amount;
          allCategories.add(category); // Keep track of all categories encountered
        }
      });
    });

    // Structure data for the chart
    const chartData = Array.from(allCategories).map(category => {
      const row: { [key: string]: string | number } = { category };
      analysisNames.forEach(name => {
        row[name] = totalsByAnalysis[name]?.[category] || 0;
      });
      return row;
    });

    console.log('Calculated Category Comparison Data:', chartData);
    console.log('Analysis Names for Comparison:', analysisNames);
    return { chartData, analysisNames };

  }, [rawAnalysesData]); // Depend on the raw analyses data

  // --- RECURRING EXPENSES DATA --- (Moved inside the component)
  const recurringExpenses = useMemo(() => {
    const transactionGroups: { [key: string]: { count: number; tx: any } } = {};
    rawTransactions.forEach(tx => {
      if (
        typeof tx === 'object' &&
        tx !== null &&
        tx.type === 'debit' &&
        tx.category &&
        typeof tx.category === 'string' &&
        tx.category.trim() !== '' &&
        !isNaN(Number(tx.amount))
      ) {
        const key = `${tx.category}-${Number(tx.amount)}`;
        if (!transactionGroups[key]) {
          transactionGroups[key] = { count: 0, tx };
        }
        transactionGroups[key].count += 1;
      }
    });
    // Only include those that recur at least 3 times
    return Object.values(transactionGroups)
      .filter(group => group.count >= 3)
      .map(group => ({
        category: group.tx.category,
        amount: Number(group.tx.amount),
        count: group.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [rawTransactions]);

  // --- PREDICTIONS: Top 3 categories to consider reducing --- (Moved inside the component)
  const recommendations = useMemo(() => {
    if (!categoryData.length) return [];
    // Top 3 categories by spend
    return categoryData
      .slice(0, 3)
      .map(item => `Consider reducing your spending on "${item.name}" (₦${item.amount.toLocaleString()})`);
  }, [categoryData]);


  const totalIncome = analyses.reduce((sum, analysis) => sum + analysis.totalIncome, 0);
  const totalExpense = analyses.reduce((sum, analysis) => sum + analysis.totalExpense, 0);
  const netIncome = totalIncome - totalExpense;

  // --- Debugging Logs Removed ---

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto pt-32 px-6 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Financial Trends</h1>
          <p className="text-muted-foreground">Visualize your financial data across all saved analyses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Income</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-1">Net Income</div>
              <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netIncome)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="category-totals">Category Totals</TabsTrigger>
            <TabsTrigger value="recurring-expenses">Recurring Expenses</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Analysis: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalIncome" 
                        stroke="#22c55e" 
                        name="Income"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalExpense" 
                        stroke="#ef4444" 
                        name="Expenses"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => `Analysis: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="totalIncome" fill="#22c55e" name="Income" />
                      <Bar dataKey="totalExpense" fill="#ef4444" name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categories">
            <CategoryCharts
              categoryData={categoryData}
              categoryComparisonData={categoryComparisonData}
              comparisonColors={COMPARISON_COLORS}
            />
          </TabsContent>

          <TabsContent value="merchants">
            <Card>
              <CardHeader>
                <CardTitle>Top Merchants</CardTitle>
              </CardHeader>
              <CardContent>
                {merchantData.length === 0 ? (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No merchant data available to display charts.
                  </div>
                ) : (
                  <div className="h-[400px] grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={350}>
                      {/* Use 'name' for XAxis dataKey */}
                      <BarChart data={merchantData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        {/* Add formatter to Tooltip */}
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="amount" fill="#82ca9d" name="Total Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={350}>
                      {/* Use 'name' for XAxis dataKey */}
                      <LineChart data={merchantData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        {/* Add formatter to Tooltip */}
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#82ca9d" name="Total Spent" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* --- ADD THESE MISSING TABS CONTENT BLOCKS --- */}
          <TabsContent value="category-totals">
            <CategoryTotalsChart categoryData={categoryData} />
          </TabsContent>

          <TabsContent value="recurring-expenses">
            <RecurringExpensesChart recurringExpenses={recurringExpenses} />
          </TabsContent>

          <TabsContent value="predictions">
            <PredictionsTab recommendations={recommendations} />
          </TabsContent>
          {/* --- END OF ADDED BLOCKS --- */}

        </Tabs>
      {/* --- Place the new bottom section here, before closing the main container --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        {/* Merchant List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            {merchantData.length === 0 ? (
              <div className="text-muted-foreground">No merchant data available.</div>
            ) : (
              <ul className="space-y-2">
                {merchantData.map((merchant, idx) => (
                  <li key={merchant.name} className="flex justify-between">
                    <span>{merchant.name}</span>
                    <span className="font-semibold">{formatCurrency(merchant.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Donut Chart for Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COMPARISON_COLORS[index % COMPARISON_COLORS.length]} />
                  ))}
                </Pie>
                <Legend layout="vertical" align="right" verticalAlign="middle" />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* --- End Bottom Section --- */}
    </div> {/* This closes the main container */}
  </div>
);
};

export default Charts;