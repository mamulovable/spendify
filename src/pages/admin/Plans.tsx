import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdmin } from '@/contexts/AdminContext';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export default function Plans() {
  const { toast } = useToast();
  const { logActivity } = useAdmin();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PricingPlan>>({
    name: '',
    description: '',
    features: [],
    price_monthly: 0,
    price_yearly: 0,
    is_active: true,
    is_popular: false,
    sort_order: 0,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      if (dbError) throw dbError;

      setPlans(data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch plans'));
      await logActivity('error', 'plan_management', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleFeatureChange = (value: string) => {
    const features = value.split('\n').filter(feature => feature.trim() !== '');
    setFormData({
      ...formData,
      features,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      features: [],
      price_monthly: 0,
      price_yearly: 0,
      is_active: true,
      is_popular: false,
      sort_order: 0,
    });
  };

  const handleAddPlan = async () => {
    try {
      const { error: dbError } = await supabase
        .from('pricing_plans')
        .insert([formData]);

      if (dbError) throw dbError;

      toast({
        title: 'Plan Added',
        description: 'The pricing plan has been added successfully',
      });

      await logActivity('created', 'pricing_plan', { plan_name: formData.name });
      
      setIsAddModalOpen(false);
      resetForm();
      fetchPlans();
    } catch (err) {
      console.error('Error adding plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to add pricing plan',
        variant: 'destructive',
      });
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan) return;

    try {
      const { error: dbError } = await supabase
        .from('pricing_plans')
        .update(formData)
        .eq('id', selectedPlan.id);

      if (dbError) throw dbError;

      toast({
        title: 'Plan Updated',
        description: 'The pricing plan has been updated successfully',
      });

      await logActivity('updated', 'pricing_plan', { 
        plan_id: selectedPlan.id,
        plan_name: formData.name,
      });
      
      setIsEditModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error('Error updating plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to update pricing plan',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan) return;

    try {
      // Note: In a real app, we might want to check if the plan is in use before deleting
      const { error: dbError } = await supabase
        .from('pricing_plans')
        .delete()
        .eq('id', selectedPlan.id);

      if (dbError) throw dbError;

      toast({
        title: 'Plan Deleted',
        description: 'The pricing plan has been deleted successfully',
      });

      await logActivity('deleted', 'pricing_plan', { 
        plan_id: selectedPlan.id,
        plan_name: selectedPlan.name,
      });
      
      setShowDeleteDialog(false);
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete pricing plan',
        variant: 'destructive',
      });
    }
  };

  const handlePlanAction = (action: 'edit' | 'delete', plan: PricingPlan) => {
    setSelectedPlan(plan);
    
    if (action === 'edit') {
      // Populate form data with the selected plan
      setFormData({
        name: plan.name,
        description: plan.description,
        features: plan.features,
        price_monthly: plan.price_monthly,
        price_yearly: plan.price_yearly,
        is_active: plan.is_active,
        is_popular: plan.is_popular,
        sort_order: plan.sort_order,
      });
      setIsEditModalOpen(true);
    } else if (action === 'delete') {
      setShowDeleteDialog(true);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Subscription Plans</CardTitle>
          <Button onClick={() => {
            resetForm(); 
            setIsAddModalOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> Add Plan
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Yearly Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading plans...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-red-500">
                    <div className="flex items-center justify-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error.message}
                    </div>
                  </TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {plan.name}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(plan.price_monthly)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(plan.price_yearly)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={plan.is_active ? 'default' : 'secondary'}
                        className="capitalize">
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plan.is_popular ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell>{plan.sort_order}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePlanAction('edit', plan)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handlePlanAction('delete', plan)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Plan Dialog */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Pricing Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan for users.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Basic, Premium, Enterprise"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the plan"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                <Input
                  id="price_monthly"
                  name="price_monthly"
                  type="number"
                  value={formData.price_monthly}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                <Input
                  id="price_yearly"
                  name="price_yearly"
                  type="number"
                  value={formData.price_yearly}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <textarea
                id="features"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.features?.join('\n')}
                onChange={(e) => handleFeatureChange(e.target.value)}
                placeholder="Unlimited Documents&#10;Priority Support&#10;Advanced Analytics"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)}
                />
                <Label htmlFor="is_popular">Popular</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sort_order">Display Order</Label>
              <Input
                id="sort_order"
                name="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlan}>
              Add Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pricing Plan</DialogTitle>
            <DialogDescription>
              Update the details of this subscription plan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Plan Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price_monthly">Monthly Price ($)</Label>
                <Input
                  id="edit-price_monthly"
                  name="price_monthly"
                  type="number"
                  value={formData.price_monthly}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price_yearly">Yearly Price ($)</Label>
                <Input
                  id="edit-price_yearly"
                  name="price_yearly"
                  type="number"
                  value={formData.price_yearly}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-features">Features (one per line)</Label>
              <textarea
                id="edit-features"
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.features?.join('\n')}
                onChange={(e) => handleFeatureChange(e.target.value)}
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)}
                />
                <Label htmlFor="edit-is_popular">Popular</Label>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-sort_order">Display Order</Label>
              <Input
                id="edit-sort_order"
                name="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPlan}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{selectedPlan?.name}" plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlan} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
