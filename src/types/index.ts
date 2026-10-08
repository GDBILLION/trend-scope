export interface TrendSearchParams {
  geo?: string; // e.g. 'NG', 'US', '' or undefined for Worldwide
  date?: string; // e.g. 'today 12-m', 'now 1-H', 'today 3-m', 'all', or 'YYYY-MM-DD YYYY-MM-DD'
  cat?: number; // Google Trends category ID (0 for all categories)
  gprop?: string; // '' (web), 'images', 'news', 'froogle', 'youtube'
}

export interface ActiveSearchParams {
  niche: string;
  locationLabel: string;
  locationCode: string;
  timeRangeLabel: string;
  timeRangeValue: string;
  categoryLabel: string;
  categoryId: number;
  searchTypeLabel: string;
  searchTypeValue: string;
}

export interface NicheRequest {
  niche: string;
  location?: string;
  timeRange?: string;
  customStartDate?: string;
  customEndDate?: string;
  category?: number;
  searchType?: string;
}

export interface CandidateOpportunity {
  name: string;
  search_query?: string;
  category: string;
  target_customer: string;
  opportunity_angle: string;
}

export interface GoogleTrendsTimelinePoint {
  date: string;
  value: number;
}

export interface GoogleTrendsRegionalPoint {
  geoName: string;
  value: number;
}

export interface GoogleTrendsRelatedQuery {
  query: string;
  value: string | number;
  isRising: boolean;
}

export interface TrendEvidence {
  source: 'Google Trends (SerpApi)';
  queryUsed: string;
  currentInterest: number; // 0-100 indexed relative search interest
  peakInterest: number;
  historicalAverage: number;
  growthRate: number; // Calculated % change
  momentum: 'Surging' | 'Rising' | 'Stable' | 'Declining';
  topRegion?: string;
  topRegionScore?: number;
  timeline: GoogleTrendsTimelinePoint[];
  relatedQueries: GoogleTrendsRelatedQuery[];
  validatedAt: string;
}

export interface OpportunityBrief {
  title: string; // Product idea or trending opportunity
  whoThisIsFor: string; // target customer
  painInPlainLanguage: string; // Problem that is solved by the product idea or trending opportunity
  whyTheyPayToday: string; // Buying motivation for target customer
  productAngle: string; // Opportunity
  marketRegion: string; // Localization(that is, country location or global)
  googleTrendEvidence: string; // Why the opportunity exists
  differentiationOpportunity: string; // What could make it stand out
  confidencePercentage: number; // in percentage form e.g. 85
  uncertaintyPercentage: number; // in percentage form e.g. 15
}

export interface ValidatedOpportunity {
  rank: number;
  id: string;
  title: string;
  category: string;
  opportunityScore: number; // Transparent weighted score 0-100
  trendStrength: 'Very High' | 'High' | 'Moderate' | 'Emerging';
  growth: string;
  growthNum: number;
  momentum: 'Surging' | 'Rising' | 'Stable' | 'Declining';
  location?: string;
  explanation: string;
  targetCustomer: string;
  opportunityAngle: string;
  evidence: TrendEvidence;
  hasSufficientEvidence: boolean;
  brief?: OpportunityBrief;
}

export const getOpportunityBrief = (opportunity: ValidatedOpportunity): OpportunityBrief => {
  if (opportunity.brief) {
    return opportunity.brief;
  }

  const confidence = Math.min(95, Math.max(55, Math.round(opportunity.opportunityScore * 0.95 + 4)));
  const uncertainty = 100 - confidence;

  return {
    title: opportunity.title,
    whoThisIsFor: opportunity.targetCustomer,
    painInPlainLanguage: `Struggling with recurring friction, discomfort, or inefficiencies in ${opportunity.category}, needing a dependable and targeted alternative.`,
    whyTheyPayToday: `Immediate relief from daily pain points, time loss, or financial friction, where the ongoing cost of inaction exceeds the solution cost.`,
    productAngle: opportunity.opportunityAngle,
    marketRegion: opportunity.location || 'Worldwide / Global Market',
    googleTrendEvidence: `Relative search interest index of ${opportunity.evidence.currentInterest}/100 with ${opportunity.growth} momentum (${opportunity.momentum}) over the timeline, demonstrating verified buyer demand on Google Trends.`,
    differentiationOpportunity: `Specialized positioning with streamlined user experience, verified outcomes, and zero-friction adoption compared to generic legacy market options.`,
    confidencePercentage: confidence,
    uncertaintyPercentage: uncertainty,
  };
};

export interface ProviderStatus {
  serpApiConfigured: boolean;
  groqConfigured: boolean;
  geminiConfigured: boolean;
  activeAiProvider: string;
  groqModel: string;
}

