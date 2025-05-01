import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ChartItem {
  name: string;
  amount: number;
}

interface CategoryComparisonData {
  chartData: Array<{ [key: string]: string | number }>;
  analysisNames: string[];
}

interface CategoryChartsProps {
  categoryData: ChartItem[];
  categoryComparisonData: CategoryComparisonData;
  comparisonColors: string[];
}

const CategoryCharts: React.FC<CategoryChartsProps> = ({
  categoryData,
  categoryComparisonData,
  comparisonColors,
}) => (
  <>
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Top Spending Categories (Overall)</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No overall category data available.
          </div>
        ) : (
          <div className="h-[400px] grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={categoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Total Spent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Category Spending Comparison Across Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryComparisonData.chartData.length === 0 || categoryComparisonData.analysisNames.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            No category comparison data available.
          </div>
        ) : (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryComparisonData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                {categoryComparisonData.analysisNames.map((analysisName, index) => (
                  <Bar
                    key={analysisName}
                    dataKey={analysisName}
                    fill={comparisonColors[index % comparisonColors.length]}
                    name={analysisName}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  </>
);

export default CategoryCharts;