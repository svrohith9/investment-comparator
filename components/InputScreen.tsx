import React, { useState, useEffect, useRef } from 'react';
import { InvestmentData } from '../types';
import { searchAddress, analyzeMarket, AddressResult } from '../services/api';

interface InputScreenProps {
  data: InvestmentData;
  onUpdate: (data: Partial<InvestmentData>) => void;
  onCompare: () => void;
}

const InputScreen: React.FC<InputScreenProps> = ({ data, onUpdate, onCompare }) => {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  const handleBenchmarkSelect = (benchmark: InvestmentData['benchmark']) => {
    onUpdate({ benchmark });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onUpdate({ address: val });
    
    // Debounce address search
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length > 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        const results = await searchAddress(val);
        setSuggestions(results);
        setIsSearching(false);
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  const selectAddress = (addr: AddressResult) => {
    onUpdate({ address: addr.display_name });
    setSuggestions([]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Fetch precise rates from Gemini based on location
    const rates = await analyzeMarket(data.address || 'United States', data.benchmark);
    onUpdate({ computedRates: rates });
    setIsAnalyzing(false);
    onCompare();
  };

  return (
    <div className="min-h-screen pb-32 relative">
       {/* Loading Overlay */}
       {isAnalyzing && (
        <div className="fixed inset-0 z-[60] bg-background-dark/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6"></div>
           <h3 className="text-xl font-bold text-white mb-2">Analyzing Local Market</h3>
           <p className="text-text-muted text-center max-w-xs">
             Fetching property tax codes for <span className="text-primary">{data.address.split(',')[0]}</span> and crunching {data.benchmark} historicals...
           </p>
        </div>
      )}

      {/* Top Navigation */}
      <div className="sticky top-0 z-40 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm p-4 border-b border-slate-200 dark:border-slate-800 justify-between">
        <button className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Investment Comparator
        </h2>
        <div className="size-10"></div>
      </div>

      <main className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 pt-6">
          <h2 className="text-slate-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight">
            Compare Assets
          </h2>
          <p className="text-slate-500 dark:text-text-muted text-base font-normal leading-normal mt-2">
            Analyze real estate versus the S&P 500 performance side-by-side.
          </p>
        </div>

        {/* Comparison Cards Stack */}
        <div className="p-4 space-y-6">
          
          {/* Real Estate Card */}
          <section className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-visible relative">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">home</span>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Property Details</h3>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Address Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-500 dark:text-text-muted mb-1.5">Property Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted text-sm">location_on</span>
                  <input 
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-input-dark border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 transition-all outline-none" 
                    placeholder="Search address (City, Zip, or Street)..." 
                    type="text"
                    value={data.address}
                    onChange={handleAddressChange}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  )}
                </div>
                {/* Autocomplete Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50">
                      OpenStreetMap Data
                    </div>
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectAddress(item)}
                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-700/50"
                      >
                        {item.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-text-muted mb-1.5">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted font-bold">$</span>
                  <input 
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-input-dark border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white outline-none" 
                    type="number" 
                    value={data.purchasePrice}
                    onChange={(e) => onUpdate({ purchasePrice: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Grid inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-text-muted mb-1.5">Down Payment</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted font-bold">%</span>
                    <input 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-input-dark border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white outline-none" 
                      type="number" 
                      value={data.downPayment}
                      onChange={(e) => onUpdate({ downPayment: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-text-muted mb-1.5">Interest Rate</label>
                  <div className="relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-text-muted font-bold">%</span>
                    <input 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-input-dark border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white outline-none" 
                      step="0.1" 
                      type="number" 
                      value={data.interestRate}
                      onChange={(e) => onUpdate({ interestRate: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stock Market Card */}
          <section className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">show_chart</span>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Stock Comparison</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-text-muted mb-1.5">Asset Benchmark</label>
                <div className="flex flex-wrap gap-2">
                  {(['SPY', 'QQQ', 'DIA'] as const).map((b) => (
                     <button 
                        key={b}
                        onClick={() => handleBenchmarkSelect(b)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                          data.benchmark === b 
                            ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                            : 'bg-slate-100 dark:bg-input-dark text-slate-600 dark:text-text-muted border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800'
                        }`}
                     >
                       {b === 'SPY' ? 'SPY (S&P 500)' : b}
                     </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Info */}
              <div className="pt-2">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-400 dark:text-text-muted uppercase tracking-wider">Dynamic Market Data</span>
                    <span className="bg-green-500/10 text-green-500 text-[10px] px-1.5 py-0.5 rounded font-bold">LIVE</span>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-400">
                    We'll fetch the real 10-year CAGR for {data.benchmark} and local property tax rates for {data.address ? data.address.split(',')[0] : 'your location'}.
                 </p>
              </div>
            </div>
          </section>

          {/* Global Horizon Slider */}
          <section className="px-1">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-slate-900 dark:text-white font-bold">Investment Horizon</h3>
              <span className="text-primary font-bold text-lg">{data.horizon} Years</span>
            </div>
            <input 
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" 
              type="range" 
              min="1" 
              max="30" 
              value={data.horizon}
              onChange={(e) => onUpdate({ horizon: parseInt(e.target.value) })}
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-text-muted mt-2 font-medium">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </section>
        </div>

        {/* Comparison Visual Preview */}
        <div className="px-4 mb-8">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Comparative Engine</p>
                <p className="text-xs text-slate-500 dark:text-text-muted">Powered by Gemini & OpenStreetMaps</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-center z-50">
        <div className="w-full max-w-md">
            <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
            {isAnalyzing ? (
               <span>Analyzing...</span>
            ) : (
                <>
                <span>Run Analysis</span>
                <span className="material-symbols-outlined">rocket_launch</span>
                </>
            )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default InputScreen;