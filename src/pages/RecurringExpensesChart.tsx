import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
  category: string;
  amount: number;
}

interface Props {
  recurringExpenses: Transaction[];
}

const RecurringExpensesChart: React.FC<Props> = ({ recurringExpenses }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recurring Expenses (Top 5)</CardTitle>
    </CardHeader>
    <CardContent>
      {recurringExpenses.length === 0 ? (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          No recurring expenses found.
        </div>
      ) : (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recurringExpenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="amount" fill="#ff7300" name="Recurring Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardContent>
  </Card>
);

export default RecurringExpensesChart;