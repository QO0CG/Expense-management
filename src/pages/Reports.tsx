import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/localStorage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Reports = () => {
  const expenses = storage.getExpenses();
  const budgets = storage.getBudgets();
  const categories = storage.getCategories();

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
      
      return { month, total, count, average };
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

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.setFillColor(41, 98, 255);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text('Financial Report', 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Generated: ${currentDate}`, 105, 32, { align: 'center' });

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalBudgets = budgets.reduce((sum, b) => sum + b.amount, 0);

      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 14, 55);
      doc.text(`Total Budgets: $${totalBudgets.toFixed(2)}`, 14, 62);
      doc.text(`Transactions: ${expenses.length}`, 14, 69);

      let yPosition = 85;
      doc.setFontSize(14);
      doc.text('Monthly Expenses', 14, yPosition);

      autoTable(doc, {
        startY: yPosition + 5,
        head: [['Month', 'Total', 'Count', 'Average']],
        body: monthlyReport.map(row => [
          row.month,
          `$${row.total.toFixed(2)}`,
          row.count.toString(),
          `$${row.average.toFixed(2)}`
        ]),
        headStyles: { fillColor: [41, 98, 255] },
        styles: { fontSize: 9 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Expenses by Category', 14, yPosition);

      if (categoryReport.length > 0) {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Category', 'Total', 'Count', 'Average']],
          body: categoryReport.map(row => [
            row.category,
            `$${row.total.toFixed(2)}`,
            row.count.toString(),
            `$${row.average.toFixed(2)}`
          ]),
          headStyles: { fillColor: [34, 197, 94] },
          styles: { fontSize: 9 },
        });
      }

      doc.save(`Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Report Downloaded',
        description: 'Your financial report has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button onClick={downloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Monthly Expenses Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-secondary" />
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryReport.length > 0 ? (
            <div className="rounded-lg border overflow-x-auto">
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
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
