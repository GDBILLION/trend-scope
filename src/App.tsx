/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Download,
  Filter,
  ArrowUpDown,
  Search,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Globe,
  Clock,
  Layers,
  Tag,
} from 'lucide-react';
import { Header } from './components/Header.js';
import { Hero } from './components/Hero.js';
import { AnalysisProgress } from './components/AnalysisProgress.js';
import { OpportunityCard } from './components/OpportunityCard.js';
import { MethodologyDrawer } from './components/MethodologyDrawer.js';
import { ApiSettingsModal } from './components/ApiSettingsModal.js';
import {
  NicheRequest,
  NicheAnalysisResponse,
  ValidatedOpportunity,
  ProviderStatus,
  getOpportunityBrief,
} from './types/index.js';

type SortOption = 'score' | 'growth' | 'interest' | 'peak';

export default function App() {
  const [currentNiche, setCurrentNiche] = useState('');
  const [loadingNiche, setLoadingNiche] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<NicheAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<NicheRequest | null>(null);

  // Filter & Sort State
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);

  // Load server provider status on mount
  const fetchProviderStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setProviderStatus(data);
      }
    } catch (err) {
      console.warn('Could not fetch server status:', err);
    }
  };

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  const handleSearch = async (request: NicheRequest) => {
    setIsLoading(true);
    setLoadingNiche(request.niche);
    setLastRequest(request);
    setErrorMessage(null);
    setAnalysisData(null);

    try {
      const res = await fetch('/api/niche-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve niche opportunities.');
      }

      setAnalysisData(data);
      setCurrentNiche(request.niche);
    } catch (err: any) {
      console.error('Search failed:', err);
      setErrorMessage(
        err?.message || 'Unable to retrieve trend data right now. Please try again.'
      );
    } finally {
      setIsLoading(false);
      setLoadingNiche('');
    }
  };

  // Distinct categories available in current results
  const categories = useMemo(() => {
    if (!analysisData?.results) return [];
    const set = new Set<string>();
    analysisData.results.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [analysisData]);

  // Filtered and sorted opportunities
  const displayedOpportunities = useMemo(() => {
    if (!analysisData?.results) return [];

    let list = [...analysisData.results];

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.explanation.toLowerCase().includes(q) ||
          item.targetCustomer.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'score') {
        return b.opportunityScore - a.opportunityScore;
      }
      if (sortBy === 'growth') {
        return b.growthNum - a.growthNum;
      }
      if (sortBy === 'interest') {
        return b.evidence.currentInterest - a.evidence.currentInterest;
      }
      if (sortBy === 'peak') {
        return b.evidence.peakInterest - a.evidence.peakInterest;
      }
      return 0;
    });

    return list;
  }, [analysisData, selectedCategory, searchQuery, sortBy]);

  // Export handlers providing the exact 9-field Opportunity Brief results
  const handleExportCSV = () => {
    if (!analysisData?.results || analysisData.results.length === 0) return;
    const listToExport: ValidatedOpportunity[] =
      displayedOpportunities.length > 0 ? displayedOpportunities : analysisData.results;

    const headers = [
      'Title',
      'Who This Is For',
      'Pain in Plain Language',
      "Why They'd Pay Today",
      'Product Angle',
      'Market/Region',
      'Google Trend Evidence',
      'Differentiation Opportunity',
      'Confidence / Uncertainty',
    ];

    const cleanCsvCell = (val: string | undefined | null) => {
      const sanitized = (val || '').replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${sanitized}"`;
    };

    const rows = listToExport.map((item: ValidatedOpportunity) => {
      const brief = getOpportunityBrief(item);
      return [
        cleanCsvCell(brief.title),
        cleanCsvCell(brief.whoThisIsFor),
        cleanCsvCell(brief.painInPlainLanguage),
        cleanCsvCell(brief.whyTheyPayToday),
        cleanCsvCell(brief.productAngle),
        cleanCsvCell(brief.marketRegion),
        cleanCsvCell(brief.googleTrendEvidence),
        cleanCsvCell(brief.differentiationOpportunity),
        cleanCsvCell(`Confidence: ${brief.confidencePercentage}% / Uncertainty: ${brief.uncertaintyPercentage}%`),
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeNiche = (currentNiche || 'Niche').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `TrendScope_${safeNiche}_Opportunity_Briefs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!analysisData?.results || analysisData.results.length === 0) return;
    const listToExport: ValidatedOpportunity[] =
      displayedOpportunities.length > 0 ? displayedOpportunities : analysisData.results;

    const exportData = listToExport.map((item: ValidatedOpportunity) => {
      const brief = getOpportunityBrief(item);
      return {
        'Title': brief.title,
        'Who This Is For': brief.whoThisIsFor,
        'Pain in Plain Language': brief.painInPlainLanguage,
        "Why They'd Pay Today": brief.whyTheyPayToday,
        'Product Angle': brief.productAngle,
        'Market/Region': brief.marketRegion,
        'Google Trend Evidence': brief.googleTrendEvidence,
        'Differentiation Opportunity': brief.differentiationOpportunity,
        'Confidence / Uncertainty': `Confidence: ${brief.confidencePercentage}% / Uncertainty: ${brief.uncertaintyPercentage}%`,
      };
    });

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeNiche = (currentNiche || 'Niche').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `TrendScope_${safeNiche}_Opportunity_Briefs.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      {/* Top Bar Contract Navigation */}
      <Header
        providerStatus={providerStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {/* Hero Search & 5-Dropdown Research Controls Section */}
        <Hero
          onSearch={handleSearch}
          isLoading={isLoading}
          externalSearchValue={currentNiche}
        />

        {/* Loading Progress State */}
        {isLoading && <AnalysisProgress niche={loadingNiche} />}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="max-w-2xl mx-auto my-12 p-6 rounded-2xl bg-rose-950/40 border border-rose-900/60 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">
              Analysis Could Not Complete
            </h3>
            <p className="text-sm text-slate-300 mb-6">{errorMessage}</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (lastRequest) {
                    handleSearch(lastRequest);
                  } else {
                    handleSearch({ niche: loadingNiche || currentNiche || 'Weight loss' });
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Check API Credentials
              </button>
            </div>
          </div>
        )}

        {/* Results Viewport */}
        {analysisData && !isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Results Header Strip */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                  <span>ANALYSIS COMPLETE</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(analysisData.timestamp).toLocaleTimeString()}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {analysisData.totalCandidatesValidated} Validated Opportunities in{' '}
                  <span className="text-indigo-400">"{analysisData.niche}"</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Generated from {analysisData.totalCandidatesGenerated} candidates ·{' '}
                  {analysisData.excludedCandidatesCount} candidates excluded due to insufficient Google Trends search volume.
                </p>

                {/* Section 13: Results Summary of Active Research Parameters */}
                {analysisData.activeParams && (
                  <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-500 font-medium">Analyzed:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-slate-500">Niche:</span>
                      <strong className="text-white">{analysisData.activeParams.niche}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      <Globe className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500">Location:</span>
                      <strong className="text-white">{analysisData.activeParams.locationLabel}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500">Time range:</span>
                      <strong className="text-white">{analysisData.activeParams.timeRangeLabel}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500">Category:</span>
                      <strong className="text-white">{analysisData.activeParams.categoryLabel}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      <Layers className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500">Search type:</span>
                      <strong className="text-white">{analysisData.activeParams.searchTypeLabel}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Export Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export Opportunity Briefs to CSV spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export Opportunity Briefs to JSON"
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => setIsMethodologyOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Methodology</span>
                </button>
              </div>
            </div>

            {/* Filter and Sorting Control Strip */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-8">
              {/* Category Segmented Control */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  All ({analysisData.results.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sorting and Search */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter results..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort opportunities by"
                    className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="score">Sort: Opportunity Score</option>
                    <option value="growth">Sort: Momentum Growth (%)</option>
                    <option value="interest">Sort: Current Relative Interest</option>
                    <option value="peak">Sort: Peak Search Value</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Opportunities List Grid */}
            {displayedOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayedOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm">
                  No opportunities match the current filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Methodology Explainer Box at Footer of Results */}
            <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-200 font-semibold block mb-1">
                    Google Trends Verification Transparency
                  </strong>
                  Scores represent <em>indexed relative search interest</em> (0–100) on Google
                  over the selected parameters ({analysisData.activeParams?.locationLabel || 'Worldwide'}, {analysisData.activeParams?.timeRangeLabel || 'Past 12 months'}). Any candidate keyword that showed negligible or zero
                  interest was removed to prevent false commercial assumptions.
                  <button
                    onClick={() => setIsMethodologyOpen(true)}
                    className="text-indigo-400 hover:text-indigo-300 ml-1 font-medium underline cursor-pointer"
                  >
                    Read full methodology
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty / Initial State Quick Prompt Guide */}
        {!analysisData && !isLoading && !errorMessage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs font-mono mb-4">
                  01
                </div>
                <h4 className="text-sm font-semibold text-white mb-2">
                  AI Discovery Engine
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select from 30 predefined commercial niches or enter any custom market idea.
                  AI generates specific product, service, and software opportunities.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono mb-4">
                  02
                </div>
                <h4 className="text-sm font-semibold text-white mb-2">
                  Targeted Google Trends Filtering
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Filter by country (e.g. Nigeria, US, UK, Worldwide), time range, category,
                  and search property (Web, YouTube, Shopping) for deep market intelligence.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs font-mono mb-4">
                  03
                </div>
                <h4 className="text-sm font-semibold text-white mb-2">
                  Zero Hallucination Scoring
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Transparent mathematical opportunity scoring removes unverified ideas and
                  ranks true market momentum with verifiable Google search evidence.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">TrendScope</span>
            <span>· Market Opportunity Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Methodology
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              API Status
            </button>
            <a
              href="/api/export-zip"
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Download Standalone .zip
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={providerStatus}
        onKeysUpdated={fetchProviderStatus}
      />
    </div>
  );
}
