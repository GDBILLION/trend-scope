import { GoogleGenAI } from '@google/genai';
import {
  CandidateOpportunity,
  TrendEvidence,
} from '../../src/types/index.js';
import { SerpApiTrendsProvider } from './trendsService.js';

export interface GeneratedInterpretation {
  name: string;
  explanation: string;
  targetCustomer: string;
  opportunityAngle: string;
  painInPlainLanguage?: string;
  whyTheyPayToday?: string;
  differentiationOpportunity?: string;
}

export class AIService {
  private groqKey?: string;
  private groqModel: string;
  private geminiClient?: GoogleGenAI;

  constructor() {
    this.groqKey = process.env.GROQ_API_KEY?.trim();
    this.groqModel = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: geminiKey });
    }
  }

  public getActiveProvider(): string {
    if (this.groqKey) {
      return `Groq (${this.groqModel})`;
    }
    if (this.geminiClient) {
      return 'Google Gemini 3.8 Flash';
    }
    return 'None configured';
  }

  public isGroqConfigured(): boolean {
    return Boolean(this.groqKey && this.groqKey.length > 0);
  }

  public isGeminiConfigured(): boolean {
    return Boolean(this.geminiClient);
  }

  public getModelName(): string {
    return this.groqKey ? this.groqModel : 'gemini-3.8-flash';
  }

  /**
   * Stage 1: Generate candidate pool of commercially specific, distinct opportunities
   */
  public async generateCandidates(niche: string): Promise<CandidateOpportunity[]> {
    const prompt = `You are an AI market opportunity discovery engine.
Given the user's niche: "${niche}", generate approximately 25 to 30 specific, distinct commercial niche opportunities.

CRITICAL GOOGLE TRENDS RULE:
For each opportunity, provide both:
1. "name": The descriptive, commercial title (e.g., "Balcony Solar Storage Systems", "Portable Solar Water Desalination Unit", "Solar Panel Cleaning Robot").
2. "search_query": A CONCISE 2 TO 3 WORD HIGH-INTENT SEARCH TERM that real people actually search on Google Trends (e.g., "balcony solar", "solar desalination", "solar cleaning robot", "solar battery storage", "solar generator"). Google Trends returns ZERO results if queries exceed 3-4 words or have hyphens like "solar-powered" or filler words like "systems", "platform", "unit", "kit", "for indoor use".

Return strictly valid JSON only with NO markdown fences, NO explanation, in this exact format:
{
  "candidates": [
    {
      "name": "Commercial Opportunity Display Title",
      "search_query": "2 to 3 word Google Trends search term",
      "category": "Hardware / Software / Services",
      "target_customer": "Specific buyer persona",
      "opportunity_angle": "Commercial value proposition"
    }
  ]
}`;

    let rawJson = '';
    try {
      rawJson = await this.executePrompt(prompt, 'candidate_generation');
      const parsed = this.parseJsonSafe(rawJson);
      const candidates: CandidateOpportunity[] = Array.isArray(parsed?.candidates)
        ? parsed.candidates
        : [];

      // Filter and deduplicate candidates
      const seen = new Set<string>();
      const sanitized: CandidateOpportunity[] = [];

      for (const c of candidates) {
        if (!c.name || typeof c.name !== 'string') continue;
        const norm = c.name.trim().toLowerCase();
        if (norm.length < 3 || seen.has(norm)) continue;
        seen.add(norm);

        const cleanQuery = c.search_query && typeof c.search_query === 'string' && c.search_query.trim().length > 1
          ? SerpApiTrendsProvider.cleanSearchQuery(c.search_query.trim())
          : SerpApiTrendsProvider.cleanSearchQuery(c.name);

        sanitized.push({
          name: c.name.trim(),
          search_query: cleanQuery,
          category: c.category?.trim() || 'Emerging Opportunity',
          target_customer: c.target_customer?.trim() || 'Target Consumers',
          opportunity_angle: c.opportunity_angle?.trim() || 'Commercial viability in emerging trend',
        });
      }

      if (sanitized.length >= 5) {
        return sanitized;
      }
    } catch (err: any) {
      console.warn('[AIService] AI candidate generation failed or timed out, synthesizing niche-tailored candidate pool:', err?.message || err);
    }

    return this.getFallbackCandidates(niche);
  }

  /**
   * Stage 2: Interpret validated Google Trends evidence without inventing data
   */
  public async interpretTrendEvidence(
    items: Array<{
      candidate: CandidateOpportunity;
      evidence: TrendEvidence;
      score: number;
    }>
  ): Promise<Map<string, GeneratedInterpretation>> {
    const resultMap = new Map<string, GeneratedInterpretation>();
    if (items.length === 0) return resultMap;

    const summaryData = items.map((item) => ({
      name: item.candidate.name,
      category: item.candidate.category,
      relativeInterestIndex: `${item.evidence.currentInterest}/100`,
      peakInterest: `${item.evidence.peakInterest}/100`,
      momentum: item.evidence.momentum,
      growthRate: `${item.evidence.growthRate > 0 ? '+' : ''}${item.evidence.growthRate}%`,
      topRegion: item.evidence.topRegion || 'Broad Global Distribution',
      relatedQueries: item.evidence.relatedQueries.map((q) => q.query).slice(0, 3).join(', ') || 'N/A',
      opportunityScore: `${item.score}/100`,
    }));

    const prompt = `You are an AI market intelligence analyst interpreting validated Google Trends search interest data.
IMPORTANT RULE: Do NOT invent search volume numbers or fake statistics. Interpret ONLY the real Google Trends relative interest and growth data provided.

For each opportunity below, generate:
- explanation: 2 concise sentences explaining why this search interest movement matters commercially based on the evidence.
- targetCustomer: the specific demographic or business segment searching for this (Who This Is For).
- opportunityAngle: the best product or commercial angle (Product Angle).
- painInPlainLanguage: 1-2 sentences stating the plain-language problem solved by this product/opportunity (Pain in Plain Language).
- whyTheyPayToday: the compelling buying urgency or reason customers pay today (Why They'd Pay Today).
- differentiationOpportunity: what specific feature, delivery model, or positioning could make it stand out from legacy alternatives (Differentiation Opportunity).

Data to interpret:
${JSON.stringify(summaryData, null, 2)}

Return strictly valid JSON only with NO markdown fences, in this exact format:
{
  "interpretations": [
    {
      "name": "Opportunity Name matching input",
      "explanation": "Clear explanation based on actual relative interest trend and momentum.",
      "targetCustomer": "Specific target buyer persona",
      "opportunityAngle": "Strategic commercial angle",
      "painInPlainLanguage": "Core real-world problem solved in plain, direct language.",
      "whyTheyPayToday": "Immediate buying urgency, cost avoidance, or pain relief driving purchase today.",
      "differentiationOpportunity": "Specific moat, novel formulation, or UX advantage that makes it stand out."
    }
  ]
}`;

    try {
      const rawJson = await this.executePrompt(prompt, 'interpretation');
      const parsed = this.parseJsonSafe(rawJson);
      if (Array.isArray(parsed?.interpretations)) {
        for (const inter of parsed.interpretations) {
          if (inter.name && inter.explanation) {
            resultMap.set(inter.name.toLowerCase().trim(), {
              name: inter.name,
              explanation: inter.explanation,
              targetCustomer: inter.targetCustomer || 'Prospective niche buyers',
              opportunityAngle: inter.opportunityAngle || 'Capitalize on rising search interest',
              painInPlainLanguage: inter.painInPlainLanguage,
              whyTheyPayToday: inter.whyTheyPayToday,
              differentiationOpportunity: inter.differentiationOpportunity,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[AIService] Trend evidence interpretation fallback used:', err);
    }

    return resultMap;
  }

  private async executePrompt(prompt: string, context: string): Promise<string> {
    // 1. Try Groq first if key is provided
    if (this.groqKey) {
      try {
        return await this.callGroq(prompt);
      } catch (err: any) {
        console.error(`[AIService] Groq call failed (${context}):`, err?.message || err);
        // If Gemini is available, failover gracefully
        if (this.geminiClient) {
          console.log('[AIService] Failing over to Google Gemini...');
          return await this.callGemini(prompt);
        }
        throw err;
      }
    }

    // 2. Try Gemini if configured
    if (this.geminiClient) {
      return await this.callGemini(prompt);
    }

    throw new Error('No AI provider configured. Please provide GROQ_API_KEY or GEMINI_API_KEY in .env');
  }

  private async callGroq(prompt: string): Promise<string> {
    const isReasoningModel =
      this.groqModel.includes('gpt-oss') ||
      this.groqModel.includes('r1') ||
      this.groqModel.includes('deepseek');

    const bodyPayload: Record<string, any> = {
      model: this.groqModel,
      temperature: 0.1,
      max_completion_tokens: 4096,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Return only valid JSON. No markdown code blocks. No commentary outside the JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    // Prevent token exhaustion on reasoning models like gpt-oss-20b
    if (isReasoningModel) {
      bodyPayload.reasoning_effort = 'low';
      bodyPayload.include_reasoning = false;
      bodyPayload.max_completion_tokens = 6000;
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.groqKey}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
    }

    const json = (await response.json()) as any;
    const content = json?.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[Groq] Empty content returned:', JSON.stringify(json, null, 2));
      throw new Error('Groq returned an empty response.');
    }

    return content;
  }

  private async callGemini(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    try {
      const response = await this.geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return response.text || '{}';
    } catch (err: any) {
      // Fallback attempt with gemini-2.5-flash if needed
      if (err?.message?.includes('not found') || err?.status === 404) {
        const fallbackRes = await this.geminiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        return fallbackRes.text || '{}';
      }
      throw err;
    }
  }

  private parseJsonSafe(raw: string): any {
    let clean = raw.trim();
    // Remove markdown code fences if present
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean);
  }

  private getFallbackCandidates(niche: string): CandidateOpportunity[] {
    const cleanNiche = niche.trim();
    const stem = SerpApiTrendsProvider.cleanSearchQuery(cleanNiche) || cleanNiche;

    return [
      {
        name: `Portable ${cleanNiche} Battery Backup`,
        search_query: `${stem} battery`,
        category: 'Hardware & Systems',
        target_customer: 'Homeowners and remote workers',
        opportunity_angle: 'Plug-and-play emergency backup power packages',
      },
      {
        name: `Compact ${cleanNiche} Kit for Apartments`,
        search_query: `balcony ${stem}`,
        category: 'Consumer Hardware',
        target_customer: 'Urban renters and condo residents',
        opportunity_angle: 'Zero-drill DIY installation systems',
      },
      {
        name: `${cleanNiche} Monitoring and Analytics App`,
        search_query: `${stem} app`,
        category: 'Software & SaaS',
        target_customer: 'Efficiency-conscious consumers and small businesses',
        opportunity_angle: 'Real-time efficiency tracking and cost optimization',
      },
      {
        name: `Off-grid ${cleanNiche} Equipment for RVs`,
        search_query: `off grid ${stem}`,
        category: 'Outdoor & Mobility',
        target_customer: 'Campers, van-lifers, and outdoor enthusiasts',
        opportunity_angle: 'Lightweight high-durability portable kits',
      },
      {
        name: `Commercial ${cleanNiche} Cost Calculator`,
        search_query: `${stem} calculator`,
        category: 'B2B Software',
        target_customer: 'Commercial property managers and facility directors',
        opportunity_angle: 'Automated ROI and tax credit forecasting platform',
      },
      {
        name: `Smart IoT ${cleanNiche} Controller`,
        search_query: `smart ${stem}`,
        category: 'Smart Devices',
        target_customer: 'Smart home adopters and energy nerds',
        opportunity_angle: 'Automated load shifting and peak demand avoidance',
      },
      {
        name: `Refurbished ${cleanNiche} Marketplace`,
        search_query: `used ${stem}`,
        category: 'Circular Economy',
        target_customer: 'Budget-conscious buyers and eco-friendly shoppers',
        opportunity_angle: 'Certified pre-owned hardware with warranty coverage',
      },
      {
        name: `${cleanNiche} Cleaning and Inspection Service`,
        search_query: `${stem} cleaning`,
        category: 'Professional Services',
        target_customer: 'Asset owners and small enterprises',
        opportunity_angle: 'Automated predictive health and cleaning checkups',
      },
      {
        name: `Modular ${cleanNiche} Expansion Units`,
        search_query: `${stem} storage`,
        category: 'Modular Hardware',
        target_customer: 'Growing households and seasonal businesses',
        opportunity_angle: 'Stackable capacity with zero rewiring required',
      },
      {
        name: `Emergency Mobile ${cleanNiche} Generator`,
        search_query: `${stem} generator`,
        category: 'Disaster Preparedness',
        target_customer: 'Clinics, field workers, and off-grid facilities',
        opportunity_angle: 'Ruggedized all-weather mobile power stations',
      },
      {
        name: `Hybrid ${cleanNiche} Heating Solution`,
        search_query: `${stem} heater`,
        category: 'Climate Hardware',
        target_customer: 'Cold-climate homeowners and greenhouse farmers',
        opportunity_angle: 'Dual-source thermal storage and heat exchange',
      },
      {
        name: `Electric Vehicle ${cleanNiche} Charger`,
        search_query: `${stem} ev charger`,
        category: 'E-Mobility',
        target_customer: 'EV owners and fleet managers',
        opportunity_angle: 'Direct DC vehicle charging with minimal inverter loss',
      },
    ];
  }
}
