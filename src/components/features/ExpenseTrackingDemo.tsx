import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft, DollarSign, Calendar, Tag } from 'lucide-react';

// Sample data for the expense categories
const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', color: '#4f46e5' },
  { id: 'housing', name: 'Housing', color: '#0ea5e9' },
  { id: 'transportation', name: 'Transportation', color: '#10b981' },
  { id: 'entertainment', name: 'Entertainment', color: '#f59e0b' },
  { id: 'shopping', name: 'Shopping', color: '#ec4899' },
  { id: 'utilities', name: 'Utilities', color: '#8b5cf6' },
];

// Sample expense data for each category
const EXPENSE_DATA = {
  food: [
    { amount: 45.75, date: '2025-07-15', description: 'Grocery shopping', icon: 'shopping-cart' },
    { amount: 28.50, date: '2025-07-14', description: 'Restaurant dinner', icon: 'utensils' },
    { amount: 12.99, date: '2025-07-12', description: 'Coffee shop', icon: 'coffee' },
    { amount: 32.40, date: '2025-07-10', description: 'Food delivery', icon: 'truck' },
    { amount: 65.20, date: '2025-07-08', description: 'Weekly groceries', icon: 'shopping-basket' },
  ],
  housing: [
    { amount: 1200.00, date: '2025-07-01', description: 'Monthly rent', icon: 'home' },
    { amount: 85.50, date: '2025-07-05', description: 'Electricity bill', icon: 'bolt' },
    { amount: 45.00, date: '2025-07-06', description: 'Water bill', icon: 'water' },
    { amount: 65.75, date: '2025-07-07', description: 'Internet service', icon: 'wifi' },
  ],
  transportation: [
    { amount: 45.00, date: '2025-07-14', description: 'Gas refill', icon: 'gas-pump' },
    { amount: 25.00, date: '2025-07-10', description: 'Uber ride', icon: 'car' },
    { amount: 120.00, date: '2025-07-05', description: 'Car maintenance', icon: 'tools' },
    { amount: 35.50, date: '2025-07-02', description: 'Public transit pass', icon: 'bus' },
  ],
  entertainment: [
    { amount: 15.99, date: '2025-07-15', description: 'Movie streaming', icon: 'film' },
    { amount: 60.00, date: '2025-07-09', description: 'Concert tickets', icon: 'music' },
    { amount: 25.50, date: '2025-07-05', description: 'Video game', icon: 'gamepad' },
  ],
  shopping: [
    { amount: 85.75, date: '2025-07-12', description: 'Clothing purchase', icon: 'tshirt' },
    { amount: 120.00, date: '2025-07-08', description: 'Electronics', icon: 'laptop' },
    { amount: 45.50, date: '2025-07-03', description: 'Home goods', icon: 'home' },
  ],
  utilities: [
    { amount: 95.00, date: '2025-07-10', description: 'Electricity bill', icon: 'bolt' },
    { amount: 45.00, date: '2025-07-10', description: 'Water bill', icon: 'water' },
    { amount: 75.00, date: '2025-07-05', description: 'Internet service', icon: 'wifi' },
    { amount: 35.00, date: '2025-07-03', description: 'Phone bill', icon: 'phone' },
  ],
};

// Calculate total for each category
const CATEGORY_TOTALS = Object.entries(EXPENSE_DATA).reduce((acc, [category, expenses]) => {
  acc[category] = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return acc;
}, {} as Record<string, number>);

// Prepare data for pie chart
const getPieChartData = () => {
  return EXPENSE_CATEGORIES.map(category => ({
    id: category.id,
    name: category.name,
    value: CATEGORY_TOTALS[category.id] || 0,
    color: category.color,
  }));
};

/**
 * ExpenseTrackingDemo Component
 * 
 * An interactive visualization for expense tracking functionality
 * that allows users to explore different expense categories and see
 * transaction details.
 */
const ExpenseTrackingDemo = () => {
  const [activeCategory, setActiveCategory] = useState('food');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Animation effect when changing categories
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  // Get the current category data
  const currentCategory = EXPENSE_CATEGORIES.find(cat => cat.id === activeCategory) || EXPENSE_CATEGORIES[0];
  const currentExpenses = EXPENSE_DATA[activeCategory as keyof typeof EXPENSE_DATA] || [];
  const pieData = getPieChartData();
  
  // Navigate to previous/next category
  const navigateCategory = (direction: 'prev' | 'next') => {
    const currentIndex = EXPENSE_CATEGORIES.findIndex(cat => cat.id === activeCategory);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? EXPENSE_CATEGORIES.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= EXPENSE_CATEGORIES.length - 1 ? 0 : currentIndex + 1;
    }
    
    setActiveCategory(EXPENSE_CATEGORIES[newIndex].id);
  };

  return (
    <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        <h3 className="text-xl font-medium mb-4">Expense Tracking</h3>
        
        {/* Category Selector */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigateCategory('prev')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 mx-4">
            <div 
              className={cn(
                "text-center font-medium transition-all duration-300",
                isAnimating ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
              )}
              style={{ color: currentCategory.color }}
            >
              {currentCategory.name}
            </div>
            <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${((EXPENSE_CATEGORIES.findIndex(cat => cat.id === activeCategory) + 1) / EXPENSE_CATEGORIES.length) * 100}%`,
                  backgroundColor: currentCategory.color 
                }}
              />
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigateCategory('next')}
            className="h-8 w-8"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Expense Breakdown Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={500}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {pieData.map((entry) => (
                    <Cell 
                      key={entry.id} 
                      fill={entry.color} 
                      stroke={entry.id === activeCategory ? '#fff' : 'transparent'}
                      strokeWidth={entry.id === activeCategory ? 2 : 0}
                      className="transition-all duration-300"
                      style={{ 
                        filter: entry.id === activeCategory ? 'drop-shadow(0 0 4px rgba(0,0,0,0.2))' : 'none',
                        transform: entry.id === activeCategory ? 'scale(1.05)' : 'scale(1)',
                        transformOrigin: 'center',
                        opacity: entry.id === activeCategory ? 1 : 0.7,
                      }}
                    />
                  ))}
                </Pie>
                {showTooltip && <Tooltip />}
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Category Breakdown</div>
              {EXPENSE_CATEGORIES.map((category) => (
                <div 
                  key={category.id}
                  className={cn(
                    "flex items-center justify-between py-1 px-2 rounded cursor-pointer transition-all",
                    activeCategory === category.id ? "bg-muted" : "hover:bg-muted/50"
                  )}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-center">
                    <div 
                      className="h-3 w-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${CATEGORY_TOTALS[category.id]?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Transaction Timeline */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Recent Transactions</h4>
            <span 
              className="text-xs px-2 py-1 rounded-full" 
              style={{ 
                backgroundColor: `${currentCategory.color}20`, 
                color: currentCategory.color 
              }}
            >
              {currentCategory.name}
            </span>
          </div>
          
          <div 
            className={cn(
              "space-y-2 transition-all duration-300",
              isAnimating ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
            )}
          >
            {currentExpenses.slice(0, 3).map((expense, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center">
                  <div 
                    className="h-8 w-8 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${currentCategory.color}20` }}
                  >
                    <DollarSign 
                      className="h-4 w-4" 
                      style={{ color: currentCategory.color }} 
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{expense.description}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {expense.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${expense.amount.toFixed(2)}</div>
                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <Tag className="h-3 w-3 mr-1" />
                    {currentCategory.name}
                  </div>
                </div>
              </div>
            ))}
            
            {currentExpenses.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all {currentExpenses.length} transactions
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseTrackingDemo;