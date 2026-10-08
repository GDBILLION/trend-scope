import {
  TrendEvidence,
  GoogleTrendsTimelinePoint,
  GoogleTrendsRelatedQuery,
  GoogleTrendsRegionalPoint,
  TrendSearchParams,
} from '../../src/types/index.js';

export interface TrendsProvider {
  name: string;
  getTrendData(
    keyword: string,
    directSearchQuery?: string,
    searchParams?: TrendSearchParams
  ): Promise<TrendEvidence | null>;
}

interface SerpApiTimelineItem {
  date?: string;
  values?: Array<{
    query?: string;
    value?: string | number;
    extracted_value?: number;
  }>;
}

interface SerpApiRegionItem {
  geo_name?: string;
  location?: string;
  value?: string | number;
  extracted_value?: number;
}

interface SerpApiQueryItem {
  query?: string;
  value?: string | number;
  extracted_value?: number;
}

interface SerpApiResponse {
  interest_over_time?: {
    timeline_data?: SerpApiTimelineItem[];
    averages?: Array<{ query?: string; value?: number }>;
  };
  interest_by_region?: SerpApiRegionItem[];
  related_queries?: {
    top?: SerpApiQueryItem[];
    rising?: SerpApiQueryItem[];
  };
  search_metadata?: {
    status?: string;
  };
  error?: string;
}

