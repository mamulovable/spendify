import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PredictionProps {
  recommendations: string[];
}

const dummyPredictionData = [
  { month: 'Apr', predicted: 1200 },
  { month: 'May', predicted: 1100 },
  { month: 'Jun', predicted: 1050 },
  { month: 'Jul', predicted: 950 },
];

const PredictionsTab: React.FC<PredictionProps> = ({ recommendations }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Expense Forecast (Placeholder)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyPredictionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="predicted" stroke="#8884d8" name="Predicted Expense" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Budget Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-6">
          {recommendations.length === 0 ? (
            <li>No recommendations available.</li>
          ) : (
            recommendations.map((rec, idx) => <li key={idx}>{rec}</li>)
          )}
        </ul>
      </CardContent>
    </Card>
  </div>
);

export default PredictionsTab;