import { useState, ReactNode } from 'react';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  TrendingUp, 
  Tags, 
  Calculator, 
  Settings, 
  Menu, 
  X,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'expenses', icon: CreditCard, label: 'Expenses' },
  { id: 'budgets', icon: PieChart, label: 'Budgets' },
  { id: 'reports', icon: TrendingUp, label: 'Reports' },
  { id: 'categories', icon: Tags, label: 'Categories' },
  { id: 'calculator', icon: Calculator, label: 'Calculator' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const Layout = ({ children, currentPage, onPageChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Expense Manager
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-3">
              MAIN MENU
            </div>
            {menuItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200",
                  currentPage === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            <div className="text-xs font-semibold text-muted-foreground mb-2 px-3 mt-6">
              TOOLS
            </div>
            {menuItems.slice(5).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200",
                  currentPage === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-lg"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border bg-card/50 backdrop-blur-lg">
          <div className="flex h-full items-center gap-4 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold capitalize">
              {menuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