export class SerpApiTrendsProvider implements TrendsProvider {
  public readonly name = 'SerpApi (Google Trends Engine)';
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPAPI_API_KEY;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Normalizes long verbose commercial opportunity titles into concise
   * 2-3 word search terms that Google Trends actually recognizes.
   */
  public static cleanSearchQuery(raw: string): string {
    // 1. Lowercase and replace hyphens, underscores, slashes with spaces
    let text = raw.toLowerCase().replace(/[-_/]/g, ' ');

    // 2. Remove filler words, suffixes, and stop words that cause Google Trends zero-results
    const stopWords = new Set([
      'powered',
      'systems',
      'system',
      'retrofit',
      'unit',
      'units',
      'kit',
      'kits',
      'platform',
      'platforms',
      'solution',
      'solutions',
      'for',
      'indoor',
      'outdoor',
      'use',
      'the',
      'and',
      'with',
      'based',
      'station',
      'stations',
      'service',
      'services',
      'device',
      'devices',
      'app',
      'hub',
      'dock',
      'docking',
    ]);

    const words = text
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ''))
      .filter((w) => w.length > 1 && !stopWords.has(w));

    if (words.length === 0) {
      return raw.replace(/[-_/]/g, ' ').trim().slice(0, 30);
    }

    // Google Trends performs best with 2 to 3 words max
    return words.slice(0, 3).join(' ');
  }

  /**
   * Generates a 2-word core stem query as a fallback if the 3-word query has no volume
   */
  public static coreStemQuery(raw: string): string {
    const cleaned = this.cleanSearchQuery(raw);
    const words = cleaned.split(/\s+/);
    if (words.length <= 2) return cleaned;
    return words.slice(0, 2).join(' ');
  }

  public async getTrendData(
    keyword: string,
    directSearchQuery?: string,
    searchParams?: TrendSearchParams
  ): Promise<TrendEvidence | null> {
    if (!this.apiKey) {
      console.warn(`[SerpApi] SERPAPI_API_KEY not configured. Cannot query Google Trends.`);
      return null;
    }

    // Prepare search term candidates in priority order
    const queryCandidates: string[] = [];

    // 1. Direct search query if provided by AI
    if (directSearchQuery && directSearchQuery.trim().length > 1) {
      queryCandidates.push(directSearchQuery.trim());
    }

    // 2. Cleaned 2-3 word term
    const cleaned = SerpApiTrendsProvider.cleanSearchQuery(keyword);
    if (cleaned && !queryCandidates.includes(cleaned)) {
      queryCandidates.push(cleaned);
    }

    // 3. Core 2-word stem fallback
    const stem = SerpApiTrendsProvider.coreStemQuery(keyword);
    if (stem && !queryCandidates.includes(stem)) {
      queryCandidates.push(stem);
    }

    // 4. Raw keyword as last attempt if short
    const rawClean = keyword.trim().replace(/[-_/]/g, ' ');
    if (rawClean.split(/\s+/).length <= 3 && !queryCandidates.includes(rawClean)) {
      queryCandidates.push(rawClean);
    }

    // Try candidates sequentially until one returns valid Google Trends data
    for (const query of queryCandidates) {
      try {
        const data = await this.fetchSerpApi(query, searchParams);

        if (!data) continue;

        if (data.error) {
          // If Google Trends explicitly reports "no results" for this query, try the next fallback silently
          if (
            data.error.includes("hasn't returned any results") ||
            data.error.includes('no results') ||
            data.error.includes('not enough data')
          ) {
            console.log(`[SerpApi] Low/zero search volume for query "${query}". Trying fallback...`);
            continue;
          }

          // Other errors (e.g. rate limit, invalid key)
          console.warn(`[SerpApi] API notice for "${query}":`, data.error);
          return null;
        }

        const evidence = this.parseSerpApiResponse(query, data, searchParams);
        if (evidence) {
          return evidence;
        }
      } catch (err: any) {
        console.error(`[SerpApi] Request failed for query "${query}":`, err?.message || err);
      }
    }

    console.log(`[SerpApi] Insufficient Google Trends search volume for "${keyword}" across all query variants.`);
    return null;
  }

  private async fetchSerpApi(query: string, searchParams?: TrendSearchParams): Promise<SerpApiResponse | null> {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google_trends');
    url.searchParams.set('q', query);

    // 1. Time range (date parameter)
    if (searchParams?.date && searchParams.date.trim().length > 0) {
      url.searchParams.set('date', searchParams.date.trim());
    } else {
      url.searchParams.set('date', 'today 12-m'); // Default past 12 months
    }

    // 2. Geographic Location (geo parameter)
    // Only pass if defined and not WORLDWIDE
    if (
      searchParams?.geo &&
      searchParams.geo.trim().length > 0 &&
      searchParams.geo.toUpperCase() !== 'WORLDWIDE'
    ) {
      url.searchParams.set('geo', searchParams.geo.trim().toUpperCase());
    }

    // 3. Category ID (cat parameter)
    if (typeof searchParams?.cat === 'number' && searchParams.cat > 0) {
      url.searchParams.set('cat', String(searchParams.cat));
    }

    // 4. Search type property (gprop parameter)
    // Only pass if defined and not empty (empty = Web search)
    if (searchParams?.gprop && searchParams.gprop.trim().length > 0) {
      url.searchParams.set('gprop', searchParams.gprop.trim());
    }

    url.searchParams.set('api_key', this.apiKey!.trim());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TrendScope-MVP/1.0',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SerpApi] HTTP ${response.status} for query "${query}":`, errorText);
      return null;
    }

    return (await response.json()) as SerpApiResponse;
  }

  private parseSerpApiResponse(
    queryUsed: string,
    data: SerpApiResponse,
    searchParams?: TrendSearchParams
  ): TrendEvidence | null {
    const rawTimeline = data.interest_over_time?.timeline_data;

    if (!rawTimeline || !Array.isArray(rawTimeline) || rawTimeline.length === 0) {
      return null;
    }

    // Extract numerical timeline points
    const timeline: GoogleTrendsTimelinePoint[] = [];
    for (const item of rawTimeline) {
      const dateStr = item.date || '';
      const valObj = item.values?.[0];
      const numVal =
        typeof valObj?.extracted_value === 'number'
          ? valObj.extracted_value
          : parseInt(String(valObj?.value || '0'), 10) || 0;

      timeline.push({
        date: dateStr,
        value: Math.max(0, Math.min(100, numVal)),
      });
    }

    // Filter out timelines with 0 total activity
    const totalActivity = timeline.reduce((acc, curr) => acc + curr.value, 0);
    if (totalActivity === 0) {
      return null;
    }

    // Calculate real metrics without hallucination
    // Recent interest: average of last 4 data points (or last 25% of timeline)
    const recentCount = Math.max(2, Math.min(8, Math.floor(timeline.length * 0.25)));
    const recentSlice = timeline.slice(-recentCount);
    const recentAvg = Math.round(
      recentSlice.reduce((sum, p) => sum + p.value, 0) / recentSlice.length
    );

    // Baseline interest: average of earliest 50%
    const baselineSlice = timeline.slice(0, Math.floor(timeline.length * 0.5));
    const baselineAvg = Math.round(
      baselineSlice.reduce((sum, p) => sum + p.value, 0) / Math.max(baselineSlice.length, 1)
    );

    // Peak interest in the timeline
    const peakInterest = Math.max(...timeline.map((p) => p.value));

    // Historical average over entire timeline
    const historicalAverage = Math.round(totalActivity / timeline.length);

    // Growth calculation
    let growthRate = 0;
    if (baselineAvg > 0) {
      growthRate = Math.round(((recentAvg - baselineAvg) / baselineAvg) * 100);
    } else if (recentAvg > 0) {
      growthRate = 100; // Emerging from zero baseline
    }

    // Real momentum classification
    let momentum: 'Surging' | 'Rising' | 'Stable' | 'Declining' = 'Stable';
    if (growthRate >= 35) {
      momentum = 'Surging';
    } else if (growthRate >= 12) {
      momentum = 'Rising';
    } else if (growthRate <= -15) {
      momentum = 'Declining';
    } else {
      momentum = 'Stable';
    }

    // Top Region from interest_by_region
    let topRegion: string | undefined;
    let topRegionScore: number | undefined;

    if (data.interest_by_region && Array.isArray(data.interest_by_region) && data.interest_by_region.length > 0) {
      const firstReg = data.interest_by_region[0];
      topRegion = firstReg.geo_name || firstReg.location;
      topRegionScore =
        typeof firstReg.extracted_value === 'number'
          ? firstReg.extracted_value
          : parseInt(String(firstReg.value || '0'), 10) || undefined;
    }

    // Related queries
    const relatedQueries: GoogleTrendsRelatedQuery[] = [];
    if (data.related_queries?.rising && Array.isArray(data.related_queries.rising)) {
      for (const q of data.related_queries.rising.slice(0, 5)) {
        if (q.query) {
          relatedQueries.push({
            query: q.query,
            value: q.value ?? '',
            isRising: true,
          });
        }
      }
    }

    if (data.related_queries?.top && Array.isArray(data.related_queries.top)) {
      for (const q of data.related_queries.top.slice(0, 5)) {
        if (q.query && !relatedQueries.some((rq) => rq.query === q.query)) {
          relatedQueries.push({
            query: q.query,
            value: q.value ?? '',
            isRising: false,
          });
        }
      }
    }

    return {
      source: 'Google Trends (SerpApi)',
      queryUsed,
      currentInterest: recentAvg,
      peakInterest,
      historicalAverage,
      growthRate,
      momentum,
      topRegion,
      topRegionScore,
      timeline,
      relatedQueries,
      validatedAt: new Date().toISOString(),
    };
  }
}
