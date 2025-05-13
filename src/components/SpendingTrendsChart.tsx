import React from 'react';

interface SpendingTrendsChartProps {
  data: { month: string; expenses: number; income: number }[];
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ data }) => {
  // Placeholder: Replace with chart library (e.g., recharts, chart.js) later
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <span className="text-gray-500">Spending Trends (last 6 months)</span>
      <div className="h-40 flex items-center justify-center text-gray-400">
        [Spending Trends Chart Placeholder]
      </div>
    </div>
  );
};

export default SpendingTrendsChart;
