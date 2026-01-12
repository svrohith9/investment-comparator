export interface ComputedRates {
  propertyTaxRate: number;
  propertyAppreciationRate: number;
  stockCAGR: number;
  marketVibe: string;
  locationName: string;
  stockStartPrice?: number;
  stockEndPrice?: number;
  stockStartDate?: string;
  stockEndDate?: string;
  stockDataSource?: string;
}

export interface InvestmentData {
  address: string;
  purchasePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  hoaMonthly: number;
  insuranceAnnual: number;
  maintenanceRate: number;
  propertyTaxRate: number;
  propertyAppreciationRate: number;
  startDate: string;
  benchmark: string;
  horizon: number;
  computedRates?: ComputedRates;
}

export interface ChartPoint {
  year: string;
  property: number;
  stock: number;
}
