import React from 'react';

interface CategoryBreakdownChartProps {
  data: { category: string; amount: number; color: string }[];
}

const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ data }) => {
  // Placeholder: Replace with pie/donut chart later
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <span className="text-gray-500">Category Breakdown</span>
      <div className="h-40 flex items-center justify-center text-gray-400">
        [Category Breakdown Chart Placeholder]
      </div>
    </div>
  );
};

export default CategoryBreakdownChart;
