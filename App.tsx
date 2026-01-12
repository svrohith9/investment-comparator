import React, { useState } from 'react';
import { InvestmentData } from './types';
import HomeScreen from './components/HomeScreen';
import InputScreen from './components/InputScreen';
import ResultsScreen from './components/ResultsScreen';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'input' | 'results'>('home');
  
  const [data, setData] = useState<InvestmentData>({
    address: '',
    purchasePrice: 450000,
    downPayment: 20,
    interestRate: 6.5,
    loanTermYears: 30,
    hoaMonthly: 0,
    insuranceAnnual: 1200,
    maintenanceRate: 0.01,
    propertyTaxRate: 0.012,
    propertyAppreciationRate: 0.04,
    startDate: '2014-01-02',
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

  const navigateToHome = () => {
    window.scrollTo(0, 0);
    setCurrentView('home');
  };

  const navigateToInput = () => {
    window.scrollTo(0, 0);
    setCurrentView('input');
  };

  return (
    <div className="antialiased font-display text-slate-900 dark:text-white bg-background-light dark:bg-background-dark min-h-screen">
      {currentView === 'home' ? (
        <HomeScreen onGetStarted={navigateToInput} />
      ) : currentView === 'input' ? (
        <InputScreen 
          data={data} 
          onUpdate={handleUpdateData} 
          onCompare={navigateToResults} 
          onBack={navigateToHome}
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
