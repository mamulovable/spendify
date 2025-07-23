import { TaxDeduction } from "@/types/taxCategorization";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface DeductibleExpensesChartProps {
  deductions: TaxDeduction[];
}

export const DeductibleExpensesChart = ({ deductions }: DeductibleExpensesChartProps) => {
  if (!deductions || deductions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No deductible expenses data available
      </div>
    );
  }

  // Group deductions by month and category
  const deductionsByMonth: Record<string, Record<string, number>> = {};
  const categories = new Set<string>();
  
  deductions.forEach(deduction => {
    const date = new Date(deduction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const category = deduction.category;
    
    if (!deductionsByMonth[monthKey]) {
      deductionsByMonth[monthKey] = {};
    }
    
    if (!deductionsByMonth[monthKey][category]) {
      deductionsByMonth[monthKey][category] = 0;
    }
    
    deductionsByMonth[monthKey][category] += deduction.amount;
    categories.add(category);
  });
  
  // Convert to chart data format
  const chartData = Object.entries(deductionsByMonth)
    .map(([month, categoryAmounts]) => {
      const result: Record<string, any> = { month };
      
      Object.entries(categoryAmounts).forEach(([category, amount]) => {
        result[category] = amount;
      });
      
      return result;
    })
    .sort((a, b) => a.month.localeCompare(b.month));
  
  // Format month labels (e.g., "2023-01" to "Jan 2023")
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };
  
  // Define colors for categories
  const categoryColors: Record<string, string> = {
    'Business': '#4f46e5',
    'Medical': '#0ea5e9',
    'Education': '#10b981',
    'Charity': '#84cc16',
    'Housing': '#eab308',
    'Transportation': '#f97316'
  };
  
  // Get color for a category
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || '#6366f1';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalAmount = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">{formatMonth(label)}</p>
          <div className="space-y-1 mt-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm flex justify-between items-center gap-4">
                <span style={{ color: entry.color }}>■</span>
                <span>{entry.name}:</span>
                <span className="font-medium">₦{entry.value.toLocaleString()}</span>
              </p>
            ))}
            <div className="border-t pt-1 mt-1">
              <p className="text-sm font-medium flex justify-between">
                <span>Total:</span>
                <span>₦{totalAmount.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tickFormatter={formatMonth}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `₦${value.toLocaleString()}`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Array.from(categories).map((category) => (
            <Bar 
              key={category} 
              dataKey={category} 
              stackId="a" 
              fill={getCategoryColor(category)} 
              name={category}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};