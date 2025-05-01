import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Slider } from '@/components/ui/slider'; // Make sure you have a Slider component or use a native input[type=range]
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

interface BudgetFormData {
  name: string;
  amount: number;
  period: string;
  start_date: string;
  end_date: string;
  categories: {
    id?: string;
    category: string;
    allocated_amount: number;
  }[];
}

const defaultCategories = [
  'Housing',
  'Transportation',
  'Food & Groceries',
  'Utilities',
  'Healthcare',
  'Insurance',
  'Entertainment',
  'Shopping',
  'Education',
  'Savings',
  'Investments',
  'Debt Payments',
  'Personal Care',
  'Travel',
  'Gifts & Donations',
  'Other'
];

export default function BudgetForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const isEditing = id !== 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    amount: 0,
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    categories: [{ category: '', allocated_amount: 0 }]
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch available categories from transactions
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('category')
        .eq('type', 'expense');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      // Extract unique categories and combine with default categories
      const transactionCategories = [...new Set(data.map(item => item.category))];
      const allCategories = [...new Set([...defaultCategories, ...transactionCategories])];
      setAvailableCategories(allCategories);
    };
    
    fetchCategories();
    
    // If editing, fetch existing budget data
    if (isEditing && id) {
      fetchBudget(id);
    } else {
      setFetchingData(false);
    }
  }, [id, isEditing]);
  
  const fetchBudget = async (budgetId: string) => {
    try {
      // Fetch budget details
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();
      
      if (budgetError) throw budgetError;
      
      // Fetch budget categories
      const { data: categories, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', budgetId);
      
      if (categoriesError) throw categoriesError;
      
      setFormData({
        name: budget.name,
        amount: budget.amount,
        period: budget.period,
        start_date: budget.start_date,
        end_date: budget.end_date || '',
        categories: categories.map(cat => ({
          id: cat.id,
          category: cat.category,
          allocated_amount: cat.allocated_amount
        }))
      });
    } catch (error) {
      console.error('Error fetching budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to load budget data. Please try again.',
        variant: 'destructive',
      });
      navigate('/dashboard/budgets');
    } finally {
      setFetchingData(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePeriodChange = (value: string) => {
    setFormData(prev => ({ ...prev, period: value }));
  };
  
  const handleCategoryChange = (index: number, field: string, value: string | number) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };
  
  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, { category: '', allocated_amount: 0 }]
    }));
  };
  
  const removeCategory = (index: number) => {
    if (formData.categories.length <= 1) return;
    
    const updatedCategories = [...formData.categories];
    updatedCategories.splice(index, 1);
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!user) {
        throw new Error("You must be logged in to create a budget");
      }
      // Validate categories
      if (!formData.categories.length) {
        throw new Error("Please add at least one category");
      }
      
      // Check for empty category details
      const hasEmptyFields = formData.categories.some(
        cat => !cat.category || !cat.allocated_amount
      );
      if (hasEmptyFields) {
        throw new Error("Please fill all category details");
      }
      
      // Calculate total allocated amount
      const totalAllocated = formData.categories.reduce(
        (sum, cat) => sum + Number(cat.allocated_amount),
        0
      );
      
      // Allow for small floating point differences (within 0.01)
      // const difference = Math.abs(totalAllocated - Number(formData.amount));
      // if (difference > 0.01) {
      //   throw new Error(
      //     `Total allocated amount (${formatCurrency(totalAllocated)}) doesn't match budget amount (${formatCurrency(Number(formData.amount))})`
      //   );
      // }

      // Save to Supabase
      if (isEditing && id) {
        // Update existing budget
        const { error: budgetError } = await supabase
          .from('budgets')
          .update({
            name: formData.name,
            amount: formData.amount,
            period: formData.period,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            user_id: user.id  // Add user_id here
          })
          .eq('id', id);

        if (budgetError) throw budgetError;

        // Update categories
        const { error: categoriesError } = await supabase
          .from('budget_categories')
          .upsert(
            formData.categories.map(cat => ({
              id: cat.id,
              budget_id: id,
              category: cat.category,
              allocated_amount: Number(cat.allocated_amount)
            }))
          );

        if (categoriesError) throw categoriesError;
      } else {
        // Create new budget
        const { data: newBudget, error: budgetError } = await supabase
          .from('budgets')
          .insert({
            name: formData.name,
            amount: formData.amount,
            period: formData.period,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            user_id: user.id  // Add user_id here
          })
          .select()
          .single();

        if (budgetError) throw budgetError;

        // Create categories
        const { error: categoriesError } = await supabase
          .from('budget_categories')
          .insert(
            formData.categories.map(cat => ({
              budget_id: newBudget.id,
              category: cat.category,
              allocated_amount: Number(cat.allocated_amount)
            }))
          );

        if (categoriesError) throw categoriesError;
      }

      toast({
        title: `Budget ${isEditing ? 'updated' : 'created'} successfully`,
        variant: "default",
      });
      
      navigate('/dashboard/budgets');
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save budget",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add state for savings goal
  const [savingsGoal, setSavingsGoal] = useState(0);
  
  // Calculate total allocated and allocation percentage
  const totalAllocated = formData.categories.reduce(
    (sum, cat) => sum + Number(cat.allocated_amount),
    0
  );
  const allocationPercent = formData.amount > 0 ? (totalAllocated / Number(formData.amount)) * 100 : 0;
  
  // Example recommended allocation (replace with your logic if needed)
  const recommended = [
    { label: "50% - Needs", desc: "Housing, utilities, groceries, transportation", amount: formData.amount * 0.5, color: "text-blue-600" },
    { label: "30% - Wants", desc: "Entertainment, dining out, hobbies, subscriptions", amount: formData.amount * 0.3, color: "text-green-600" },
    { label: "20% - Savings", desc: "Emergency fund, retirement, investments", amount: formData.amount * 0.2, color: "text-purple-600" },
  ];
  
  if (fetchingData) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <p>Loading budget data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? 'Edit Budget' : 'Create New Budget'}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="flex-1 max-w-sm space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Budget Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  className="mb-2"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  placeholder="Enter monthly budget allocation"
                />
                <div className="mb-2">
                  <div className="font-medium">Monthly Savings Goal</div>
                  <Input
                    type="number"
                    value={savingsGoal}
                    onChange={e => setSavingsGoal(Number(e.target.value))}
                    placeholder="Enter savings goal"
                  />
                  {savingsGoal > formData.amount - totalAllocated && (
                    <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Your savings goal exceeds your available budget after expenses
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Budget Allocation</span>
                    <span className={allocationPercent === 100 ? "text-green-600" : allocationPercent > 100 ? "text-red-600" : ""}>
                      {Math.round(allocationPercent)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className={`h-2 rounded ${allocationPercent > 100 ? "bg-red-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(allocationPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Budgeting Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2"><Info className="w-4 h-4 text-yellow-500 mt-0.5" /> The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and 20% on savings</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Aim to save at least 10-15% of your monthly income</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5" /> Housing costs should ideally be less than 30% of your budget</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-[2] space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Adjust the percentage or amount for each category. Total must equal 100%.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.categories.map((category, idx) => {
                    const percent = formData.amount > 0 ? (category.allocated_amount / formData.amount) * 100 : 0;
                    // Filter out categories already selected in other rows
                    const usedCategories = formData.categories.map((cat, i) => i !== idx ? cat.category : null);
                    const selectableCategories = availableCategories.filter(cat => !usedCategories.includes(cat));
                    return (
                      <div key={idx} className="border rounded p-4 space-y-2 bg-white">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">
                            <Select
                              value={category.category}
                              onValueChange={value => handleCategoryChange(idx, 'category', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectableCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.1}
                            className="w-16 border rounded px-2 py-1 text-right"
                            value={percent.toFixed(1)}
                            onChange={e => {
                              const newPercent = Number(e.target.value);
                              const newAmount = (formData.amount * newPercent) / 100;
                              handleCategoryChange(idx, 'allocated_amount', newAmount);
                            }}
                          />%
                        </div>
                        <Slider
                          min={0}
                          max={formData.amount}
                          step={1}
                          value={[category.allocated_amount]}
                          onValueChange={([val]) => handleCategoryChange(idx, 'allocated_amount', val)}
                        />
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="font-medium">{formatCurrency(category.allocated_amount)}</span>
                          <span className="text-gray-500">{percent.toFixed(1)}% of total budget</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button type="button" variant="outline" className="mt-4" onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
              </CardContent>
            </Card>

            {/* Recommended Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Allocation</CardTitle>
                <CardDescription>Based on financial best practices and your spending patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommended.map((rec, i) => (
                    <div key={i} className="rounded p-4 bg-gray-100">
                      <div className={`font-semibold mb-1 ${rec.color}`}>{rec.label}</div>
                      <div className="text-xs mb-2">{rec.desc}</div>
                      <div className={`font-bold text-lg ${rec.color}`}>{formatCurrency(rec.amount)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Save/Cancel Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/budgets')}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}