import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/StatsCard';
import { DollarSign, TrendingDown, Wallet, TrendingUp } from 'lucide-react';
import { storage } from '@/lib/localStorage';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Pie, PieChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export const Dashboard = () => {
  const expenses = storage.getExpenses();
  const budgets = storage.getBudgets();
  const categories = storage.getCategories();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlyExpenses = expenses.filter(e => {
      const date = new Date(e.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = budgets
      .filter(b => b.period === 'monthly')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const remaining = totalBudget - totalExpenses;
    const percentUsed = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
    
    return {
      totalExpenses,
      totalBudget,
      remaining,
      percentUsed,
      expenseCount: monthlyExpenses.length,
    };
  }, [expenses, budgets]);

  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const data = months.map((month, index) => {
      const monthExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });
      
      return {
        month,
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
      };
    });
    
    return data;
  }, [expenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Expenses"
          value={`$${stats.totalExpenses.toFixed(2)}`}
          change={`${stats.expenseCount} transactions`}
          changeType="neutral"
          icon={DollarSign}
          iconColor="text-destructive"
        />
        <StatsCard
          title="Total Budget"
          value={`$${stats.totalBudget.toFixed(2)}`}
          change={`${budgets.length} budgets`}
          changeType="neutral"
          icon={Wallet}
          iconColor="text-primary"
        />
        <StatsCard
          title="Remaining"
          value={`$${stats.remaining.toFixed(2)}`}
          change={`${stats.percentUsed.toFixed(1)}% used`}
          changeType={stats.remaining >= 0 ? 'positive' : 'negative'}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatsCard
          title="Categories"
          value={categories.length.toString()}
          change="Active categories"
          changeType="neutral"
          icon={TrendingDown}
          iconColor="text-warning"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                expenses: {
                  label: "Expenses",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="expenses" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ChartContainer
                config={{
                  value: {
                    label: "Amount",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="hsl(var(--chart-1))"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses.slice(-5).reverse().map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/70 transition-colors">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-lg font-bold text-destructive">-${expense.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No expenses yet. Add your first expense to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
