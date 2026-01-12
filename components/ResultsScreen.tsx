import React, { useState } from 'react';
import { InvestmentData } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultsScreenProps {
  data: InvestmentData;
  onBack: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ data, onBack }) => {
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [taxView, setTaxView] = useState<'pre' | 'after'>('pre');

  // Dynamic Constants from AI or Defaults
  const PROP_TAX_RATE = data.computedRates?.propertyTaxRate ?? 0.012;
  const PROP_APPREC_RATE = data.computedRates?.propertyAppreciationRate ?? 0.05;
  const STOCK_RATE = data.computedRates?.stockCAGR ?? 0.08;
  const CAP_GAINS_RATE = 0.15; 

  // Generate chart data based on user input
  const chartData = React.useMemo(() => {
    const points = [];
    const years = data.horizon > 5 ? data.horizon : 30;
    const startYear = new Date().getFullYear();

    // Initial values
    const initialInvestment = data.purchasePrice * (data.downPayment / 100);
    
    let stockVal = initialInvestment;
    let propEquity = initialInvestment; // Equity bucket
    let propAssetValue = data.purchasePrice; // Total Asset Value (for tax basis)
    let cumPropTax = 0;

    for (let i = 0; i <= years; i++) {
      // 1. Calculate taxes for the *current* year state
      const annualPropTax = propAssetValue * PROP_TAX_RATE;
      
      // 2. Calculate Net Values (Liquidated Today)
      // Stock
      const stockGain = stockVal - initialInvestment;
      const stockTaxBill = stockGain > 0 ? stockGain * CAP_GAINS_RATE : 0;
      const stockNet = stockVal - stockTaxBill;

      // Property
      const propGain = propEquity - initialInvestment;
      const propCapGainsBill = propGain > 0 ? propGain * CAP_GAINS_RATE : 0;
      // In after-tax view, we subtract Cap Gains AND the cumulative cashflow spent on taxes (Opp. Cost)
      const propNet = propEquity - propCapGainsBill - cumPropTax;

      points.push({
        year: (startYear + i).toString(),
        // Display values
        stock: taxView === 'after' ? Math.round(stockNet) : Math.round(stockVal),
        property: taxView === 'after' ? Math.round(propNet) : Math.round(propEquity),
        // Metadata for Tax Section
        rawAnnualTax: annualPropTax,
        rawCumTax: cumPropTax,
        rawAssetValue: propAssetValue,
      });

      // 3. Increment for next loop
      stockVal = stockVal * (1 + STOCK_RATE);
      propEquity = propEquity * (1 + PROP_APPREC_RATE);
      propAssetValue = propAssetValue * (1 + PROP_APPREC_RATE);
      
      // Accumulate tax paid for next year's net calc
      cumPropTax += annualPropTax;
    }
    return points;
  }, [data, taxView, PROP_TAX_RATE, PROP_APPREC_RATE, STOCK_RATE]);

  const finalPoint = chartData[chartData.length - 1];
  const finalStock = finalPoint.stock;
  const finalProp = finalPoint.property;
  const isStockWinner = finalStock > finalProp;
  const winnerValue = isStockWinner ? finalStock : finalProp;
  const winnerName = isStockWinner ? "S&P 500" : "Property";
  const diffPercent = Math.abs((finalStock - finalProp) / Math.min(finalStock, finalProp) * 100).toFixed(1);

  // Format large currency
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${(val / 1000).toFixed(0)}k`;
  };

  const formatMoneyRaw = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-md mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-white"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <div className="text-center">
            <h1 className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Comparison Results</h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-text-muted uppercase tracking-widest">
                {data.computedRates?.locationName || 'Property'} vs. {data.benchmark}
            </p>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-white">
            <span className="material-symbols-outlined text-2xl">info</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 max-w-md mx-auto w-full">
        {/* Main Chart Section */}
        <section className="px-4 pt-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-text-muted">
                {taxView === 'after' ? 'Net Liquidation Value' : 'Total Equity Value'}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(winnerValue)}
              </h2>
            </div>
            <div className="flex flex-col items-end">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isStockWinner ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                +{diffPercent}% Outperformance
              </span>
              <p className="text-[11px] text-slate-400 mt-1">{chartData.length - 1} Year Projection</p>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="relative w-full h-72 bg-slate-50 dark:bg-card-dark/50 rounded-xl p-2 border border-slate-200 dark:border-slate-800 overflow-hidden">
             {/* Custom Legend */}
            <div className="absolute top-4 left-4 flex gap-4 z-10">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(19,127,236,0.6)]"></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{data.benchmark}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Property</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#137fec" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProperty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#101922', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                />
                <XAxis 
                    dataKey="year" 
                    hide={true} 
                />
                <Area 
                    type="monotone" 
                    dataKey="stock" 
                    stroke="#137fec" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorStock)" 
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="property" 
                    stroke="#fbbf24" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorProperty)" 
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* X-Axis Labels mockup */}
            <div className="flex justify-between mt-0 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter absolute bottom-2 w-full left-0">
                <span>{chartData[0].year}</span>
                <span>{chartData[Math.floor(chartData.length / 2)].year}</span>
                <span className="mr-4">{chartData[chartData.length - 1].year}</span>
            </div>
          </div>
        </section>

        {/* Data Source Indicators */}
        <section className="px-4 mt-4">
             <div className="flex gap-2 overflow-x-auto pb-2">
                 <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-card-dark px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[14px] text-primary">analytics</span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {data.benchmark} CAGR: {formatPercent(STOCK_RATE)}
                    </span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-card-dark px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[14px] text-amber-500">location_city</span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        Prop Tax: {formatPercent(PROP_TAX_RATE)}
                    </span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-card-dark px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-nowrap">
                    <span className="material-symbols-outlined text-[14px] text-emerald-500">trending_up</span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        Appreciation: {formatPercent(PROP_APPREC_RATE)}
                    </span>
                 </div>
             </div>
        </section>

        {/* Analysis Settings Toggles */}
        <section className="mt-2 px-4">
          <div className="bg-slate-100 dark:bg-card-dark rounded-xl p-1.5 flex gap-1 border border-slate-200 dark:border-slate-800">
            <button 
                onClick={() => setTaxView('pre')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    taxView === 'pre' 
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' 
                    : 'text-slate-500 dark:text-text-muted hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
                Pre-Tax View
            </button>
            <button 
                onClick={() => setTaxView('after')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    taxView === 'after' 
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' 
                    : 'text-slate-500 dark:text-text-muted hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
                After-Tax View
            </button>
          </div>
        </section>

        {/* NEW: Property Tax Breakdown Section */}
        {taxView === 'after' && (
            <section className="mt-6 px-4 animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-amber-50 dark:bg-[#1a1814] border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-500">receipt_long</span>
                        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wide">Tax Liability Breakdown</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[11px] font-semibold text-amber-800/70 dark:text-amber-500/70 mb-0.5">Est. Annual Tax (Year 1)</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatMoneyRaw(chartData[1]?.rawAnnualTax || 0)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-amber-800/70 dark:text-amber-500/70 mb-0.5">Total Taxes Paid</p>
                                <p className="text-lg font-bold text-rose-600 dark:text-rose-500">{formatMoneyRaw(finalPoint.rawCumTax)}</p>
                            </div>
                        </div>

                        {/* Visual Bar */}
                        <div className="pt-2">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium text-slate-600 dark:text-slate-400">Total Tax Drag</span>
                                <span className="font-bold text-slate-900 dark:text-white">{((finalPoint.rawCumTax / finalPoint.property) * 100).toFixed(1)}% of Equity</span>
                            </div>
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-rose-500 rounded-full" 
                                    style={{ width: `${Math.min(((finalPoint.rawCumTax / finalPoint.property) * 100), 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-2 leading-snug">
                                Calculated using <strong>{data.computedRates?.locationName || 'Estimated'}</strong> tax rate of {formatPercent(PROP_TAX_RATE)}.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* Performance KPIs */}
        <section className="mt-8 px-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Performance Overview</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Total Return */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-text-muted mb-1">Total Return</p>
              <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                 {((winnerValue - (data.purchasePrice * data.downPayment/100)) / (data.purchasePrice * data.downPayment/100) * 100).toFixed(1)}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-emerald-500 text-sm">arrow_upward</span>
                <span className="text-[11px] font-bold text-emerald-500">vs Initial Inv.</span>
              </div>
            </div>

            {/* CAGR */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-text-muted mb-1">Stock CAGR</p>
              <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatPercent(STOCK_RATE)}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
                <span className="text-[11px] font-bold text-primary">10yr Avg</span>
              </div>
            </div>

            {/* Final Value */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <p className="text-xs font-medium text-slate-500 dark:text-text-muted mb-1">Final Value</p>
              <p className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatCurrency(winnerValue)}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
                <span className="text-[11px] font-bold text-slate-400">in {chartData.length - 1} Years</span>
              </div>
            </div>

            {/* Missed Growth */}
            <div className="bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm border-l-4 border-l-rose-500">
              <p className="text-xs font-medium text-slate-500 dark:text-text-muted mb-1">Missed Growth</p>
              <p className="text-xl font-extrabold tracking-tight text-rose-500">{formatCurrency(Math.abs(finalStock - finalProp))}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-rose-500 text-sm">warning</span>
                <span className="text-[11px] font-bold text-rose-500">Difference</span>
              </div>
            </div>
          </div>
        </section>

        {/* Insights Summary */}
        <section className="mt-6 px-4">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-lg">lightbulb</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Analysis</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {data.computedRates?.marketVibe || 'Analysis complete.'} The model estimates a {formatPercent(PROP_APPREC_RATE)} annual appreciation for this area, but tax drag significantly impacts long-term yield.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-8 pt-4 px-4 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95">
            <span className="material-symbols-outlined">download</span>
            <span>Export</span>
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md">
            <span className="material-symbols-outlined">share</span>
            <span>Share</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ResultsScreen;