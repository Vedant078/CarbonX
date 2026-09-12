import { CarbonListing, ApplicationType } from '@/types';
import { calculateMatch } from './matching';

export interface AIQueryResult {
  extractedParams: {
    quantity?: number;
    location?: string;
    purity?: number;
    application?: ApplicationType;
    maxPrice?: number;
    sourceType?: string;
  };
  summaryText: string;
  topMatches: {
    listing: CarbonListing;
    score: number;
    logisticsCost: number;
    distanceKm: number;
  }[];
}

export function parseAIQuery(query: string, availableListings: CarbonListing[]): AIQueryResult {
  const q = query.toLowerCase();

  // Extract parameters from natural language
  let quantity: number | undefined;
  let location: string | undefined;
  let purity: number | undefined;
  let application: ApplicationType | undefined = 'Synthetic Fuel';
  let maxPrice: number | undefined;
  let sourceType: string | undefined;

  // 1. Quantity extraction (e.g., 300 tonnes, 500t, 300 tonnes/month)
  const qtyMatch = q.match(/(\d+)\s*(t|tonnes|tonne|tons)/);
  if (qtyMatch) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // 2. Purity extraction (e.g., 99%, 99.2%, 99%+ purity)
  const purityMatch = q.match(/(\d+(\.\d+)?)\s*%/);
  if (purityMatch) {
    purity = parseFloat(purityMatch[1]);
  }

  // 3. Location extraction (e.g. Pune, Mumbai, Gujarat, Ahmedabad, Nashik)
  if (q.includes('pune')) location = 'Pune';
  else if (q.includes('mumbai')) location = 'Mumbai';
  else if (q.includes('gujarat')) location = 'Gujarat';
  else if (q.includes('ahmedabad')) location = 'Ahmedabad';
  else if (q.includes('nashik')) location = 'Nashik';

  // 4. Application extraction
  if (q.includes('synthetic fuel') || q.includes('fuel') || q.includes('e-fuel')) application = 'Synthetic Fuel';
  else if (q.includes('concrete') || q.includes('building') || q.includes('construction') || q.includes('materials')) application = 'Construction';
  else if (q.includes('greenhouse') || q.includes('agri')) application = 'Greenhouse';
  else if (q.includes('algae')) application = 'Algae';
  else if (q.includes('chemical')) application = 'Chemicals';

  // 5. Source extraction
  if (q.includes('steel')) sourceType = 'Steel';
  else if (q.includes('cement')) sourceType = 'Cement';
  else if (q.includes('power')) sourceType = 'Power';
  else if (q.includes('chemical')) sourceType = 'Chemical';

  // 6. Price extraction (e.g. under 5000, max 4500)
  const priceMatch = q.match(/(under|below|max|rs|₹)\s*(\d+)/);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[2], 10);
  }

  // Create temporary synthetic buyer requirement for scoring
  const synthRequirement = {
    id: 'ai-req-temp',
    buyer_id: 'buyer-1',
    buyer_name: 'AI Search Query',
    title: 'AI Custom Requirement',
    application: application || 'Synthetic Fuel',
    required_quantity: quantity || 300,
    required_purity: purity || 99.0,
    location: location || 'Pune, Maharashtra',
    latitude: location?.includes('Mumbai') ? 19.076 : location?.includes('Ahmedabad') ? 23.0225 : 18.5204, // Pune lat
    longitude: location?.includes('Mumbai') ? 72.8777 : location?.includes('Ahmedabad') ? 72.5714 : 73.8567, // Pune lon
    max_distance: 300,
    max_price: maxPrice || 5500,
    frequency: 'Monthly',
    status: 'ACTIVE' as const,
    created_at: new Date().toISOString(),
  };

  // Rank available listings using the deterministic matching engine
  const ranked = availableListings
    .map((listing) => {
      const match = calculateMatch(listing, synthRequirement);
      return {
        listing,
        score: match.score,
        logisticsCost: 18500,
        distanceKm: listing.location.includes('Mumbai') ? 150 : 220,
      };
    })
    .sort((a, b) => b.score - a.score);

  const topMatches = ranked.slice(0, 3);

  const summaryParts: string[] = [];
  if (quantity) summaryParts.push(`${quantity} t/month required`);
  if (purity) summaryParts.push(`${purity}% min purity`);
  if (location) summaryParts.push(`near ${location}`);
  if (application) summaryParts.push(`for ${application}`);

  const summaryText = summaryParts.length > 0
    ? `Extracted parameters: ${summaryParts.join(' • ')}`
    : 'Showing recommended matches based on your natural language search';

  return {
    extractedParams: {
      quantity,
      location,
      purity,
      application,
      maxPrice,
      sourceType,
    },
    summaryText,
    topMatches,
  };
}
