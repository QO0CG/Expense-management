import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storage } from '@/lib/localStorage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export const Reports = () => {
  const expenses = storage.getExpenses();
  const budgets = storage.getBudgets();

  const monthlyReport = useMemo(() => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthExpenses = expenses.filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === index && date.getFullYear() === currentYear;
      });
      
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const count = monthExpenses.length;
      const average = count > 0 ? total / count : 0;
      
      return {
        month,
        total,
        count,
        average,
      };
    });
  }, [expenses]);

  const categoryReport = useMemo(() => {
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    
    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = { total: 0, count: 0 };
      }
      categoryTotals[expense.category].total += expense.amount;
      categoryTotals[expense.category].count += 1;
    });
    
    return Object.entries(categoryTotals).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      average: data.total / data.count,
    })).sort((a, b) => b.total - a.total);
  }, [expenses]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Reports</h1>

      {/* Monthly Report */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyReport.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month}</TableCell>
                    <TableCell className="text-right">${row.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">${row.average.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Report */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryReport.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryReport.map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium">{row.category}</TableCell>
                      <TableCell className="text-right">${row.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right">${row.average.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No expense data available for reports
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
