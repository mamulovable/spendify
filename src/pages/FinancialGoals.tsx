import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { financialGoalsService, GoalSuggestion } from '@/services/financialGoalsService';
import { FinancialGoal } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Calendar, Target, TrendingUp, History, Lightbulb } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancialGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newGoal, setNewGoal] = useState<{
    name: string;
    target_amount: string;
    deadline: string;
    type: 'savings' | 'budget' | 'emergency' | 'retirement';
    category_id: string;
    notes: string;
  }>({
    name: '',
    target_amount: '',
    deadline: '',
    type: 'savings',
    category_id: '',
    notes: ''
  });
  const [newMilestone, setNewMilestone] = useState<{
    amount: string;
    target_date: string;
    description: string;
  }>({
    amount: '',
    target_date: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchCategories();
      fetchSuggestions();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const data = await financialGoalsService.getGoals();
      console.log('Fetched goals:', data);
      setGoals(data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch goals',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await financialGoalsService.getGoalCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const data = await financialGoalsService.getGoalSuggestions();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const goal = await financialGoalsService.addGoal({
        ...newGoal,
        target_amount: parseFloat(newGoal.target_amount),
        current_amount: 0,
        progress_percentage: 0,
        status: 'in_progress'
      });
      console.log('Added goal:', goal);
      setGoals([goal, ...goals]);
      setNewGoal({
        name: '',
        target_amount: '',
        deadline: '',
        type: 'savings',
        category_id: '',
        notes: ''
      });
      toast({
        title: 'Success',
        description: 'Goal added successfully'
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add goal',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await financialGoalsService.deleteGoal(id);
      setGoals(goals.filter(goal => goal.id !== id));
      toast({
        title: 'Success',
        description: 'Goal deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateProgress = async (goalId: string, amount: number, notes?: string) => {
    try {
      const updatedGoal = await financialGoalsService.updateGoalProgress(goalId, amount, notes);
      setGoals(goals.map(goal => goal.id === goalId ? updatedGoal : goal));
      toast({
        title: 'Success',
        description: 'Progress updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      });
    }
  };

  const handleAddMilestone = async (goalId: string) => {
    try {
      await financialGoalsService.addMilestone(goalId, {
        amount: parseFloat(newMilestone.amount),
        target_date: newMilestone.target_date,
        description: newMilestone.description
      });
      const updatedGoals = await financialGoalsService.getGoals();
      setGoals(updatedGoals);
      setNewMilestone({
        amount: '',
        target_date: '',
        description: ''
      });
      toast({
        title: 'Success',
        description: 'Milestone added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add milestone',
        variant: 'destructive'
      });
    }
  };

  const handleUseSuggestion = (suggestion: GoalSuggestion) => {
    setNewGoal({
      name: suggestion.name,
      target_amount: suggestion.suggested_amount.toString(),
      deadline: suggestion.suggested_deadline,
      type: suggestion.type as 'savings' | 'budget' | 'emergency' | 'retirement',
      category_id: suggestion.category_id,
      notes: suggestion.description
    });
    setShowSuggestions(false);
  };

  // Add logging to debug goals display
  useEffect(() => {
    console.log('Current goals:', goals);
    console.log('Active goals:', goals.filter(goal => goal.status === 'in_progress'));
    console.log('Completed goals:', goals.filter(goal => goal.status === 'completed'));
    console.log('Overdue goals:', goals.filter(goal => goal.status === 'overdue'));
  }, [goals]);

  // Add new useEffect to handle goal status updates
  useEffect(() => {
    const updateGoalStatuses = async () => {
      const updatedGoals = goals.map(goal => {
        if (!goal.status) {
          const now = new Date();
          const deadline = new Date(goal.deadline);
          const progress = (goal.current_amount / goal.target_amount) * 100;
          
          let newStatus: 'completed' | 'overdue' | 'in_progress' | 'urgent' = 'in_progress';
          if (progress >= 100) {
            newStatus = 'completed';
          } else if (deadline < now) {
            newStatus = 'overdue';
          }
          
          // Update the goal in the database
          financialGoalsService.updateGoal(goal.id, { status: newStatus })
            .catch(err => console.error('Error updating goal status:', err));
          
          return { ...goal, status: newStatus };
        }
        return goal;
      });
      
      setGoals(updatedGoals as FinancialGoal[]);
    };

    updateGoalStatuses();
  }, [goals]);

  // Update the goal filtering logic
  const activeGoals = goals.filter(goal => 
    goal.status === 'in_progress' || goal.status === 'urgent'
  );
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const overdueGoals = goals.filter(goal => goal.status === 'overdue');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Financial Goals</h1>
        <Button onClick={() => setShowSuggestions(true)}>
          <Lightbulb className="mr-2 h-4 w-4" />
          Get Suggestions
        </Button>
      </div>

      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Goal Suggestions</DialogTitle>
            <DialogDescription>
              Based on your financial profile, here are some suggested goals:
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.template_id} className="p-4">
                <h3 className="font-semibold">{suggestion.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                <div className="mt-2">
                  <p className="text-sm">Suggested Amount: ${suggestion.suggested_amount}</p>
                  <p className="text-sm">Suggested Deadline: {new Date(suggestion.suggested_deadline).toLocaleDateString()}</p>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Tips:</h4>
                  <ul className="list-disc list-inside text-sm">
                    {suggestion.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => handleUseSuggestion(suggestion)}
                >
                  Use This Suggestion
                </Button>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Goal</h2>
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Goal Name"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              required
            />
            <Input
              type="number"
              placeholder="Target Amount"
              value={newGoal.target_amount}
              onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
              required
            />
            <Input
              type="date"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
              required
            />
            <Select
              value={newGoal.type}
              onValueChange={(value) => setNewGoal({ ...newGoal, type: value as 'savings' | 'budget' | 'emergency' | 'retirement' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select goal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings">Savings Goal</SelectItem>
                <SelectItem value="budget">Budget Goal</SelectItem>
                <SelectItem value="emergency">Emergency Fund</SelectItem>
                <SelectItem value="retirement">Retirement</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={newGoal.category_id}
              onValueChange={(value) => setNewGoal({ ...newGoal, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Notes (optional)"
              value={newGoal.notes}
              onChange={(e) => setNewGoal({ ...newGoal, notes: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Button>
        </form>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Goals</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onUpdateProgress={handleUpdateProgress}
                onAddMilestone={handleAddMilestone}
                category={categories.find(c => c.id === goal.category_id)}
              />
            ))}
            {activeGoals.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No active goals. Add a new goal to get started!
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onUpdateProgress={handleUpdateProgress}
                onAddMilestone={handleAddMilestone}
                category={categories.find(c => c.id === goal.category_id)}
              />
            ))}
            {completedGoals.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No completed goals yet.
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="overdue">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overdueGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
                onUpdateProgress={handleUpdateProgress}
                onAddMilestone={handleAddMilestone}
                category={categories.find(c => c.id === goal.category_id)}
              />
            ))}
            {overdueGoals.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-8">
                No overdue goals.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface GoalCardProps {
  goal: FinancialGoal;
  onDelete: (id: string) => void;
  onUpdateProgress: (id: string, amount: number, notes?: string) => void;
  onAddMilestone: (id: string) => void;
  category?: any;
}

function GoalCard({ goal, onDelete, onUpdateProgress, onAddMilestone, category }: GoalCardProps) {
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [progressAmount, setProgressAmount] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [newMilestone, setNewMilestone] = useState({
    amount: '',
    target_date: '',
    description: ''
  });

  const progress = (goal.current_amount / goal.target_amount) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      case 'urgent':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{goal.name}</h3>
          <p className="text-sm text-gray-500">
            {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(goal.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className={getStatusColor(goal.status)} />
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Current: ${goal.current_amount.toFixed(2)}</span>
          <span>Target: ${goal.target_amount.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
        </div>
        
        {category && (
          <div className="flex items-center text-sm text-gray-500">
            <Target className="h-4 w-4 mr-1" />
            <span>Category: {category.name}</span>
          </div>
        )}

        {goal.notes && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">Notes:</p>
            <p>{goal.notes}</p>
          </div>
        )}

        {goal.milestones && goal.milestones.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Milestones</h4>
            <div className="space-y-2">
              {goal.milestones.map((milestone: any) => (
                <div key={milestone.id} className="text-sm">
                  <div className="flex justify-between">
                    <span>${milestone.amount.toFixed(2)}</span>
                    <span>{new Date(milestone.target_date).toLocaleDateString()}</span>
                  </div>
                  {milestone.description && (
                    <p className="text-gray-500">{milestone.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowProgressDialog(true)}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Update Progress
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMilestoneDialog(true)}
          >
            <Target className="h-4 w-4 mr-1" />
            Add Milestone
          </Button>
        </div>
      </div>

      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Update the current amount for this goal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Current Amount"
              value={progressAmount}
              onChange={(e) => setProgressAmount(e.target.value)}
            />
            <Input
              placeholder="Notes (optional)"
              value={progressNotes}
              onChange={(e) => setProgressNotes(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => {
                onUpdateProgress(goal.id, parseFloat(progressAmount), progressNotes);
                setShowProgressDialog(false);
                setProgressAmount('');
                setProgressNotes('');
              }}
            >
              Update Progress
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>
              Add a milestone to track progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="Amount"
              value={newMilestone.amount}
              onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
            />
            <Input
              type="date"
              value={newMilestone.target_date}
              onChange={(e) => setNewMilestone({ ...newMilestone, target_date: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={newMilestone.description}
              onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
            />
            <Button
              className="w-full"
              onClick={() => {
                onAddMilestone(goal.id);
                setShowMilestoneDialog(false);
                setNewMilestone({
                  amount: '',
                  target_date: '',
                  description: ''
                });
              }}
            >
              Add Milestone
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 