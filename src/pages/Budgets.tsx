import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Edit } from 'lucide-react';
import { storage, type Budget } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

export const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>(storage.getBudgets());
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const categories = storage.getCategories();
  const expenses = storage.getExpenses();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'daily',
  });

  const calculateSpent = (budget: Budget) => {
    const categoryExpenses = expenses.filter(e => e.category === budget.category);
    return categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (editingBudget) {
      storage.updateBudget(editingBudget.id, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
      });
      toast({
        title: "Success",
        description: "Budget updated successfully",
      });
    } else {
      storage.addBudget({
        category: formData.category,
        amount: parseFloat(formData.amount),
        period: formData.period,
      });
      toast({
        title: "Success",
        description: "Budget added successfully",
      });
    }

    setBudgets(storage.getBudgets());
    setIsOpen(false);
    setEditingBudget(null);
    setFormData({
      category: '',
      amount: '',
      period: 'monthly',
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setIsOpen(true);
  };

  const confirmDelete = () => {
    if (deletingBudget) {
      storage.deleteBudget(deletingBudget.id);
      setBudgets(storage.getBudgets());
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
      setDeletingBudget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBudget(null);
              setFormData({
                category: '',
                amount: '',
                period: 'monthly',
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit' : 'Add'} Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="general">General</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="period">Period</Label>
                <Select value={formData.period} onValueChange={(value: any) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {editingBudget ? 'Update' : 'Add'} Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            const spent = calculateSpent(budget);
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = spent > budget.amount;

            return (
              <Card key={budget.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingBudget(budget)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">${spent.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">
                      of ${budget.amount.toFixed(2)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className={isOverBudget ? "text-destructive font-semibold" : "text-muted-foreground"}>
                      {percentage.toFixed(1)}% used
                    </span>
                    <span className="text-muted-foreground capitalize">{budget.period}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="text-center py-12 text-muted-foreground">
              No budgets yet. Click "Add Budget" to get started!
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deletingBudget} onOpenChange={(open) => !open && setDeletingBudget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the budget for "{deletingBudget?.category}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
