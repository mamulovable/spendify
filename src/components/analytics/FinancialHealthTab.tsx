import { Card } from "@/components/ui/card";
import { MetricsCards } from "@/components/analytics/shared/MetricsCards";
import { HealthScoreGauge } from "@/components/analytics/health/HealthScoreGauge";
import { ImprovementRecommendations } from "@/components/analytics/health/ImprovementRecommendations";
import { AIInsightsPanel } from "@/components/analytics/shared/AIInsightsPanel";
import { ExportButton } from "@/components/analytics/shared/ExportButton";
import { useFinancialHealth } from "@/hooks/useFinancialHealth";
import { Loader2, BarChart3, LineChart } from "lucide-react";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

export const FinancialHealthTab = () => {
  const { 
    financialHealth, 
    metrics, 
    insights, 
    isLoading 
  } = useFinancialHealth();
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Analyzing your financial health...</p>
      </div>
    );
  }
  
  if (!financialHealth) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No financial data available for analysis.</p>
      </div>
    );
  }
  
  // Format historical score data for chart
  const historicalScoreData = financialHealth.historicalScores.map(score => ({
    date: new Date(score.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
    score: score.score
  }));
  
  // Format goal progress data for chart
  const goalProgressData = financialHealth.goalProgress.map(goal => ({
    name: goal.goalName,
    current: goal.currentAmount,
    target: goal.targetAmount,
    progress: goal.progressPercentage
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Financial Health Score
          </h2>
          <p className="text-muted-foreground">
            Overall assessment of your financial wellness
          </p>
        </div>
        <ExportButton 
          data={[
            { 
              overallScore: financialHealth.overallScore,
              savingsRate: financialHealth.savingsRate,
              debtToIncome: financialHealth.debtToIncome,
              emergencyFundMonths: financialHealth.emergencyFundMonths
            }
          ]} 
          filename="financial-health-score" 
        />
      </div>
      
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4 text-center">Health Score</h3>
          <div className="flex justify-center">
            <HealthScoreGauge score={financialHealth.overallScore} />
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Score History</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={historicalScoreData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <AIInsightsPanel 
        insights={insights} 
        title="Financial Health Insights & Recommendations"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Improvement Recommendations</h3>
          <ImprovementRecommendations recommendations={financialHealth.recommendations} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Financial Goal Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={goalProgressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" name="Current Amount" fill="#8884d8" />
                <Bar dataKey="target" name="Target Amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {financialHealth.goalProgress.map((goal, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{goal.goalName}</p>
                  <p className="text-sm text-muted-foreground">
                    ₦{goal.currentAmount.toLocaleString()} of ₦{goal.targetAmount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{goal.progressPercentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};