import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface ChartItem {
  name: string;
  amount: number;
}

interface Props {
  categoryData: ChartItem[];
}

const CategoryTotalsChart: React.FC<Props> = ({ categoryData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Top 10 Category Totals</CardTitle>
    </CardHeader>
    <CardContent>
      {categoryData.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          No category data available.
        </div>
      ) : (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="amount" fill="#8884d8" name="Total Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent>
  </Card>
);

export default CategoryTotalsChart;