export interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
}

export interface StockCagrResult {
  stockCAGR: number;
  stockStartPrice: number;
  stockEndPrice: number;
  stockStartDate: string;
  stockEndDate: string;
  dataSource: string;
}

export async function searchAddress(query: string): Promise<AddressResult[]> {
  if (query.length < 3) return [];
  const normalized = query.trim().toLowerCase();
  return LOCAL_ADDRESSES.filter((addr) =>
    addr.display_name.toLowerCase().includes(normalized)
  ).slice(0, 5);
}

export async function analyzeMarket(location: string, benchmark: string) {
  const locationName = normalizeLocationName(location);
  const propertyTaxRate = estimatePropertyTaxRate(location);
  const propertyAppreciationRate = estimateAppreciationRate(location);

  return {
    propertyTaxRate,
    propertyAppreciationRate,
    marketVibe: "Local estimate based on defaults",
    locationName,
  };
}

export async function fetchStockCagr(
  ticker: string,
  startDate: string
): Promise<StockCagrResult> {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_KEY as string | undefined;
  const trimmedTicker = ticker.trim().toUpperCase();
  const safeStartDate = startDate || "2014-01-02";

  if (!apiKey) {
    return fallbackStockCagr(trimmedTicker, safeStartDate, "Missing API key");
  }

  try {
    const response = await fetch(
      `/av/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${encodeURIComponent(
        trimmedTicker
      )}&outputsize=full&apikey=${apiKey}`
    );

    if (!response.ok) {
      return fallbackStockCagr(trimmedTicker, safeStartDate, "API request failed");
    }

    const data = await response.json();
    const series = data["Time Series (Daily)"] as Record<string, Record<string, string>>;
    if (!series) {
      return fallbackStockCagr(trimmedTicker, safeStartDate, "No time series data");
    }

    const dates = Object.keys(series).sort((a, b) => (a < b ? 1 : -1));
    const endDate = dates[0];
    const startDateUsed = pickStartDate(dates, safeStartDate);

    const endPrice = parseFloat(series[endDate]["5. adjusted close"]);
    const startPrice = parseFloat(series[startDateUsed]["5. adjusted close"]);
    const years = yearDiff(startDateUsed, endDate);
    const stockCAGR = years > 0 ? Math.pow(endPrice / startPrice, 1 / years) - 1 : 0;

    return {
      stockCAGR,
      stockStartPrice: startPrice,
      stockEndPrice: endPrice,
      stockStartDate: startDateUsed,
      stockEndDate: endDate,
      dataSource: "Alpha Vantage",
    };
  } catch (error) {
    console.error("Stock data error:", error);
    return fallbackStockCagr(trimmedTicker, safeStartDate, "Stock data error");
  }
}

const LOCAL_ADDRESSES: AddressResult[] = [
  { display_name: "Austin, TX", lat: "30.2672", lon: "-97.7431" },
  { display_name: "Seattle, WA", lat: "47.6062", lon: "-122.3321" },
  { display_name: "San Francisco, CA", lat: "37.7749", lon: "-122.4194" },
  { display_name: "New York, NY", lat: "40.7128", lon: "-74.0060" },
  { display_name: "Miami, FL", lat: "25.7617", lon: "-80.1918" },
  { display_name: "Chicago, IL", lat: "41.8781", lon: "-87.6298" },
  { display_name: "Denver, CO", lat: "39.7392", lon: "-104.9903" },
  { display_name: "Phoenix, AZ", lat: "33.4484", lon: "-112.0740" },
  { display_name: "Atlanta, GA", lat: "33.7490", lon: "-84.3880" },
  { display_name: "Boston, MA", lat: "42.3601", lon: "-71.0589" },
];

const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.0041,
  AZ: 0.0058,
  CA: 0.0076,
  CO: 0.0051,
  FL: 0.0091,
  GA: 0.0098,
  IL: 0.0189,
  MA: 0.0103,
  NY: 0.0147,
  TX: 0.016,
  WA: 0.0084,
};

const HIGH_GROWTH_MARKETS = ["austin", "phoenix", "miami", "denver", "seattle"];

function normalizeLocationName(location: string) {
  const trimmed = location.trim();
  if (!trimmed) return "United States";
  const match = LOCAL_ADDRESSES.find((addr) =>
    addr.display_name.toLowerCase().includes(trimmed.toLowerCase())
  );
  return match ? match.display_name : trimmed;
}

function estimatePropertyTaxRate(location: string) {
  const state = extractStateCode(location);
  if (state && STATE_TAX_RATES[state]) {
    return STATE_TAX_RATES[state];
  }
  return 0.012;
}

function estimateAppreciationRate(location: string) {
  const lower = location.toLowerCase();
  if (HIGH_GROWTH_MARKETS.some((market) => lower.includes(market))) {
    return 0.055;
  }
  return 0.04;
}

function estimateStockCagr(benchmark: string) {
  const normalized = benchmark.toUpperCase();
  switch (normalized) {
    case "QQQ":
      return 0.11;
    case "DIA":
      return 0.075;
    case "SPY":
    default:
      return 0.09;
  }
}

function extractStateCode(location: string) {
  const match = location.toUpperCase().match(/\b([A-Z]{2})\b/);
  return match ? match[1] : null;
}

function pickStartDate(dates: string[], requested: string) {
  const requestedDate = requested.trim();
  for (const date of dates) {
    if (date <= requestedDate) {
      return date;
    }
  }
  return dates[dates.length - 1];
}

function yearDiff(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

function fallbackStockCagr(ticker: string, startDate: string, reason: string): StockCagrResult {
  const fallbackCagr = estimateStockCagr(ticker);
  const today = new Date().toISOString().slice(0, 10);
  return {
    stockCAGR: fallbackCagr,
    stockStartPrice: 0,
    stockEndPrice: 0,
    stockStartDate: startDate,
    stockEndDate: today,
    dataSource: `Fallback (${reason})`,
  };
}
