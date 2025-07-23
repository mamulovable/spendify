import { CashFlowData } from "@/types/cashFlow";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface CashFlowWaterfallChartProps {
  data: CashFlowData[];
}

export const CashFlowWaterfallChart = ({ data }: CashFlowWaterfallChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No cash flow data available
      </div>
    );
  }

  // Format month labels (e.g., "2023-01" to "Jan 2023")
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  // Prepare data for the chart
  const chartData = data.map(item => ({
    month: item.month,
    formattedMonth: formatMonth(item.month),
    income: item.isPrediction ? item.predictedIncome : item.income,
    expenses: item.isPrediction ? -item.predictedExpenses : -item.expenses,
    netCashFlow: item.isPrediction ? item.predictedNetCashFlow : item.netCashFlow,
    isPrediction: item.isPrediction
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPrediction = data.isPrediction;
      
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">
            {data.formattedMonth}
            {isPrediction && " (Predicted)"}
          </p>
          <div className="space-y-1 mt-1">
            <p className="text-sm">
              <span className="font-medium">Income:</span> ₦{Math.abs(payload[0].value).toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Expenses:</span> ₦{Math.abs(payload[1].value).toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Net Cash Flow:</span>{" "}
              <span className={data.netCashFlow >= 0 ? "text-green-500" : "text-red-500"}>
                ₦{data.netCashFlow.toLocaleString()}
              </span>
            </p>
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
            dataKey="formattedMonth" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `₦${Math.abs(value / 1000)}k`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} stroke="#000" />
          <Bar 
            dataKey="income" 
            name="Income" 
            fill="#4ade80" 
            radius={[4, 4, 0, 0]}
            fillOpacity={d => d.isPrediction ? 0.5 : 1}
          />
          <Bar 
            dataKey="expenses" 
            name="Expenses" 
            fill="#f87171" 
            radius={[4, 4, 0, 0]}
            fillOpacity={d => d.isPrediction ? 0.5 : 1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};