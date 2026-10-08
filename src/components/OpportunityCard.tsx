import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { ValidatedOpportunity, getOpportunityBrief } from '../types/index.js';
import { TrendSparkline } from './TrendSparkline.js';

interface OpportunityCardProps {
  opportunity: ValidatedOpportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBriefOpen, setIsBriefOpen] = useState(false);

  const formattedRank = String(opportunity.rank).padStart(2, '0');

  const getMomentumIcon = () => {
    if (opportunity.momentum === 'Surging' || opportunity.momentum === 'Rising') {
      return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (opportunity.momentum === 'Declining') {
      return <TrendingDown className="w-3.5 h-3.5 text-rose-400" />;
    }
    return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-indigo-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-slate-300';
  };

  const googleTrendsWebUrl = `https://trends.google.com/trends/explore?date=today%2012-m&q=${encodeURIComponent(
    opportunity.evidence.queryUsed
  )}`;

  // Construct complete 9-field Opportunity Brief with safe fallbacks
  const brief = getOpportunityBrief(opportunity);

  return (
    <div className="group rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 transition-all duration-200 overflow-hidden shadow-sm">
      <div className="p-5 sm:p-6">
        {/* Header Strip: Rank, Category, and Opportunity Score */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-indigo-400 tracking-wider">
              {formattedRank}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{opportunity.category}</span>
              {opportunity.location && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{opportunity.location}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Opportunity Score Indicator */}
          <div className="text-right shrink-0">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Opportunity Score
            </div>
            <div className="flex items-baseline justify-end gap-1">
              <span className={`text-xl font-bold font-mono ${getScoreColor(opportunity.opportunityScore)}`}>
                {opportunity.opportunityScore}
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 100</span>
            </div>
          </div>
        </div>

        {/* Opportunity Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 group-hover:text-indigo-200 transition-colors leading-snug">
          {opportunity.title}
        </h3>

        {/* Key Real Metrics Row (Google Trends Relative Interest & Growth) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-3.5 mb-4 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs">
          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">
              Current Interest
            </div>
            <div className="font-semibold text-slate-200 font-mono">
              {opportunity.evidence.currentInterest} <span className="text-slate-500 text-[10px]">/ 100</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">
              Trend Momentum
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              {getMomentumIcon()}
              <span>{opportunity.growth}</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">
              Peak Relative
            </div>
            <div className="font-semibold text-slate-200 font-mono">
              {opportunity.evidence.peakInterest} <span className="text-slate-500 text-[10px]">/ 100</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">
              Trend Trajectory
            </div>
            <div className="font-semibold text-slate-300">
              {opportunity.momentum}
            </div>
          </div>
        </div>

        {/* Commercial Explanation ("Why It Matters") */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Why It Matters
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {opportunity.explanation}
          </p>
        </div>

        {/* Target Customer & Angle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 pt-3 border-t border-slate-800/70">
          <div>
            <span className="text-slate-500 font-medium">Target Customer: </span>
            <span className="text-slate-300">{opportunity.targetCustomer}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Opportunity Angle: </span>
            <span className="text-slate-300">{opportunity.opportunityAngle}</span>
          </div>
        </div>

        {/* Footer Bar: Validation Badge & Action CTAs */}
        <div className="pt-3 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google Trends validated</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={googleTrendsWebUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-800/60"
              title="Inspect query on Google Trends web application"
            >
              <span>Verify on Google Trends</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 py-1 px-2.5 rounded bg-slate-800/60 hover:bg-slate-800 cursor-pointer font-medium"
            >
              <span>{isExpanded ? 'Hide Evidence' : 'Inspect Evidence'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Added 3rd CTA: Opportunity Brief */}
            <button
              type="button"
              onClick={() => setIsBriefOpen(!isBriefOpen)}
              className={`flex items-center gap-1 py-1 px-2.5 rounded font-medium transition-colors cursor-pointer ${
                isBriefOpen
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40'
              }`}
              title="View product idea blueprint & commercial validation brief"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isBriefOpen ? 'Hide Opportunity Brief' : 'Opportunity Brief'}</span>
              {isBriefOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable 9-Field Product Opportunity Brief */}
      {isBriefOpen && (
        <div className="px-5 sm:px-6 py-5 bg-slate-950/95 border-t border-slate-800 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h4 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">
                Product Opportunity Brief
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              9-Point Commercial Breakdown
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Title */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Title:
              </div>
              <div className="md:col-span-8 text-white font-medium">
                {brief.title}
              </div>
            </div>

            {/* 2. Who This Is For */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Who This Is For:
              </div>
              <div className="md:col-span-8 text-slate-200">
                {brief.whoThisIsFor}
              </div>
            </div>

            {/* 3. Pain in Plain Language */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Pain in Plain Language:
              </div>
              <div className="md:col-span-8 text-slate-200 leading-relaxed">
                {brief.painInPlainLanguage}
              </div>
            </div>

            {/* 4. Why They'd Pay Today */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Why They'd Pay Today:
              </div>
              <div className="md:col-span-8 text-emerald-300/95 leading-relaxed">
                {brief.whyTheyPayToday}
              </div>
            </div>

            {/* 5. Product Angle */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Product Angle:
              </div>
              <div className="md:col-span-8 text-slate-200">
                {brief.productAngle}
              </div>
            </div>

            {/* 6. Market/Region */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Market/Region:
              </div>
              <div className="md:col-span-8 text-slate-200">
                {brief.marketRegion}
              </div>
            </div>

            {/* 7. Google Trend Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Google Trend Evidence:
              </div>
              <div className="md:col-span-8 text-indigo-200 leading-relaxed">
                {brief.googleTrendEvidence}
              </div>
            </div>

            {/* 8. Differentiation Opportunity */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2.5 border-b border-slate-800/60">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Differentiation Opportunity:
              </div>
              <div className="md:col-span-8 text-slate-200 leading-relaxed">
                {brief.differentiationOpportunity}
              </div>
            </div>

            {/* 9. Confidence / Uncertainty */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1">
              <div className="md:col-span-4 font-semibold text-slate-400">
                Confidence / Uncertainty:
              </div>
              <div className="md:col-span-8">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="font-mono text-emerald-400 font-semibold">
                    Confidence: {brief.confidencePercentage}%
                  </span>
                  <span className="text-slate-600">/</span>
                  <span className="font-mono text-amber-400/90 font-semibold">
                    Uncertainty: {brief.uncertaintyPercentage}%
                  </span>
                </div>
                {/* Visual confidence gauge */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all"
                    style={{ width: `${brief.confidencePercentage}%` }}
                    title={`Confidence: ${brief.confidencePercentage}%`}
                  />
                  <div
                    className="h-full bg-amber-500/80 rounded-r-full transition-all"
                    style={{ width: `${brief.uncertaintyPercentage}%` }}
                    title={`Uncertainty: ${brief.uncertaintyPercentage}%`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Google Trends Evidence Drawer */}
      {isExpanded && (
        <div className="px-5 sm:px-6 py-5 bg-slate-950/80 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>12-Month Search Interest Timeline</span>
              <span className="text-slate-500 font-normal">
                (Query: "{opportunity.evidence.queryUsed}")
              </span>
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              Indexed 0–100 Scale
            </span>
          </div>

          {/* Interactive SVG Sparkline */}
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 mb-4">
            <TrendSparkline timeline={opportunity.evidence.timeline} />
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-800/60">
              <span>12 Months Ago</span>
              <span>Timeline Avg: {opportunity.evidence.historicalAverage}</span>
              <span>Present Day</span>
            </div>
          </div>

          {/* Related Google Queries from Google Trends */}
          {opportunity.evidence.relatedQueries && opportunity.evidence.relatedQueries.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Related Search Activity on Google
              </div>
              <div className="flex flex-wrap gap-2">
                {opportunity.evidence.relatedQueries.map((rq, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                  >
                    <span>{rq.query}</span>
                    {rq.value && (
                      <span className={`text-[10px] font-mono ${rq.isRising ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {String(rq.value)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
