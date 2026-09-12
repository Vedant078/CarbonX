'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { AnalyticsSummary, MatchRecord, FacilitatedDeal, BuyerRequirement, CarbonSource } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Briefcase,
  Sparkles,
  Factory,
  Building2,
  TrendingUp,
  ArrowRight,
  Send,
  Layers,
  CircleDollarSign,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export default function DealerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [sources, setSources] = useState<CarbonSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDealerData() {
      try {
        const [s, m, d, r, src] = await Promise.all([
          db.getAnalytics(),
          db.getMatches(),
          db.getDeals(),
          db.getRequirements(),
          db.getSources(),
        ]);

        setStats(s);
        setMatches(m);
        setDeals(d);
        setRequirements(r);
        setSources(src);
      } catch (err) {
        console.error('Failed to load dealer dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDealerData();
  }, []);

  const heroMatch = matches[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Briefcase className="w-3.5 h-3.5" /> DEALER MARKETPLACE CONTROL CENTER
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Marketplace Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Identify high-potential carbon transactions across the CarbonX ecosystem.
          </p>
        </div>

        <Link href="/matches">
          <Button variant="primary" size="lg" className="shadow-md">
            Find Opportunities <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* 6 DEALER KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MARKETPLACE SUPPLY</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {stats ? `${formatNumber(stats.co2AvailableTotal)} t` : '12,400 t'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BUYER DEMAND</span>
          <span className="text-xl sm:text-2xl font-black text-teal-700">
            {stats ? `${formatNumber(stats.co2RequiredTotal)} t` : '8,750 t'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HIGH-MATCHES</span>
          <span className="text-xl sm:text-2xl font-black text-blue-600">34</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE NEGOTIATIONS</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600">12</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FACILITATED DEAL VALUE</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">
            {stats ? formatCurrency(stats.facilitatedDealValueTotal) : '₹4.8 Cr'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">POTENTIAL COMMISSION</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">
            {stats ? formatCurrency(stats.potentialCommissionTotal) : '₹7.2 L'}
          </span>
        </div>
      </div>

      {/* DEAL PIPELINE STEPS STRIP */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Marketplace Transaction Pipeline Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-bold text-center">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            <span className="block text-[10px] opacity-70">STEP 1</span>
            IDENTIFIED
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            <span className="block text-[10px] opacity-70">STEP 2</span>
            MATCHED
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
            <span className="block text-[10px] opacity-70">STEP 3</span>
            PROPOSED
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <span className="block text-[10px] opacity-70">STEP 4</span>
            NEGOTIATING
          </div>
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
            <span className="block text-[10px] opacity-70">STEP 5</span>
            CONFIRMED
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <span className="block text-[10px] opacity-70">STEP 6</span>
            COMPLETED
          </div>
        </div>
      </div>

      {/* MAIN HIGH-POTENTIAL OPPORTUNITIES SHOWCASE */}
      {heroMatch && (
        <div className="bg-[#0B1220] rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> HIGH-POTENTIAL BROKERAGE OPPORTUNITY
            </span>
            <MatchScoreBadge score={heroMatch.score} size="sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Supply -> Demand Flow */}
            <div className="lg:col-span-8 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">EMITTER / SUPPLY</span>
                  <h4 className="text-base font-bold text-white">{heroMatch.source?.company_name || 'Mumbai Steel Works'}</h4>
                  <p className="text-xs text-slate-400">500 t/mo • 99.2% Purity • ₹4,200/t</p>
                </div>

                <div className="text-center px-4">
                  <span className="text-xs font-black text-blue-400 block">300 t/mo</span>
                  <div className="w-16 h-0.5 bg-blue-500 my-1 mx-auto" />
                  <span className="text-[10px] text-slate-400">Mumbai → Pune</span>
                </div>

                <div className="space-y-1 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">BUYER / DEMAND</span>
                  <h4 className="text-base font-bold text-white">{heroMatch.requirement?.buyer_name || 'GreenFuel Technologies'}</h4>
                  <p className="text-xs text-slate-400">Synthetic Fuel • ₹5,000/t budget</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span>Estimated Logistics: <strong className="text-sky-400">₹18,500 (2 Days)</strong></span>
                <span className="text-emerald-400 font-bold">✓ Purity & Quantity Exceeded</span>
              </div>
            </div>

            {/* Financial Commission Callout */}
            <div className="lg:col-span-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">POTENTIAL TRANSACTION ECONOMICS</span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Potential Deal Value:</span>
                  <span className="font-bold text-white">₹12.6 Lakh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Brokerage Commission (5%):</span>
                  <span className="font-extrabold text-emerald-400 text-sm">₹63,000</span>
                </div>
              </div>

              <Link href="/matches" className="block pt-2">
                <Button variant="secondary" size="md" className="w-full">
                  Create Deal Proposal →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Facilitated Deals & Buyer Demand */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facilitated Deal Proposals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Facilitated Deal Pipeline</h3>
            <Link href="/deals" className="text-xs font-bold text-blue-600 hover:underline">
              View All Proposals
            </Link>
          </div>

          <div className="space-y-3">
            {deals.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{d.id.toUpperCase()}</span>
                  <StatusBadge status={d.status} />
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{d.carbon_source_name} → {d.buyer_name}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(d.total_value)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">Commission Fee</span>
                  <span className="font-bold text-emerald-600">+{formatCurrency(d.commission)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Buyer Requirements List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Buyer Demand</h3>
            <Link href="/requirements" className="text-xs font-bold text-blue-600 hover:underline">
              View All Demand
            </Link>
          </div>

          <div className="space-y-3">
            {requirements.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{r.buyer_name}</h4>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{r.application}</span>
                </div>
                <p className="text-slate-500">{r.required_quantity} t/month required • {r.required_purity}% min purity • Max ₹{r.max_price}/t</p>
                <div className="pt-1 flex justify-end">
                  <Link href="/matches">
                    <span className="text-blue-600 font-bold hover:underline">Match with Supply →</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
