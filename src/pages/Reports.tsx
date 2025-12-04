import { useMemo, useRef, useState } from 'react';
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
import { FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { format, isWithinInterval } from 'date-fns';
import { ReportDownloadDialog } from '@/components/ReportDownloadDialog';
import { ReportChart } from '@/components/ReportChart';

export const Reports = () => {
  const expenses = storage.getExpenses();
  const budgets = storage.getBudgets();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const downloadPDF = async (startDate: Date, endDate: Date) => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      
      // Filter expenses by date range
      const filteredExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        return isWithinInterval(expenseDate, { start: startDate, end: endDate });
      });

      const dateRangeText = `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Calculate filtered statistics
      const filteredCategoryTotals: Record<string, { total: number; count: number }> = {};
      filteredExpenses.forEach(expense => {
        if (!filteredCategoryTotals[expense.category]) {
          filteredCategoryTotals[expense.category] = { total: 0, count: 0 };
        }
        filteredCategoryTotals[expense.category].total += expense.amount;
        filteredCategoryTotals[expense.category].count += 1;
      });

      const filteredCategoryReport = Object.entries(filteredCategoryTotals)
        .map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count,
          average: data.total / data.count,
        }))
        .sort((a, b) => b.total - a.total);

      // ===== PAGE 1: Header & Summary =====
      doc.setFillColor(41, 98, 255);
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text('Financial Report', 105, 22, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(220, 220, 255);
      doc.text(dateRangeText, 105, 32, { align: 'center' });
      doc.text(`Generated: ${currentDate}`, 105, 40, { align: 'center' });

      // Summary Cards
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalBudgets = budgets.reduce((sum, b) => sum + b.amount, 0);
      const avgExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary Overview', 14, 58);

      const summaryData = [
        { label: 'Total Expenses', value: `$${totalExpenses.toFixed(2)}`, color: [239, 68, 68] },
        { label: 'Total Budgets', value: `$${totalBudgets.toFixed(2)}`, color: [34, 197, 94] },
        { label: 'Transactions', value: filteredExpenses.length.toString(), color: [59, 130, 246] },
        { label: 'Avg. Expense', value: `$${avgExpense.toFixed(2)}`, color: [168, 85, 247] },
      ];

      let xPos = 14;
      summaryData.forEach((item) => {
        doc.setFillColor(item.color[0], item.color[1], item.color[2]);
        doc.roundedRect(xPos, 64, 44, 28, 3, 3, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(item.label, xPos + 22, 74, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(item.value, xPos + 22, 86, { align: 'center' });
        
        xPos += 48;
      });

      // ===== Expenses by Category Table =====
      let yPosition = 105;
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Expenses by Category', 14, yPosition);

      if (filteredCategoryReport.length > 0) {
        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Category', 'Total', 'Count', 'Average']],
          body: filteredCategoryReport.map(row => [
            row.category,
            `$${row.total.toFixed(2)}`,
            row.count.toString(),
            `$${row.average.toFixed(2)}`
          ]),
          headStyles: {
            fillColor: [34, 197, 94],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
          styles: {
            fontSize: 9,
            cellPadding: 4,
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 35, halign: 'right' },
            2: { cellWidth: 30, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
          },
        });
      }

      // ===== Budget Overview Table =====
      yPosition = (doc as any).lastAutoTable?.finalY + 15 || yPosition + 20;
      
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Budget Overview', 14, yPosition);

      if (budgets.length > 0) {
        const budgetData = budgets.map(budget => {
          const spent = filteredExpenses
            .filter(e => e.category === budget.category)
            .reduce((sum, e) => sum + e.amount, 0);
          const remaining = budget.amount - spent;
          const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
          const status = percentage >= 100 ? 'Over' : percentage >= 80 ? 'Warning' : 'Good';
          
          return [
            budget.category,
            `$${budget.amount.toFixed(2)}`,
            `$${spent.toFixed(2)}`,
            `$${remaining.toFixed(2)}`,
            `${percentage.toFixed(0)}%`,
            status
          ];
        });

        autoTable(doc, {
          startY: yPosition + 5,
          head: [['Category', 'Budget', 'Spent', 'Remaining', 'Used', 'Status']],
          body: budgetData,
          headStyles: {
            fillColor: [245, 158, 11],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
          styles: {
            fontSize: 9,
            cellPadding: 4,
          },
          columnStyles: {
            0: { cellWidth: 32 },
            1: { cellWidth: 28, halign: 'right' },
            2: { cellWidth: 28, halign: 'right' },
            3: { cellWidth: 28, halign: 'right' },
            4: { cellWidth: 22, halign: 'center' },
            5: { cellWidth: 22, halign: 'center' },
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
              const status = data.cell.raw as string;
              if (status === 'Over') {
                data.cell.styles.textColor = [239, 68, 68];
                data.cell.styles.fontStyle = 'bold';
              } else if (status === 'Warning') {
                data.cell.styles.textColor = [245, 158, 11];
              } else {
                data.cell.styles.textColor = [34, 197, 94];
              }
            }
          },
        });
      }

      // ===== PAGE 2: Charts =====
      if (chartRef.current && filteredCategoryReport.length > 0) {
        doc.addPage();
        
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text('Visual Analytics', 105, 16, { align: 'center' });

        try {
          const canvas = await html2canvas(chartRef.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 180;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          doc.addImage(imgData, 'PNG', 15, 35, imgWidth, Math.min(imgHeight, 180));
        } catch (chartError) {
          console.warn('Could not capture chart:', chartError);
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text('Chart visualization not available', 105, 60, { align: 'center' });
        }
      }

      // ===== FINAL PAGE: Expense Details =====
      doc.addPage();
      
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('Expense Details', 105, 16, { align: 'center' });

      if (filteredExpenses.length > 0) {
        const expenseData = filteredExpenses
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(expense => [
            format(new Date(expense.date), 'MMM d, yyyy'),
            expense.description.length > 35 ? expense.description.substring(0, 35) + '...' : expense.description,
            expense.category,
            `$${expense.amount.toFixed(2)}`
          ]);

        autoTable(doc, {
          startY: 35,
          head: [['Date', 'Description', 'Category', 'Amount']],
          body: expenseData,
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
          styles: {
            fontSize: 9,
            cellPadding: 4,
          },
          columnStyles: {
            0: { cellWidth: 32 },
            1: { cellWidth: 80 },
            2: { cellWidth: 40 },
            3: { cellWidth: 28, halign: 'right' },
          },
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('No expenses found for this period', 105, 60, { align: 'center' });
      }

      // Footer on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(14, doc.internal.pageSize.height - 18, 196, doc.internal.pageSize.height - 18);
        
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text(
          `Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          'Financial Report - Confidential',
          14,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          format(new Date(), 'yyyy-MM-dd'),
          196,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }

      const fileName = `Financial_Report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

      toast({
        title: 'Report Downloaded',
        description: `Your financial report for ${dateRangeText} has been saved.`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        <ReportDownloadDialog onDownload={downloadPDF} isGenerating={isGenerating} />
      </div>

      {/* Hidden chart for PDF capture */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <ReportChart 
          categoryData={categoryReport}
          monthlyData={monthlyReport}
          chartRef={chartRef}
        />
      </div>

      {/* Monthly Report */}
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

      {/* Category Report */}
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
              No expense data available for reports
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
