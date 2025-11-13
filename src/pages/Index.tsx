import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Dashboard } from './Dashboard';
import { Expenses } from './Expenses';
import { Budgets } from './Budgets';
import { Reports } from './Reports';
import { Categories } from './Categories';
import { Calculator } from './Calculator';
import { Settings } from './Settings';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'expenses':
        return <Expenses />;
      case 'budgets':
        return <Budgets />;
      case 'reports':
        return <Reports />;
      case 'categories':
        return <Categories />;
      case 'calculator':
        return <Calculator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
