export interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
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
  const stockCAGR = estimateStockCagr(benchmark);

  return {
    propertyTaxRate,
    propertyAppreciationRate,
    stockCAGR,
    marketVibe: "Local estimate based on defaults",
    locationName,
  };
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
