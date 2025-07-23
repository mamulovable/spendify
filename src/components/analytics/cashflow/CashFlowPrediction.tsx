import { CashFlowData, CashFlowGap } from "@/types/cashFlow";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from "recharts";
import { AlertTriangle } from "lucide-react";

interface CashFlowPredictionProps {
  data: CashFlowData[];
  gaps: CashFlowGap[];
}

export const CashFlowPrediction = ({ data, gaps }: CashFlowPredictionProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No cash flow data available for prediction
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
          <p className="text-sm mt-1">
            <span className="font-medium">Net Cash Flow:</span>{" "}
            <span className={data.netCashFlow >= 0 ? "text-green-500" : "text-red-500"}>
              ₦{data.netCashFlow.toLocaleString()}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="netCashFlow" 
              stroke={d => d.isPrediction ? "#60a5fa" : "#4ade80"}
              fill={d => d.isPrediction ? "url(#colorPredicted)" : "url(#colorActual)"}
              activeDot={{ r: 8 }}
              name={d => d.isPrediction ? "Predicted Cash Flow" : "Actual Cash Flow"}
              strokeDasharray={d => d.isPrediction ? "5 5" : "0"}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {gaps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Cash Flow Gaps Detected
          </h4>
          <div className="space-y-2">
            {gaps.map((gap, index) => (
              <div 
                key={index} 
                className={`p-3 text-sm rounded-md border ${
                  gap.severity === 'high' 
                    ? 'border-red-500 bg-red-500/5' 
                    : gap.severity === 'medium'
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-yellow-500 bg-yellow-500/5'
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {formatMonth(gap.startDate)} - {formatMonth(gap.endDate)}
                    </p>
                    <p className="text-muted-foreground mt-1">{gap.recommendation}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₦{gap.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {gap.severity.charAt(0).toUpperCase() + gap.severity.slice(1)} severity
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};