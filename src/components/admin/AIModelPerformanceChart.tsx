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
import { AIModelVersion } from '@/types/aiFeedback';

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

interface AIModelPerformanceChartProps {
  modelVersions: AIModelVersion[];
  className?: string;
}

export function AIModelPerformanceChart({ modelVersions, className }: AIModelPerformanceChartProps) {
  // Process data for chart
  const prepareChartData = () => {
    if (!modelVersions || modelVersions.length === 0) return null;
    
    // Sort by deployed date
    const sortedVersions = [...modelVersions].sort((a, b) => 
      new Date(a.deployed_at).getTime() - new Date(b.deployed_at).getTime()
    );
    
    return {
      labels: sortedVersions.map(model => `${model.version_name}`),
      datasets: [
        {
          label: 'Accuracy',
          data: sortedVersions.map(model => model.accuracy_score || 0),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Precision',
          data: sortedVersions.map(model => model.precision_score || 0),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Recall',
          data: sortedVersions.map(model => model.recall_score || 0),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          fill: false
        },
        {
          label: 'F1 Score',
          data: sortedVersions.map(model => model.f1_score || 0),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.3,
          fill: false
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
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${(value * 100).toFixed(1)}%`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: function(value: any) {
            return `${(value * 100).toFixed(0)}%`;
          }
        },
        title: {
          display: true,
          text: 'Score'
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
          <p className="text-muted-foreground">No model performance data available</p>
        </div>
      )}
    </div>
  );
}