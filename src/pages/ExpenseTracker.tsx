import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { defaultCategories } from '../lib/defaultCategories';
import SummaryCards from '../components/SummaryCards';
import SpendingTrendsChart from '../components/SpendingTrendsChart';
import CategoryBreakdownChart from '../components/CategoryBreakdownChart';
import RecentTransactions from '../components/RecentTransactions';
import ExpenseList from '../components/ExpenseList';
import AddExpenseModal from '../components/AddExpenseModal';
import CategoryManager from '../components/CategoryManager';
import { v4 as uuidv4 } from 'uuid';

// Expense and Category types
interface Expense {
  id: string;
  user_id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  receipt?: string;
}
interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
}


const ExpenseTracker: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses, categories, and budget from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('You must be logged in to view expenses');
          setLoading(false);
          return;
        }
        
        // Fetch expenses
        const { data: expensesData, error: expErr } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        if (expErr) throw expErr;
        setExpenses(expensesData || []);

        // Fetch categories
        const { data: categoriesData, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);
        if (catErr) throw catErr;
        
        // If no categories found, create default ones
        if (!categoriesData || categoriesData.length === 0) {
          // Prepare categories with user_id
          const categoriesToInsert = defaultCategories.map(cat => ({
            ...cat,
            user_id: user.id
          }));
          
          // Insert default categories
          const { data: newCategories, error: insertErr } = await supabase
            .from('categories')
            .insert(categoriesToInsert)
            .select();
            
          if (insertErr) throw insertErr;
          setCategories(newCategories || []);
        } else {
          setCategories(categoriesData);
        }

        // Fetch budgets (simple: sum all for now)
        const { data: budgetsData, error: budErr } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id);
        if (budErr) throw budErr;
        setMonthlyBudget(budgetsData && budgetsData.length > 0 ? budgetsData.reduce((acc, b) => acc + (b.amount || 0), 0) : 0);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate monthly spending
  const monthlySpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Filtered expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? exp.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  // Mock data for charts
  const trendsData = [
    { month: 'Jan', expenses: 1200, income: 2000 },
    { month: 'Feb', expenses: 1500, income: 2100 },
    { month: 'Mar', expenses: 1700, income: 2200 },
    { month: 'Apr', expenses: 2000, income: 2300 },
    { month: 'May', expenses: monthlySpending, income: 2400 },
    { month: 'Jun', expenses: 0, income: 0 },
  ];
  const categoryData = categories.map((cat) => ({
    category: cat.name,
    amount: expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0),
    color: cat.color,
  }));

  const handleAddExpense = async (expense: { description: string; category: string; amount: number; date: string; receipt?: string }) => {
    setLoading(true);
    setError(null);
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to add an expense');
      }

      const { data, error: insertErr } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select();
      if (insertErr) throw insertErr;
      setExpenses([...(data || []), ...expenses]);
    } catch (err: any) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditExpense = (expense: Expense) => {
    setEditExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleSaveEditExpense = async (updated: Expense) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateErr } = await supabase
        .from('expenses')
        .update(updated)
        .eq('id', updated.id)
        .select();
      if (updateErr) throw updateErr;
      setExpenses(expenses.map(e => e.id === updated.id ? (data ? data[0] : updated) : e));
      setIsEditModalOpen(false);
      setEditExpense(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: delErr } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      if (delErr) throw delErr;
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>
      <SummaryCards monthlySpending={monthlySpending} monthlyBudget={monthlyBudget} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <SpendingTrendsChart data={[]} />
        <CategoryBreakdownChart data={categoryData} />
      </div>
      <div className="flex gap-2 mb-4">
        <input
          className="border px-2 py-1 rounded w-48"
          placeholder="Search expenses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border px-2 py-1 rounded"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-center text-red-500 py-2">{error}</div>}
      {!loading && !error && (
        <>
          <RecentTransactions transactions={filteredExpenses as any} />
          <ExpenseList expenses={filteredExpenses as any} onEdit={handleStartEditExpense} onDelete={handleDeleteExpense} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setIsModalOpen(true)}>Add Expense</button>
          <AddExpenseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleAddExpense}
            categories={categories as any}
          />
          {isEditModalOpen && editExpense && (
            <AddExpenseModal
              isOpen={isEditModalOpen}
              onClose={() => { setIsEditModalOpen(false); setEditExpense(null); }}
              onSave={handleSaveEditExpense}
              categories={categories as any}
              initialData={editExpense}
            />
          )}
          <CategoryManager
            categories={categories}
            onAdd={async cat => {
              setLoading(true);
              setError(null);
              try {
                // Get current user ID
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                  throw new Error('You must be logged in to add a category');
                }
                
                const { data, error: addErr } = await supabase
                  .from('categories')
                  .insert([{ ...cat, user_id: user.id }])
                  .select();
                if (addErr) throw addErr;
                setCategories([...(categories || []), ...(data || [])]);
              } catch (err: any) {
                setError(err.message || 'Failed to add category');
              } finally {
                setLoading(false);
              }
            }}
            onEdit={async cat => {
              setLoading(true);
              setError(null);
              try {
                const { data, error: editErr } = await supabase
                  .from('categories')
                  .update(cat)
                  .eq('id', cat.id)
                  .select();
                if (editErr) throw editErr;
                setCategories(categories.map(c => c.id === cat.id ? (data ? data[0] : cat) : c));
              } catch (err: any) {
                setError(err.message || 'Failed to update category');
              } finally {
                setLoading(false);
              }
            }}
            onDelete={async id => {
              setLoading(true);
              setError(null);
              try {
                const { error: delErr } = await supabase
                  .from('categories')
                  .delete()
                  .eq('id', id);
                if (delErr) throw delErr;
                setCategories(categories.filter(c => c.id !== id));
              } catch (err: any) {
                setError(err.message || 'Failed to delete category');
              } finally {
                setLoading(false);
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default ExpenseTracker;
