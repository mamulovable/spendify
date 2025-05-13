import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tag, Plus, Edit, Search, RefreshCcw, MoveRight, CircleDollarSign, TrendingUp } from 'lucide-react';
import { useFinancialData, Transaction, Category } from '@/hooks/useFinancialData';
import { useToast } from '@/hooks/useToast';

interface CategoryManagerProps {
  transactions: {
    data: Transaction[];
    total: number;
    categorized: number;
  };
  categories: Category[];
}

export default function CategoryManager({ transactions, categories }: CategoryManagerProps) {
  const { updateTransactionCategory, createCategory } = useFinancialData();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    color: '#2196F3',
    icon: 'tag',
    is_income: false,
    is_custom: true,
    budget_amount: null,
  });
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');

  // Filter transactions by search query
  const filteredTransactions = transactions.data.filter(transaction => 
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
    color: category.color,
    icon: category.icon,
    is_income: category.is_income,
  }));

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast({
        title: "Category name required",
        description: "Please provide a name for the new category",
        variant: "destructive",
      });
      return;
    }

    const categoryId = await createCategory({
      name: newCategory.name,
      color: newCategory.color || '#2196F3',
      icon: newCategory.icon || 'tag',
      is_income: newCategory.is_income || false,
      is_custom: true,
      budget_amount: newCategory.budget_amount || null,
    });

    if (categoryId) {
      toast({
        title: "Category created",
        description: `New category "${newCategory.name}" has been created`,
      });
      setCategoryDialogOpen(false);
      setNewCategory({
        name: '',
        color: '#2196F3',
        icon: 'tag',
        is_income: false,
        is_custom: true,
        budget_amount: null,
      });
    }
  };

  const handleUpdateCategory = async (transactionId: string, categoryId: string) => {
    await updateTransactionCategory(transactionId, categoryId);
    toast({
      title: "Category updated",
      description: "Transaction has been categorized successfully",
    });
  };

  const handleBulkUpdate = async () => {
    if (!bulkCategoryId || selectedTransactions.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select both transactions and a category",
        variant: "destructive",
      });
      return;
    }

    // Process all selected transactions
    const selectedCategory = categories.find(c => c.id === bulkCategoryId);
    const promises = selectedTransactions.map(id => 
      updateTransactionCategory(id, bulkCategoryId)
    );

    await Promise.all(promises);
    
    toast({
      title: "Bulk update complete",
      description: `${selectedTransactions.length} transactions categorized as "${selectedCategory?.name}"`,
    });
    
    setSelectedTransactions([]);
    setBulkCategoryId('');
    setBulkEditMode(false);
  };

  const handleToggleTransaction = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(tId => tId !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(t => t.id));
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Function to get icon for category display
  const renderCategoryIcon = (categoryId: string | null) => {
    if (!categoryId) return <Tag className="h-4 w-4" />;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return <Tag className="h-4 w-4" />;
    
    // Choose icon based on category.icon
    switch (category.icon) {
      case 'dollar':
        return <CircleDollarSign className="h-4 w-4" style={{ color: category.color }} />;
      case 'trending-up':
        return <TrendingUp className="h-4 w-4" style={{ color: category.color }} />;
      default:
        return <Tag className="h-4 w-4" style={{ color: category.color }} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your transactions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g., Entertainment"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex gap-2">
                    {['#2196F3', '#4CAF50', '#F44336', '#FF9800', '#9C27B0', '#607D8B'].map(color => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer ${newCategory.color === color ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory({...newCategory, color})}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newCategory.is_income ? 'income' : 'expense'}
                    onValueChange={(value) => setNewCategory({...newCategory, is_income: value === 'income'})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget">Budget Amount (Optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newCategory.budget_amount || ''}
                    onChange={(e) => setNewCategory({...newCategory, budget_amount: e.target.value ? parseFloat(e.target.value) : null})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCategory}>Create Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {bulkEditMode ? (
            <>
              <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    size="sm"
                    disabled={!bulkCategoryId || selectedTransactions.length === 0}
                  >
                    Apply to {selectedTransactions.length} items
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will update the category for {selectedTransactions.length} transactions. 
                      Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkUpdate}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setBulkEditMode(false);
                  setSelectedTransactions([]);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => setBulkEditMode(true)}>
              Bulk Edit
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Transaction Categories</CardTitle>
          <CardDescription>
            Categorize your transactions for better insights
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {bulkEditMode && (
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4"
                      checked={selectedTransactions.length > 0 && selectedTransactions.length === filteredTransactions.length}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={bulkEditMode ? 6 : 5} className="text-center py-4 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className={transaction.is_anomaly ? 'bg-red-50' : ''}>
                    {bulkEditMode && (
                      <TableCell>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4"
                          checked={selectedTransactions.includes(transaction.id)}
                          onChange={() => handleToggleTransaction(transaction.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className={transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {renderCategoryIcon(transaction.category_id)}
                        <span className={transaction.category_id ? '' : 'text-muted-foreground italic'}>
                          {getCategoryName(transaction.category_id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select 
                        defaultValue={transaction.category_id || ''}
                        onValueChange={(value) => handleUpdateCategory(transaction.id, value)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue placeholder="Categorize" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: option.color }} />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTransactions.length} of {transactions.total} transactions
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Badge variant="outline">{transactions.categorized} categorized</Badge>
            <MoveRight className="h-4 w-4" />
            <Badge variant="outline">{transactions.total - transactions.categorized} uncategorized</Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
