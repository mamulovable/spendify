import { TaxCategory } from "@/types/taxCategorization";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from "recharts";
import { useState } from "react";

interface TaxCategoryPieChartProps {
  categories: TaxCategory[];
  showDeductibleOnly?: boolean;
}

export const TaxCategoryPieChart = ({ 
  categories,
  showDeductibleOnly = false
}: TaxCategoryPieChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  if (!categories || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No tax category data available
      </div>
    );
  }

  // Filter categories based on showDeductibleOnly flag
  const filteredCategories = showDeductibleOnly 
    ? categories.filter(category => category.isDeductible && category.totalAmount > 0)
    : categories.filter(category => category.totalAmount > 0);

  if (filteredCategories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        {showDeductibleOnly 
          ? "No deductible tax categories found" 
          : "No tax categories with expenses found"}
      </div>
    );
  }

  // Prepare data for the chart
  const chartData = filteredCategories.map(category => ({
    name: category.name,
    value: category.totalAmount,
    isDeductible: category.isDeductible
  }));

  // Define colors for the chart
  const COLORS = [
    '#4f46e5', '#0ea5e9', '#10b981', '#84cc16', '#eab308', 
    '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1'
  ];

  const getColorIndex = (index: number) => index % COLORS.length;

  const renderActiveShape = (props: any) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value
    } = props;
  
    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#888">
          {payload.name}
        </text>
        <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#333" fontWeight="bold">
          ₦{value.toLocaleString()}
        </text>
        <text x={cx} y={cy + 30} dy={8} textAnchor="middle" fill="#888" fontSize={12}>
          {(percent * 100).toFixed(1)}%
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background p-3 border rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Amount:</span> ₦{data.value.toLocaleString()}
          </p>
          <p className="text-sm">
            <span className="font-medium">Percentage:</span> {(payload[0].percent * 100).toFixed(1)}%
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {data.isDeductible ? "Tax Deductible" : "Not Tax Deductible"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[getColorIndex(index)]} 
                stroke={entry.isDeductible ? "#10b981" : undefined}
                strokeWidth={entry.isDeductible ? 2 : 0}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};