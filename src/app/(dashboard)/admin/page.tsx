'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { AnalyticsSummary, CarbonListing, Deal } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ShieldCheck, Users, Factory, Building2, Layers, FileCheck } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [listings, setListings] = useState<CarbonListing[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [s, l, d] = await Promise.all([db.getAnalytics(), db.getListings(), db.getDeals()]);
        setStats(s);
        setListings(l);
        setDeals(d);
      } catch (err) {
        console.error('Error loading admin data', err);
      }
    }
    loadAdminData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="bg-[#0B1220] text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> PLATFORM CONTROL CENTER
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">CarbonX Admin Overview</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Monitor ecosystem participants, listing integrity, and transaction settlement.
          </p>
        </div>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL USERS</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">62</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SUPPLIERS</span>
          <span className="text-xl sm:text-2xl font-black text-blue-600">38</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BUYERS</span>
          <span className="text-xl sm:text-2xl font-black text-teal-600">24</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CO₂ LISTED</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900">{stats?.co2AvailableTotal} t</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE MATCHES</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-600">{stats?.activeMatchesCount}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COMPLETED DEALS</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">{stats?.completedDealsCount}</span>
        </div>
      </div>

      {/* Admin Platform Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Platform Carbon Listings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-2">Supplier</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Purity</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900">{l.supplier_name}</td>
                    <td className="py-2.5 text-slate-600">{l.source_type}</td>
                    <td className="py-2.5 font-semibold text-slate-900">{l.available_quantity} t</td>
                    <td className="py-2.5 text-emerald-600 font-bold">{l.purity}%</td>
                    <td className="py-2.5"><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deals Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Platform Transaction Deals</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                <tr>
                  <th className="py-2">Deal ID</th>
                  <th className="py-2">Parties</th>
                  <th className="py-2">Value</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deals.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono font-bold text-slate-900">{d.id}</td>
                    <td className="py-2.5 text-slate-600">{d.supplier_name.split(' ')[0]} → {d.buyer_name.split(' ')[0]}</td>
                    <td className="py-2.5 font-extrabold text-blue-700">{formatCurrency(d.total_value)}</td>
                    <td className="py-2.5"><StatusBadge status={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
