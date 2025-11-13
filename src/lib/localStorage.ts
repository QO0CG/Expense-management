export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'daily';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  EXPENSES: 'expense_tracker_expenses',
  BUDGETS: 'expense_tracker_budgets',
  CATEGORIES: 'expense_tracker_categories',
};

export const storage = {
  // Expenses
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
  },
  
  saveExpenses: (expenses: Expense[]) => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  },
  
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const expenses = storage.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    expenses.push(newExpense);
    storage.saveExpenses(expenses);
    return newExpense;
  },
  
  updateExpense: (id: string, updates: Partial<Expense>) => {
    const expenses = storage.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates };
      storage.saveExpenses(expenses);
      return expenses[index];
    }
    return null;
  },
  
  deleteExpense: (id: string) => {
    const expenses = storage.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    storage.saveExpenses(filtered);
  },
  
  // Budgets
  getBudgets: (): Budget[] => {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  },
  
  saveBudgets: (budgets: Budget[]) => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },
  
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const budgets = storage.getBudgets();
    const newBudget: Budget = {
      ...budget,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    budgets.push(newBudget);
    storage.saveBudgets(budgets);
    return newBudget;
  },
  
  updateBudget: (id: string, updates: Partial<Budget>) => {
    const budgets = storage.getBudgets();
    const index = budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates };
      storage.saveBudgets(budgets);
      return budgets[index];
    }
    return null;
  },
  
  deleteBudget: (id: string) => {
    const budgets = storage.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    storage.saveBudgets(filtered);
  },
  
  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },
  
  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => {
    const categories = storage.getCategories();
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    categories.push(newCategory);
    storage.saveCategories(categories);
    return newCategory;
  },
  
  updateCategory: (id: string, updates: Partial<Category>) => {
    const categories = storage.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      storage.saveCategories(categories);
      return categories[index];
    }
    return null;
  },
  
  deleteCategory: (id: string) => {
    const categories = storage.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    storage.saveCategories(filtered);
  },
};
