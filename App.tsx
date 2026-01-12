import React, { useState } from 'react';
import { InvestmentData } from './types';
import InputScreen from './components/InputScreen';
import ResultsScreen from './components/ResultsScreen';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input');
  
  const [data, setData] = useState<InvestmentData>({
    address: '',
    purchasePrice: 450000,
    downPayment: 20,
    interestRate: 6.5,
    benchmark: 'SPY',
    horizon: 15,
  });

  const handleUpdateData = (newData: Partial<InvestmentData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const navigateToResults = () => {
    window.scrollTo(0, 0);
    setCurrentView('results');
  };

  const navigateToInput = () => {
    window.scrollTo(0, 0);
    setCurrentView('input');
  };

  return (
    <div className="antialiased font-display text-slate-900 dark:text-white bg-background-light dark:bg-background-dark min-h-screen">
      {currentView === 'input' ? (
        <InputScreen 
          data={data} 
          onUpdate={handleUpdateData} 
          onCompare={navigateToResults} 
        />
      ) : (
        <ResultsScreen 
          data={data} 
          onBack={navigateToInput} 
        />
      )}
    </div>
  );
};

export default App;