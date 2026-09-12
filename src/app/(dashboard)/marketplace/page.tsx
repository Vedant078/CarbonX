'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/db';
import { parseAIQuery } from '@/lib/ai-assistant';
import { CarbonListing, SourceType } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  Map as MapIcon,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [listings, setListings] = useState<CarbonListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [minPurity, setMinPurity] = useState<number>(95);
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await db.getListings();
        setListings(data);

        if (initialQuery) {
          const aiResult = parseAIQuery(initialQuery, data);
          setAiSummary(aiResult.summaryText);
        }
      } catch (err) {
        console.error('Error fetching listings', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (val.length > 5) {
      const aiResult = parseAIQuery(val, listings);
      setAiSummary(aiResult.summaryText);
    } else {
      setAiSummary(null);
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const facilityName = item.facility_name || (item as any).title || '';
      const companyName = item.company_name || (item as any).supplier_name || '';
      const industryType = item.industry || (item as any).source_type || '';

      const matchSearch =
        !search ||
        facilityName.toLowerCase().includes(search.toLowerCase()) ||
        companyName.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        industryType.toLowerCase().includes(search.toLowerCase());

      const matchSource = selectedSource === 'ALL' || industryType === selectedSource;
      const matchPurity = item.purity >= minPurity;
      const matchPrice = item.price_per_tonne <= maxPrice;

      return matchSearch && matchSource && matchPurity && matchPrice;
    });
  }, [listings, search, selectedSource, minPurity, maxPrice]);

  const resetFilters = () => {
    setSearch('');
    setSelectedSource('ALL');
    setMinPurity(95);
    setMaxPrice(6000);
    setAiSummary(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Discover Captured CO₂
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified industrial suppliers by quantity, purity, location, price, and match score.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-center">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" /> Map View
          </button>
        </div>
      </div>

      {/* AI Assistant Banner if Query Triggered */}
      {aiSummary && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900 animate-in fade-in duration-200">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block text-sm text-blue-950">CarbonX AI Natural Language Assistant</span>
            <p className="mt-0.5">{aiSummary}</p>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Main Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by supplier name, location (Mumbai, Pune, Gujarat), or source type..."
            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Horizontal Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Source Type Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Source: All Types</option>
              <option value="Steel">Steel</option>
              <option value="Cement">Cement</option>
              <option value="Power">Power</option>
              <option value="Chemical">Chemical</option>
            </select>

            {/* Minimum Purity Filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="font-semibold text-slate-500">Min Purity:</span>
              <input
                type="range"
                min="95"
                max="99.8"
                step="0.1"
                value={minPurity}
                onChange={(e) => setMinPurity(parseFloat(e.target.value))}
                className="w-20 accent-blue-600 cursor-pointer"
              />
              <span className="font-bold text-slate-900">{minPurity}%</span>
            </div>

            {/* Max Price Filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="font-semibold text-slate-500">Max Price:</span>
              <input
                type="range"
                min="3000"
                max="6000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-24 accent-blue-600 cursor-pointer"
              />
              <span className="font-bold text-slate-900">₹{maxPrice}/t</span>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* View Mode 1: Simulated Map View */}
      {viewMode === 'map' && (
        <div className="bg-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl space-y-4 relative overflow-hidden min-h-[420px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-sm">Simulated Industrial Carbon Network Map</span>
            </div>
            <span className="text-xs text-slate-400">Showing {filteredListings.length} Active Supplier Nodes</span>
          </div>

          {/* Interactive Simulated Map Grid */}
          <div className="relative w-full h-[340px] bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-6 select-none">
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {filteredListings.map((item, idx) => {
              const positions = [
                { top: '35%', left: '25%' },
                { top: '20%', left: '60%' },
                { top: '65%', left: '30%' },
                { top: '40%', left: '75%' },
                { top: '75%', left: '50%' },
              ];
              const pos = positions[idx % positions.length];

              return (
                <div
                  key={item.id}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute z-10 group"
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg group-hover:scale-125 transition-all cursor-pointer">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-md shadow-md whitespace-nowrap">
                      {item.company_name || (item as any).supplier_name} ({item.available_quantity}t)
                    </span>

                    <div className="hidden group-hover:block absolute bottom-full mb-2 w-48 p-3 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl z-30 text-xs space-y-1">
                      <p className="font-bold text-blue-400">{item.company_name || (item as any).supplier_name}</p>
                      <p>{item.location}</p>
                      <p className="text-emerald-400 font-semibold">{item.purity}% Purity • ₹{item.price_per_tonne}/t</p>
                      <Link href={`/marketplace/${item.id}`} className="block pt-1 text-blue-400 underline font-bold">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode 2: Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No CO₂ listings found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search criteria or resetting filters to discover compatible supply.
              </p>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            filteredListings.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {item.industry || (item as any).source_type}
                    </span>
                    <StatusBadge status={item.verification_status || (item as any).status} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.company_name || (item as any).supplier_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {item.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Supply</span>
                      <span className="font-bold text-slate-900">{item.available_quantity} t/month</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Purity</span>
                      <span className="font-bold text-emerald-600">{item.purity}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Rate</span>
                    <p className="text-base font-extrabold text-slate-900">
                      ₹{formatNumber(item.price_per_tonne)}{' '}
                      <span className="text-xs font-normal text-slate-500">/ tonne</span>
                    </p>
                  </div>

                  <Link href={`/marketplace/${item.id}`}>
                    <Button variant="primary" size="sm">
                      View Details →
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-semibold">Loading marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
