import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { AIFeedbackTrend } from '@/types/aiFeedback';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AIFeedbackTrendsChartProps {
  data: AIFeedbackTrend[];
  className?: string;
}

export function AIFeedbackTrendsChart({ data, className }: AIFeedbackTrendsChartProps) {
  // Process data for chart
  const prepareChartData = () => {
    if (!data || data.length === 0) return null;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return {
      labels: sortedData.map(item => format(parseISO(item.date), 'MMM d')),
      datasets: [
        {
          label: 'Total Feedback',
          data: sortedData.map(item => item.totalFeedback),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Positive Feedback',
          data: sortedData.map(item => item.positiveFeedback),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Negative Feedback',
          data: sortedData.map(item => item.negativeFeedback),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Misclassifications',
          data: sortedData.map(item => item.misclassifications),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  };
  
  const chartData = prepareChartData();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Feedback Count'
        }
      }
    }
  };
  
  return (
    <div className={`h-80 ${className}`}>
      {chartData ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full border border-dashed rounded-md">
          <p className="text-muted-foreground">No feedback trend data available</p>
        </div>
      )}
    </div>
  );
}