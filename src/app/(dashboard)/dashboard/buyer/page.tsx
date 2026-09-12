'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { 
  CarbonSource, 
  BuyerRequirement, 
  MatchRecord, 
  FacilitatedDeal, 
  LogisticsShipment 
} from "@/types";
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Building2,
  Sparkles,
  Send,
  FileCheck,
  TrendingUp,
  MapPin,
  Truck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Factory,
} from 'lucide-react';

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [topMatch, setTopMatch] = useState<MatchRecord | null>(null);
  const [requests, setRequests] = useState<FacilitatedDeal[]>([]);
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);

  useEffect(() => {
    async function loadBuyerData() {
      try {
        const [matchesData, requestsData, dealsData, shipmentsData] = await Promise.all([
          db.getMatches(),
          db.getRequests(),
          db.getDeals(),
          db.getShipments(),
        ]);

        if (matchesData.length > 0) setTopMatch(matchesData[0]);
        setRequests(requestsData.filter((r: any) => r.buyer_id === user?.id || true));
        setDeals(dealsData.filter((d: FacilitatedDeal) => d.buyer_id === user?.id || true));
        setShipments(shipmentsData);
      } catch (err) {
        console.error('Error loading buyer dashboard', err);
      }
    }
    loadBuyerData();
  }, [user?.id]);

  const source = topMatch?.source || topMatch?.listing;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" /> BUYER WORKSPACE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good morning, {user?.company || "GreenFuel Technologies"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover compatible carbon supply and manage your CO₂ demand.
          </p>
        </div>

        <Link href="/marketplace">
          <Button variant="primary" size="lg" className="shadow-md">
            Find CO₂ Supply <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* 5 BUYER KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ REQUIRED</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">300 t/mo</span>
          <p className="text-[11px] text-slate-500 font-semibold">Synthetic Fuel</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">POTENTIAL MATCHES</span>
          <span className="text-xl sm:text-2xl font-black text-blue-600">8</span>
          <p className="text-[11px] text-blue-600 font-semibold">High compatibility</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE REQUESTS</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">3</span>
          <p className="text-[11px] text-amber-600 font-semibold">1 pending reply</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE DEALS</span>
          <span className="text-xl sm:text-2xl font-black text-teal-700">2</span>
          <p className="text-[11px] text-teal-700 font-semibold">In transit</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ESTIMATED SAVINGS</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">₹4.2 L</span>
          <p className="text-[11px] text-emerald-600 font-semibold">vs market average</p>
        </div>
      </div>

      {/* RECOMMENDED CO2 SUPPLY MAIN CARD */}
      <div className="bg-[#0B1220] rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> HIGHEST RANKED SUPPLY MATCH
          </span>
          <MatchScoreBadge score={topMatch?.score || 94} size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <h3 className="text-2xl font-black text-white">{source?.company_name || 'Mumbai Steel Works'}</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {source?.location || 'Mumbai, Maharashtra'}
            </p>

            <div className="grid grid-cols-3 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase">Available</span>
                <span className="font-bold text-white">{source?.available_quantity || 500} t/month</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase">Purity</span>
                <span className="font-bold text-emerald-400">{source?.purity || 99.2}%</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold block uppercase">Rate</span>
                <span className="font-bold text-white">₹{source?.price_per_tonne || 4200}/t</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Logistics Route:</span>
              <span className="font-bold text-sky-400">Mumbai → Pune (150 km)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Estimated Logistics Cost:</span>
              <span className="font-bold text-white">₹18,500 (₹61.67/t)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Delivery Time:</span>
              <span className="font-bold text-white">2 Days</span>
            </div>

            <Link href={`/marketplace/${source?.id || 'source-1'}`} className="block pt-2">
              <Button variant="secondary" size="md" className="w-full shadow-md">
                View Match Analysis & Request →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Active Deals & Incoming Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Deals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">My Active Contracts</h3>
            <Link href="/deals" className="text-xs font-bold text-blue-600 hover:underline">
              View Deals
            </Link>
          </div>

          <div className="space-y-3">
            {deals.map((d) => (
              <div key={d.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900 block">{d.id.toUpperCase()}</span>
                  <span className="text-slate-500">{d.carbon_source_name} • {d.quantity} t/mo</span>
                  <p className="font-extrabold text-blue-700 mt-0.5">{formatCurrency(d.total_value)}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Shipments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Incoming Deliveries</h3>
            <Link href="/shipments" className="text-xs font-bold text-blue-600 hover:underline">
              Track Shipments
            </Link>
          </div>

          <div className="space-y-3">
            {shipments.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-sky-600" /> {s.tracking_code}
                  </span>
                  <StatusBadge status={s.status} />
                </div>
                <p className="text-slate-600">{s.origin.split(',')[0]} → {s.destination.split(',')[0]} ({s.distance_km} km)</p>
                <p className="text-[11px] text-slate-500 font-medium">Driver: {s.driver_name} • Vehicle: {s.vehicle_type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
