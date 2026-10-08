import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Globe,
  Clock,
  Tag,
  Layers,
  Sparkles,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import {
  PREDEFINED_NICHES,
  LOCATION_OPTIONS,
  TIME_RANGE_OPTIONS,
  CATEGORY_OPTIONS,
  SEARCH_TYPE_OPTIONS,
  NicheRequest,
} from '../types/index.js';

interface ResearchControlsProps {
  onSearch: (request: NicheRequest) => void;
  isLoading: boolean;
  externalSearchValue?: string;
}

const PRESET_NICHES = [
  'Solar Energy',
  'Sustainable Fashion',
  'AI Workflow Automation',
  'Home Battery Storage',
  'Plant-based Wellness',
];

export const ResearchControls: React.FC<ResearchControlsProps> = ({
  onSearch,
  isLoading,
  externalSearchValue,
}) => {
  // Input state
  const [searchBarValue, setSearchBarValue] = useState(externalSearchValue || '');
  const [selectedNiche, setSelectedNiche] = useState<string>('');

  // Dropdown states
  const [selectedLocation, setSelectedLocation] = useState<string>('WORLDWIDE');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('past_12_months');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [selectedSearchType, setSelectedSearchType] = useState<string>('web');

  // Open dropdown popover trackers
  const [activeDropdown, setActiveDropdown] = useState<
    'niches' | 'location' | 'time' | 'category' | 'searchType' | null
  >(null);

  // Search filter inside searchable dropdowns
  const [nicheFilter, setNicheFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Validation warning
  const [validationError, setValidationError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external search value if changed from outside
  useEffect(() => {
    if (externalSearchValue !== undefined && externalSearchValue !== '') {
      setSearchBarValue(externalSearchValue);
    }
  }, [externalSearchValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // When a predefined niche is selected:
  const handleSelectPredefinedNiche = (niche: string) => {
    setSelectedNiche(niche);
    setSearchBarValue(niche); // Populate the search bar
    setValidationError(null);
    setActiveDropdown(null);
    setNicheFilter('');
  };

  // Submit handler implementing the precedence rule:
  // IF search bar has text -> use search bar text
  // ELSE IF predefined niche selected -> use selected niche
  // ELSE -> show validation message
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const queryToUse = searchBarValue.trim() || selectedNiche.trim();

    if (!queryToUse) {
      setValidationError('Please enter a niche or select one from the Niches dropdown.');
      return;
    }

    // Custom date range validation
    if (selectedTimeRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        setValidationError('Please select both a start date and an end date for the custom date range.');
        return;
      }
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const now = new Date();

      if (start > end) {
        setValidationError('Start date cannot be after end date.');
        return;
      }
      if (end > now) {
        setValidationError('Future dates are not permitted for Google Trends historical data.');
        return;
      }
      if (start < new Date('2004-01-01')) {
        setValidationError('Google Trends historical data begins in 2004. Please choose a date after 2004-01-01.');
        return;
      }
    }

    onSearch({
      niche: queryToUse,
      location: selectedLocation,
      timeRange: selectedTimeRange,
      customStartDate: selectedTimeRange === 'custom' ? customStartDate : undefined,
      customEndDate: selectedTimeRange === 'custom' ? customEndDate : undefined,
      category: selectedCategory,
      searchType: selectedSearchType,
    });
  };

  const handlePresetClick = (preset: string) => {
    setSearchBarValue(preset);
    setSelectedNiche(preset);
    setValidationError(null);
    onSearch({
      niche: preset,
      location: selectedLocation,
      timeRange: selectedTimeRange,
      category: selectedCategory,
      searchType: selectedSearchType,
    });
  };

  // Filtered dropdown lists
  const filteredNiches = PREDEFINED_NICHES.filter((n) =>
    n.toLowerCase().includes(nicheFilter.toLowerCase())
  );

  const filteredLocations = LOCATION_OPTIONS.filter((loc) =>
    loc.name.toLowerCase().includes(locationFilter.toLowerCase())
  );

  const filteredCategories = CATEGORY_OPTIONS.filter((cat) =>
    cat.name.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  const activeLocationObj = LOCATION_OPTIONS.find((l) => l.code === selectedLocation) || LOCATION_OPTIONS[0];
  const activeTimeObj = TIME_RANGE_OPTIONS.find((t) => t.id === selectedTimeRange) || TIME_RANGE_OPTIONS[6];
  const activeCategoryObj = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory) || CATEGORY_OPTIONS[0];
  const activeSearchTypeObj = SEARCH_TYPE_OPTIONS.find((s) => s.id === selectedSearchType) || SEARCH_TYPE_OPTIONS[0];

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto w-full text-left relative z-20">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Row 1: Search / Niche Free-text Input Bar */}
        <div className="relative flex items-center p-1.5 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl shadow-indigo-950/40 focus-within:border-indigo-500/80 transition-colors">
          <Search className="w-5 h-5 text-slate-500 shrink-0 ml-3 mr-2" />
          <input
            type="text"
            value={searchBarValue}
            onChange={(e) => {
              setSearchBarValue(e.target.value);
              setValidationError(null);
            }}
            placeholder="Search any niche, industry, or idea... (or pick from Niches dropdown)"
            disabled={isLoading}
            className="w-full bg-transparent py-2.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />
          {searchBarValue && (
            <button
              type="button"
              onClick={() => setSearchBarValue('')}
              className="p-1 mr-2 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Row 2: The 5 Research Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
          {/* Dropdown 1: Niches (Predefined 30) */}
          <div className="relative">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setActiveDropdown(activeDropdown === 'niches' ? null : 'niches');
                setNicheFilter('');
              }}
              className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer truncate ${
                selectedNiche || activeDropdown === 'niches'
                  ? 'border-indigo-500 text-white shadow-sm'
                  : 'border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-500 font-medium">Niche:</span>
                <span className="truncate font-semibold text-slate-200">
                  {selectedNiche || 'Niches'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'niches' && (
              <div className="absolute top-full left-0 mt-1.5 w-64 max-h-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
                <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
                    <input
                      type="text"
                      value={nicheFilter}
                      onChange={(e) => setNicheFilter(e.target.value)}
                      placeholder="Search 30 niches..."
                      autoFocus
                      className="w-full pl-8 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-1">
                  {filteredNiches.length > 0 ? (
                    filteredNiches.map((niche) => (
                      <button
                        key={niche}
                        type="button"
                        onClick={() => handleSelectPredefinedNiche(niche)}
                        className={`w-full px-2.5 py-1.5 rounded-md text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          selectedNiche === niche
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{niche}</span>
                        {selectedNiche === niche && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-slate-500 text-xs">No matching niche</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown 2: Location (Searchable Country Selector) */}
          <div className="relative">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setActiveDropdown(activeDropdown === 'location' ? null : 'location');
                setLocationFilter('');
              }}
              className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer truncate ${
                activeDropdown === 'location'
                  ? 'border-indigo-500 text-white'
                  : 'border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-slate-200">{activeLocationObj.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'location' && (
              <div className="absolute top-full left-0 mt-1.5 w-60 max-h-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
                <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
                    <input
                      type="text"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="Search country..."
                      autoFocus
                      className="w-full pl-8 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-1">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(loc.code);
                        setActiveDropdown(null);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-md text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedLocation === loc.code
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{loc.name}</span>
                      {selectedLocation === loc.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown 3: Time Range */}
          <div className="relative">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
              className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer truncate ${
                activeDropdown === 'time'
                  ? 'border-indigo-500 text-white'
                  : 'border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-slate-200">
                  {selectedTimeRange === 'custom' && customStartDate && customEndDate
                    ? `${customStartDate} to ${customEndDate}`
                    : activeTimeObj.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'time' && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 p-1.5">
                <div className="space-y-0.5">
                  {TIME_RANGE_OPTIONS.map((timeOpt) => (
                    <button
                      key={timeOpt.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimeRange(timeOpt.id);
                        if (timeOpt.id !== 'custom') {
                          setActiveDropdown(null);
                        }
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-md text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedTimeRange === timeOpt.id
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{timeOpt.label}</span>
                      {selectedTimeRange === timeOpt.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>

                {/* Custom Date Range Sub-controls */}
                {selectedTimeRange === 'custom' && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800 px-1 space-y-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Start Date:
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        End Date:
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(null)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded cursor-pointer"
                      >
                        Apply Range
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dropdown 4: Category */}
          <div className="relative">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setActiveDropdown(activeDropdown === 'category' ? null : 'category');
                setCategoryFilter('');
              }}
              className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer truncate ${
                activeDropdown === 'category'
                  ? 'border-indigo-500 text-white'
                  : 'border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-slate-200">{activeCategoryObj.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'category' && (
              <div className="absolute top-full left-0 mt-1.5 w-60 max-h-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
                <div className="p-2 border-b border-slate-800 sticky top-0 bg-slate-900">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
                    <input
                      type="text"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      placeholder="Search category..."
                      autoFocus
                      className="w-full pl-8 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-1">
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setActiveDropdown(null);
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-md text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dropdown 5: Search Type */}
          <div className="relative col-span-2 sm:col-span-1">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setActiveDropdown(activeDropdown === 'searchType' ? null : 'searchType')}
              className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer truncate ${
                activeDropdown === 'searchType'
                  ? 'border-indigo-500 text-white'
                  : 'border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate text-slate-200">{activeSearchTypeObj.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {activeDropdown === 'searchType' && (
              <div className="absolute top-full right-0 sm:left-0 mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 p-1">
                {SEARCH_TYPE_OPTIONS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setSelectedSearchType(st.id);
                      setActiveDropdown(null);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-md text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedSearchType === st.id
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{st.name}</span>
                    {selectedSearchType === st.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Validation warning if empty or invalid */}
        {validationError && (
          <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
            <span>{validationError}</span>
            <button
              type="button"
              onClick={() => setValidationError(null)}
              className="p-0.5 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Row 3: Prominent CTA Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            <span>{isLoading ? 'Analyzing Google Trends Data...' : 'Find Trending Opportunities'}</span>
          </button>
        </div>
      </form>

      {/* Row 4: Quick Explore Chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 mt-6">
        <span className="text-slate-500 font-medium">Quick Explore:</span>
        {PRESET_NICHES.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={isLoading}
            onClick={() => handlePresetClick(preset)}
            className="px-2.5 py-1 rounded-md bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};
