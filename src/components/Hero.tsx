import React from 'react';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import { ResearchControls } from './ResearchControls.js';
import { NicheRequest } from '../types/index.js';

interface HeroProps {
  onSearch: (request: NicheRequest) => void;
  isLoading: boolean;
  externalSearchValue?: string;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, isLoading, externalSearchValue }) => {
  return (
    <div className="relative pt-10 pb-14 md:pt-16 md:pb-20 overflow-hidden border-b border-slate-900">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 mb-5">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          <span>AI + GOOGLE TRENDS</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 [text-wrap:balance]">
          Discover What’s Trending Before Everyone Else
        </h1>

        {/* Supporting Copy */}
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed [text-wrap:balance]">
          Select from 30 high-potential health & commercial niches or search any custom industry.
          Filter by country, timeframe, category, and search type to uncover opportunities validated with real Google Trends data.
        </p>

        {/* The New Search & 5-Dropdown Research Controls System */}
        <ResearchControls
          onSearch={onSearch}
          isLoading={isLoading}
          externalSearchValue={externalSearchValue}
        />

        {/* Trust / methodology anchor */}
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 mt-8">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>AI-generated opportunities · Google Trends validated via SerpApi · Zero fabricated metrics</span>
        </div>
      </div>
    </div>
  );
};
