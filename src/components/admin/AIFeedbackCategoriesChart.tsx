import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { AIFeedbackCategory } from '@/types/aiFeedback';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface AIFeedbackCategoriesChartProps {
  data: AIFeedbackCategory[];
  className?: string;
}

export function AIFeedbackCategoriesChart({ data, className }: AIFeedbackCategoriesChartProps) {
  // Process data for chart
  const prepareChartData = () => {
    if (!data || data.length === 0) return null;
    
    // Define colors for different feedback types
    const backgroundColors = [
      'rgba(16, 185, 129, 0.7)',  // Green for helpful/correct
      'rgba(239, 68, 68, 0.7)',   // Red for not helpful/incorrect
      'rgba(245, 158, 11, 0.7)',  // Amber for other
      'rgba(99, 102, 241, 0.7)',  // Indigo for additional categories
      'rgba(14, 165, 233, 0.7)',  // Sky blue
      'rgba(168, 85, 247, 0.7)'   // Purple
    ];
    
    const borderColors = [
      'rgb(16, 185, 129)',
      'rgb(239, 68, 68)',
      'rgb(245, 158, 11)',
      'rgb(99, 102, 241)',
      'rgb(14, 165, 233)',
      'rgb(168, 85, 247)'
    ];
    
    // Map feedback categories to user-friendly labels
    const categoryLabels: Record<string, string> = {
      'helpful': 'Helpful',
      'not_helpful': 'Not Helpful',
      'correct': 'Correct',
      'incorrect': 'Incorrect',
      'other': 'Other'
    };
    
    return {
      labels: data.map(item => categoryLabels[item.category] || item.category),
      datasets: [
        {
          data: data.map(item => item.count),
          backgroundColor: data.map((_, index) => backgroundColors[index % backgroundColors.length]),
          borderColor: data.map((_, index) => borderColors[index % borderColors.length]),
          borderWidth: 1
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
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  return (
    <div className={`h-80 ${className}`}>
      {chartData ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <div className="flex items-center justify-center h-full border border-dashed rounded-md">
          <p className="text-muted-foreground">No feedback category data available</p>
        </div>
      )}
    </div>
  );
}