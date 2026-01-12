export interface ComputedRates {
  propertyTaxRate: number;
  propertyAppreciationRate: number;
  stockCAGR: number;
  marketVibe: string;
  locationName: string;
}

export interface InvestmentData {
  address: string;
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  benchmark: 'SPY' | 'QQQ' | 'DIA';
  horizon: number;
  computedRates?: ComputedRates;
}

export interface ChartPoint {
  year: string;
  property: number;
  stock: number;
}
