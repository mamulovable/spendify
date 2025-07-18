import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

// Initial budget allocation data
const INITIAL_BUDGET_DATA = [
  { name: 'Housing', value: 35, color: '#4f46e5', icon: 'home' },
  { name: 'Food', value: 20, color: '#0ea5e9', icon: 'utensils' },
  { name: 'Transportation', value: 15, color: '#10b981', icon: 'car' },
  { name: 'Utilities', value: 10, color: '#f59e0b', icon: 'bolt' },
  { name: 'Entertainment', value: 10, color: '#ec4899', icon: 'film' },
  { name: 'Savings', value: 10, color: '#8b5cf6', icon: 'piggy-bank' },
];

// Budget insights based on allocation percentages
const getBudgetInsights = (budgetData: typeof INITIAL_BUDGET_DATA) => {
  const insights = [];
  
  // Housing insights
  const housingPercent = budgetData.find(item => item.name === 'Housing')?.value || 0;
  if (housingPercent > 40) {
    insights.push({
      type: 'warning',
      message: 'Your housing budget exceeds the recommended 30-35% of income.',
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />
    });
  } else if (housingPercent < 25) {
    insights.push({
      type: 'success',
      message: 'Your housing costs are well-optimized, allowing more for other categories.',
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />
    });
  }
  
  // Savings insights
  const savingsPercent = budgetData.find(item => item.name === 'Savings')?.value || 0;
  if (savingsPercent < 10) {
    insights.push({
      type: 'warning',
      message: 'Consider increasing your savings to at least 10-15% of income.',
      icon: <TrendingDown className="h-4 w-4 text-amber-500" />
    });
  } else if (savingsPercent >= 15) {
    insights.push({
      type: 'success',
      message: 'Great job! Your savings rate will help build financial security.',
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />
    });
  }
  
  // Food insights
  const foodPercent = budgetData.find(item => item.name === 'Food')?.value || 0;
  if (foodPercent > 25) {
    insights.push({
      type: 'warning',
      message: 'Your food budget is higher than average. Consider meal planning to reduce costs.',
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />
    });
  }
  
  // Entertainment insights
  const entertainmentPercent = budgetData.find(item => item.name === 'Entertainment')?.value || 0;
  if (entertainmentPercent > 15) {
    insights.push({
      type: 'warning',
      message: 'Your entertainment spending is above recommended levels.',
      icon: <AlertCircle className="h-4 w-4 text-amber-500" />
    });
  }
  
  // General insight if none of the above apply
  if (insights.length === 0) {
    insights.push({
      type: 'success',
      message: 'Your budget allocation looks well-balanced across categories.',
      icon: <CheckCircle className="h-4 w-4 text-emerald-500" />
    });
  }
  
  return insights;
};

/**
 * BudgetManagementDemo Component
 * 
 * An interactive visualization for budget management functionality
 * that allows users to adjust budget allocations and see insights.
 */
const BudgetManagementDemo = () => {
  const [budgetData, setBudgetData] = useState(INITIAL_BUDGET_DATA);
  const [totalBudget, setTotalBudget] = useState(2500); // Monthly budget in dollars
  const [insights, setInsights] = useState(getBudgetInsights(INITIAL_BUDGET_DATA));
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Update insights when budget data changes
  useEffect(() => {
    setInsights(getBudgetInsights(budgetData));
  }, [budgetData]);
  
  // Handle budget category adjustment
  const handleBudgetChange = (index: number, newValue: number) => {
    // Calculate the difference between new and old value
    const oldValue = budgetData[index].value;
    const difference = newValue - oldValue;
    
    // Don't allow values less than 5%
    if (newValue < 5) return;
    
    // Create a copy of the budget data
    const newBudgetData = [...budgetData];
    
    // Update the selected category
    newBudgetData[index].value = newValue;
    
    // Adjust other categories proportionally to maintain 100% total
    const otherCategories = newBudgetData.filter((_, i) => i !== index);
    const totalOtherValues = otherCategories.reduce((sum, item) => sum + item.value, 0);
    
    otherCategories.forEach((item, i) => {
      const otherIndex = i >= index ? i + 1 : i;
      const adjustmentRatio = item.value / totalOtherValues;
      newBudgetData[otherIndex].value = Math.max(5, item.value - (difference * adjustmentRatio));
    });
    
    // Normalize to ensure total is exactly 100%
    const total = newBudgetData.reduce((sum, item) => sum + item.value, 0);
    newBudgetData.forEach((item) => {
      item.value = Math.round((item.value / total) * 100);
    });
    
    // Ensure the total is exactly 100%
    const finalTotal = newBudgetData.reduce((sum, item) => sum + item.value, 0);
    if (finalTotal !== 100) {
      const diff = 100 - finalTotal;
      newBudgetData[0].value += diff;
    }
    
    // Animate the change
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    // Update state
    setBudgetData(newBudgetData);
  };
  
  // Reset budget to initial values
  const resetBudget = () => {
    setIsAnimating(true);
    setBudgetData(INITIAL_BUDGET_DATA);
    setTimeout(() => setIsAnimating(false), 500);
  };
  
  // Calculate dollar amounts based on percentages
  const getDollarAmount = (percentage: number) => {
    return Math.round((percentage / 100) * totalBudget);
  };

  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium">Budget Management</h3>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1"
            onClick={resetBudget}
          >
            <RefreshCw className="h-3 w-3" />
            Reset
          </Button>
        </div>
        
        {/* Budget Overview */}
        <div className="flex items-center justify-between mb-6 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">Monthly Budget</div>
              <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            </div>
          </div>
          <div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Lifetime Deal
            </Badge>
          </div>
        </div>
        
        {/* Budget Allocation Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={500}
                  className={cn(isAnimating && "animate-pulse")}
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value) => {
                    const item = budgetData.find(d => d.name === value);
                    return <span className="text-xs">{value}: {item?.value}%</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Budget Insights */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium mb-2">Budget Insights</h4>
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={cn(
                  "p-3 rounded-lg border flex items-start gap-2",
                  insight.type === 'warning' ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
                )}
              >
                {insight.icon}
                <span className="text-xs">{insight.message}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Budget Adjustment Sliders */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Adjust Your Budget</h4>
          {budgetData.map((category, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{category.value}%</span>
                  <span className="text-xs text-muted-foreground">${getDollarAmount(category.value)}</span>
                </div>
              </div>
              <Slider
                value={[category.value]}
                min={5}
                max={50}
                step={1}
                onValueChange={(value) => handleBudgetChange(index, value[0])}
                className="py-1"
              />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default BudgetManagementDemo;