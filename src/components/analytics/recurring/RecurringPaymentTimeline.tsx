import { RecurringPaymentTrend } from "@/types/recurringExpense";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface RecurringPaymentTimelineProps {
  data: RecurringPaymentTrend[];
}

export const RecurringPaymentTimeline = ({ data }: RecurringPaymentTimelineProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No recurring payment data available
      </div>
    );
  }

  // Format month labels (e.g., "2023-01" to "Jan 2023")
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  // Calculate average monthly recurring expense
  const average = data.reduce((sum, item) => sum + item.amount, 0) / data.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">{formatMonth(label)}</p>
          <p className="text-sm">
            <span className="font-medium">Amount:</span> ₦{payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {payload[0].value > average 
              ? `${Math.round((payload[0].value / average - 1) * 100)}% above average`
              : `${Math.round((1 - payload[0].value / average) * 100)}% below average`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
          <ReferenceLine 
            y={average} 
            stroke="#8884d8" 
            strokeDasharray="3 3" 
            label={{ 
              value: 'Average', 
              position: 'insideBottomRight',
              fontSize: 12
            }} 
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Recurring Expenses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};