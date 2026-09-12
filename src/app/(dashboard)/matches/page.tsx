'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { MatchRecord } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { generateLogisticsEstimate } from '@/lib/logistics';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';
import {
  Sparkles,
  Factory,
  Building2,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Send,
} from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      try {
        const data = await db.getMatches();
        setMatches(data);
        if (data.length > 0) {
          setSelectedMatch(data[0]); // Default to 94% hero match
        }
      } catch (err) {
        console.error('Error fetching matches', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-semibold">Calculating matching engine...</div>;
  }

  const heroMatch = selectedMatch || matches[0];
  const listing = heroMatch?.listing;
  const req = heroMatch?.requirement;

  const logistics = generateLogisticsEstimate(
    listing?.location || 'Mumbai, MH',
    req?.location || 'Pune, MH',
    req?.required_quantity || 300
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Match Analysis</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              INTELLIGENCE ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Explainable AI matching between industrial CO₂ supply and buyer utilization demand.
          </p>
        </div>

        <Link href="/requirements/new">
          <Button variant="outline" size="sm">
            + New Requirement
          </Button>
        </Link>
      </div>

      {/* SIGNATURE MATCH HERO CARD */}
      {heroMatch && (
        <div className="bg-[#0B1220] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> DETERMINISTIC MATCH EVALUATION
            </span>
            <span className="text-xs font-mono text-slate-400">Match ID: {heroMatch.id}</span>
          </div>

          {/* 3-Column Match Overview: Supply | 94% Score | Demand */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Supply Box */}
            <div className="md:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CO₂ SUPPLY</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  {listing?.source_type || 'Steel'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{listing?.supplier_name || 'Mumbai Steel Works'}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {listing?.location || 'Mumbai, MH'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Available Supply</span>
                  <span className="font-bold text-white">{listing?.available_quantity || 500} t/mo</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Purity</span>
                  <span className="font-bold text-emerald-400">{listing?.purity || 99.2}%</span>
                </div>
              </div>
            </div>

            {/* Center Match Score Badge */}
            <div className="md:col-span-2 flex flex-col items-center justify-center text-center py-2">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl animate-pulse-subtle flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#0B1220] flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white leading-none">{heroMatch.score}%</span>
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-0.5">MATCH</span>
                </div>
              </div>
            </div>

            {/* Demand Box */}
            <div className="md:col-span-5 bg-slate-900/90 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UTILIZATION DEMAND</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
                  {req?.application || 'Synthetic Fuel'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{req?.buyer_name || 'GreenFuel Technologies'}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req?.location || 'Pune, MH'}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Required Supply</span>
                  <span className="font-bold text-white">{req?.required_quantity || 300} t/mo</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Min Purity</span>
                  <span className="font-bold text-teal-400">{req?.required_purity || 99.0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Component Score Breakdown Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-800">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Component Score Weighting
              </h4>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Quantity Score (30% weight)</span>
                    <span className="text-blue-400">{heroMatch.quantityScore} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${heroMatch.quantityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Purity Score (25% weight)</span>
                    <span className="text-blue-400">{heroMatch.purityScore} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${heroMatch.purityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Distance Score (20% weight)</span>
                    <span className="text-blue-400">{heroMatch.distanceScore} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${heroMatch.distanceScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 font-semibold mb-1">
                    <span>Price Budget Score (15% weight)</span>
                    <span className="text-blue-400">{heroMatch.priceScore} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${heroMatch.priceScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Why This Match Reasoning List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Why this match is recommended
              </h4>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-200">
                {heroMatch.reasoning?.map((r, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{r.replace(/^✓\s*/, '')}</span>
                  </p>
                ))}
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link href={`/marketplace/${listing?.id || 'listing-1'}`}>
                  <Button variant="secondary" size="lg" className="w-full">
                    Request CO₂ Supply Now →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Matches List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900">All Calculated Matches</h3>

        <div className="space-y-3">
          {matches.map((m) => {
            const isSelected = heroMatch?.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMatch(m)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{m.listing?.supplier_name || 'Mumbai Steel Works'}</h4>
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-xs font-semibold text-slate-700">{m.requirement?.buyer_name || 'GreenFuel Tech'}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {m.listing?.available_quantity} t/mo available • {m.listing?.purity}% purity • ₹{m.listing?.price_per_tonne}/t
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <MatchScoreBadge score={m.score} size="md" />
                  <Button variant={isSelected ? 'primary' : 'outline'} size="sm">
                    {isSelected ? 'Active View' : 'Select'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
