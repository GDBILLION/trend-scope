import {
  CandidateOpportunity,
  TrendEvidence,
  ValidatedOpportunity,
} from '../../src/types/index.js';

export class ScoringService {
  /**
   * Transparent scoring formula combining relative search interest, verified
   * momentum, search velocity, and regional market concentration.
   */
  public static calculateOpportunityScore(evidence: TrendEvidence): number {
    // 1. Current Relative Interest (0 - 35 points)
    const interestScore = (Math.min(100, Math.max(0, evidence.currentInterest)) / 100) * 35;

    // 2. Verified Momentum / Growth (0 - 30 points)
    let momentumScore = 0;
    if (evidence.growthRate >= 60) {
      momentumScore = 30;
    } else if (evidence.growthRate >= 30) {
      momentumScore = 25;
    } else if (evidence.growthRate >= 10) {
      momentumScore = 20;
    } else if (evidence.growthRate >= 0) {
      momentumScore = 15;
    } else if (evidence.growthRate >= -20) {
      momentumScore = 8;
    } else {
      momentumScore = 3;
    }

    // 3. Peak Search Interest (0 - 15 points)
    const peakScore = (Math.min(100, Math.max(0, evidence.peakInterest)) / 100) * 15;

    // 4. Regional Interest Concentration (0 - 10 points)
    let regionalScore = 0;
    if (evidence.topRegion) {
      const topScore = evidence.topRegionScore || 60;
      regionalScore = Math.min(10, Math.round((topScore / 100) * 10));
    }

    // 5. Related Search Queries & Rising Velocity (0 - 10 points)
    let queriesScore = 0;
    if (evidence.relatedQueries && evidence.relatedQueries.length > 0) {
      const risingCount = evidence.relatedQueries.filter((q) => q.isRising).length;
      queriesScore = Math.min(10, evidence.relatedQueries.length * 2 + risingCount * 3);
    }

    const total = Math.round(interestScore + momentumScore + peakScore + regionalScore + queriesScore);
    return Math.max(1, Math.min(99, total));
  }

  public static deriveTrendStrength(currentInterest: number): 'Very High' | 'High' | 'Moderate' | 'Emerging' {
    if (currentInterest >= 65) return 'Very High';
    if (currentInterest >= 40) return 'High';
    if (currentInterest >= 20) return 'Moderate';
    return 'Emerging';
  }

  public static rankAndFilterOpportunities(
    candidates: Array<{
      candidate: CandidateOpportunity;
      evidence: TrendEvidence | null;
      explanation?: string;
      targetCustomer?: string;
      opportunityAngle?: string;
    }>
  ): {
    validated: ValidatedOpportunity[];
    unvalidated: Array<{ name: string; reason: string }>;
  } {
    const validatedList: ValidatedOpportunity[] = [];
    const unvalidatedList: Array<{ name: string; reason: string }> = [];

    for (const item of candidates) {
      if (!item.evidence || item.evidence.timeline.length === 0) {
        unvalidatedList.push({
          name: item.candidate.name,
          reason: 'Insufficient Google Trends search interest over the selected period.',
        });
        continue;
      }

      const score = this.calculateOpportunityScore(item.evidence);
      const trendStrength = this.deriveTrendStrength(item.evidence.currentInterest);
      const growthStr =
        item.evidence.growthRate > 0
          ? `+${item.evidence.growthRate}%`
          : `${item.evidence.growthRate}%`;

      validatedList.push({
        rank: 0, // Assigned after sorting
        id: `opp-${Math.random().toString(36).substring(2, 9)}`,
        title: item.candidate.name,
        category: item.candidate.category || 'Niche Opportunity',
        opportunityScore: score,
        trendStrength,
        growth: growthStr,
        growthNum: item.evidence.growthRate,
        momentum: item.evidence.momentum,
        location: item.evidence.topRegion || undefined,
        explanation: item.explanation || `Demonstrating relative search interest index of ${item.evidence.currentInterest}/100 with ${growthStr} momentum in Google Trends.`,
        targetCustomer: item.targetCustomer || item.candidate.target_customer || 'Target buyers in this niche',
        opportunityAngle: item.opportunityAngle || item.candidate.opportunity_angle || 'Capitalizing on growing relative search volume',
        evidence: item.evidence,
        hasSufficientEvidence: true,
      });
    }

    // Rank primarily by Opportunity Score descending
    validatedList.sort((a, b) => b.opportunityScore - a.opportunityScore);

    // Assign 1-indexed ranks
    validatedList.forEach((item, index) => {
      item.rank = index + 1;
    });

    return {
      validated: validatedList,
      unvalidated: unvalidatedList,
    };
  }
}
