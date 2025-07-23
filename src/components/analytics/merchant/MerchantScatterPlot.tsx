import { MerchantData } from "@/types/merchantIntelligence";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  ZAxis
} from "recharts";

interface MerchantScatterPlotProps {
  merchants: MerchantData[];
}

export const MerchantScatterPlot = ({ merchants }: MerchantScatterPlotProps) => {
  if (!merchants || merchants.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No merchant data available
      </div>
    );
  }

  // Prepare data for the scatter plot
  const scatterData = merchants.map(merchant => ({
    name: merchant.name,
    frequency: merchant.frequencyPerMonth,
    amount: merchant.averageTransaction,
    totalSpent: merchant.totalSpent,
    category: merchant.category
  }));

  // Calculate averages for reference lines
  const avgFrequency = merchants.reduce((sum, m) => sum + m.frequencyPerMonth, 0) / merchants.length;
  const avgAmount = merchants.reduce((sum, m) => sum + m.averageTransaction, 0) / merchants.length;

  // Calculate maximum values for axis scaling
  const maxFrequency = Math.max(...merchants.map(m => m.frequencyPerMonth)) * 1.1;
  const maxAmount = Math.max(...merchants.map(m => m.averageTransaction)) * 1.1;

  // Calculate maximum total spent for bubble size scaling
  const maxTotalSpent = Math.max(...merchants.map(m => m.totalSpent));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          <div className="space-y-1 mt-1">
            <p className="text-sm">
              <span className="font-medium">Frequency:</span> {data.frequency.toFixed(1)} times/month
            </p>
            <p className="text-sm">
              <span className="font-medium">Average Amount:</span> ₦{data.amount.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Spent:</span> ₦{data.totalSpent.toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Category:</span> {data.category}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid />
            <XAxis 
              type="number" 
              dataKey="frequency" 
              name="Frequency" 
              unit=" times/month" 
              domain={[0, maxFrequency]}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Frequency (times/month)', 
                position: 'insideBottom', 
                offset: -5,
                fontSize: 12
              }}
            />
            <YAxis 
              type="number" 
              dataKey="amount" 
              name="Average Amount" 
              unit=" ₦" 
              domain={[0, maxAmount]}
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Average Amount (₦)', 
                angle: -90, 
                position: 'insideLeft',
                fontSize: 12
              }}
            />
            <ZAxis 
              type="number" 
              dataKey="totalSpent" 
              range={[50, 400]} 
              name="Total Spent" 
              unit=" ₦" 
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={avgFrequency} stroke="#8884d8" strokeDasharray="3 3" />
            <ReferenceLine y={avgAmount} stroke="#82ca9d" strokeDasharray="3 3" />
            <Scatter 
              name="Merchants" 
              data={scatterData} 
              fill="#8884d8" 
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border rounded-md bg-muted/20">
          <h4 className="text-sm font-medium mb-1">Quadrant Analysis</h4>
          <p className="text-xs text-muted-foreground">
            The scatter plot is divided into four quadrants based on average frequency and transaction amount.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 border rounded-md bg-blue-500/10">
            <p className="font-medium">High Frequency, High Amount</p>
            <p className="text-muted-foreground">Priority merchants for loyalty programs</p>
          </div>
          <div className="p-2 border rounded-md bg-green-500/10">
            <p className="font-medium">Low Frequency, High Amount</p>
            <p className="text-muted-foreground">Occasional big purchases</p>
          </div>
          <div className="p-2 border rounded-md bg-amber-500/10">
            <p className="font-medium">High Frequency, Low Amount</p>
            <p className="text-muted-foreground">Regular small expenses</p>
          </div>
          <div className="p-2 border rounded-md bg-red-500/10">
            <p className="font-medium">Low Frequency, Low Amount</p>
            <p className="text-muted-foreground">Occasional small purchases</p>
          </div>
        </div>
      </div>
    </div>
  );
};