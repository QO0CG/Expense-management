import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { storage } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';
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

export const Settings = () => {
  const { toast } = useToast();

  const handleExport = () => {
    const data = {
      expenses: storage.getExpenses(),
      budgets: storage.getBudgets(),
      categories: storage.getCategories(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported successfully",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const data = JSON.parse(e.target.result);
            if (data.expenses) storage.saveExpenses(data.expenses);
            if (data.budgets) storage.saveBudgets(data.budgets);
            if (data.categories) storage.saveCategories(data.categories);
            
            toast({
              title: "Success",
              description: "Data imported successfully. Please refresh the page.",
            });
            
            setTimeout(() => window.location.reload(), 2000);
          } catch (error) {
            toast({
              title: "Error",
              description: "Invalid file format",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearData = () => {
    localStorage.clear();
    toast({
      title: "Success",
      description: "All data cleared successfully",
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Export Data</h3>
              <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
            </div>
            <Button onClick={handleExport}>Export</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Import Data</h3>
              <p className="text-sm text-muted-foreground">Restore data from a backup file</p>
            </div>
            <Button onClick={handleImport} variant="outline">Import</Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Clear All Data</h3>
              <p className="text-sm text-muted-foreground">Permanently delete all data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Clear Data</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your expenses, budgets, and categories.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData}>
                    Yes, clear all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-semibold">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Storage</span>
            <span className="font-semibold">Local Storage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expenses Count</span>
            <span className="font-semibold">{storage.getExpenses().length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Budgets Count</span>
            <span className="font-semibold">{storage.getBudgets().length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Categories Count</span>
            <span className="font-semibold">{storage.getCategories().length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="flex gap-3 pt-6">
          <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold">Data Storage</p>
            <p className="text-sm text-muted-foreground">
              All your data is stored locally in your browser. Make regular backups using the export feature.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
