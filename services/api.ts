import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// OpenSource API: Nominatim (OpenStreetMap)
export interface AddressResult {
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchAddress(query: string): Promise<AddressResult[]> {
  if (query.length < 3) return [];
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=us`
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    console.error("Nominatim error:", e);
    return [];
  }
}

// Gemini API: Financial Context Analysis
export async function analyzeMarket(location: string, benchmark: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: `Analyze the investment market for location: "${location}" and stock benchmark: "${benchmark}". 
      Provide:
      1. Estimated annual Property Tax Rate for this specific county/state (decimal, e.g., 0.012 for 1.2%).
      2. Estimated annual Property Appreciation Rate based on recent historical trends for this area (decimal, e.g., 0.04).
      3. 10-Year historical CAGR for the ticker ${benchmark} (decimal, e.g., 0.10).
      4. A short "Market Vibe" summary (max 10 words).
      5. The normalized Location Name (City, State).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            propertyTaxRate: { type: Type.NUMBER, description: "Decimal annual tax rate" },
            propertyAppreciationRate: { type: Type.NUMBER, description: "Decimal annual appreciation rate" },
            stockCAGR: { type: Type.NUMBER, description: "Decimal annual stock growth rate" },
            marketVibe: { type: Type.STRING, description: "Short market summary" },
            locationName: { type: Type.STRING, description: "City, State" },
          },
          required: ["propertyTaxRate", "propertyAppreciationRate", "stockCAGR", "locationName"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback defaults if AI fails
    return {
      propertyTaxRate: 0.012,
      propertyAppreciationRate: 0.05,
      stockCAGR: 0.08,
      marketVibe: "Using national averages",
      locationName: location,
    };
  }
}