import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2 } from 'lucide-react';
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
import { ThemeToggle } from '@/components/ThemeToggle';

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

      {/* Theme Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Theme</h3>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or clear your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download all your data as JSON</p>
              </div>
            </div>
            <Button onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <Upload className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Import Data</h3>
                <p className="text-sm text-muted-foreground">Restore data from a backup file</p>
              </div>
            </div>
            <Button onClick={handleImport} variant="secondary" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Clear All Data</h3>
                <p className="text-sm text-muted-foreground">Permanently delete all data</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
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
                  <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, clear all data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