export interface NicheAnalysisResponse {
  niche: string;
  timestamp: string;
  totalCandidatesGenerated: number;
  totalCandidatesValidated: number;
  excludedCandidatesCount: number;
  results: ValidatedOpportunity[];
  unvalidatedCandidates?: Array<{ name: string; reason: string }>;
  providerInfo: ProviderStatus;
  activeParams?: ActiveSearchParams;
}

// 30 Predefined Niches
export const PREDEFINED_NICHES: string[] = [
  'Weight loss',
  'Chronic back pain',
  'Sciatica nerve pain',
  'Knee pain walking',
  'Shoulder impingement',
  'Plantar fasciitis',
  'Carpal tunnel',
  'Healing after relationship',
  'TMJ jaw pain',
  'Chronic fatigue',
  'Brain fog',
  'Insomnia solutions',
  'Restless leg syndrome',
  'Tinnitus relief',
  'Dizziness',
  'Gut issues',
  'Acid reflux',
  'Chronic headaches',
  'Neuropathy',
  'Arthritis pain',
  'Post-surgery recovery',
  'Chronic constipation',
  'Menopause symptoms',
  'Low testosterone',
  'Thyroid issues',
  'Autoimmune flares',
  'Beer belly',
  'Love handles',
  'Double chin',
  'Cellulite',
];

// Locations / Countries supported by Google Trends & SerpApi
export interface LocationOption {
  code: string; // '' for worldwide, or 2-letter ISO code
  name: string;
}

export const LOCATION_OPTIONS: LocationOption[] = [
  { code: 'WORLDWIDE', name: 'Worldwide' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'MX', name: 'Mexico' },
  { code: 'JP', name: 'Japan' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'EG', name: 'Egypt' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'PL', name: 'Poland' },
  { code: 'TR', name: 'Turkey' },
];

// Time Range Options mapping to SerpApi/Google Trends 'date' parameter
export interface TimeRangeOption {
  id: string;
  label: string;
  serpApiParam: string;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { id: 'past_hour', label: 'Past hour', serpApiParam: 'now 1-H' },
  { id: 'past_4_hours', label: 'Past 4 hours', serpApiParam: 'now 4-H' },
  { id: 'past_day', label: 'Past day', serpApiParam: 'now 1-d' },
  { id: 'past_7_days', label: 'Past 7 days', serpApiParam: 'now 7-d' },
  { id: 'past_30_days', label: 'Past 30 days', serpApiParam: 'today 1-m' },
  { id: 'past_90_days', label: 'Past 90 days', serpApiParam: 'today 3-m' },
  { id: 'past_12_months', label: 'Past 12 months', serpApiParam: 'today 12-m' },
  { id: 'past_5_years', label: 'Past 5 years', serpApiParam: 'today 5-y' },
  { id: '2004_present', label: '2004–present', serpApiParam: 'all' },
  { id: 'custom', label: 'Custom date range', serpApiParam: 'custom' },
];

// Google Trends Categories (official category IDs)
export interface CategoryOption {
  id: number;
  name: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 0, name: 'All categories' },
  { id: 3, name: 'Arts & Entertainment' },
  { id: 47, name: 'Autos & Vehicles' },
  { id: 44, name: 'Beauty & Fitness' },
  { id: 22, name: 'Books & Literature' },
  { id: 12, name: 'Business & Industrial' },
  { id: 5, name: 'Computers & Electronics' },
  { id: 7, name: 'Finance' },
  { id: 71, name: 'Food & Drink' },
  { id: 8, name: 'Games' },
  { id: 45, name: 'Health' },
  { id: 11, name: 'Home & Garden' },
  { id: 13, name: 'Internet & Telecom' },
  { id: 95, name: 'Jobs & Education' },
  { id: 19, name: 'Law & Government' },
  { id: 16, name: 'News' },
  { id: 299, name: 'Online Communities' },
  { id: 14, name: 'People & Society' },
  { id: 66, name: 'Pets & Animals' },
  { id: 29, name: 'Real Estate' },
  { id: 533, name: 'Reference' },
  { id: 174, name: 'Science' },
  { id: 18, name: 'Shopping' },
  { id: 20, name: 'Sports' },
  { id: 67, name: 'Travel' },
];

// Search Types mapping to SerpApi/Google Trends 'gprop' property
export interface SearchTypeOption {
  id: string;
  name: string;
  gprop: string;
}

export const SEARCH_TYPE_OPTIONS: SearchTypeOption[] = [
  { id: 'web', name: 'Web Search', gprop: '' },
  { id: 'images', name: 'Image Search', gprop: 'images' },
  { id: 'news', name: 'News Search', gprop: 'news' },
  { id: 'froogle', name: 'Google Shopping', gprop: 'froogle' },
  { id: 'youtube', name: 'YouTube Search', gprop: 'youtube' },
];
