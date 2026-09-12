'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { AnalyticsSummary, CarbonListing, MatchRecord, SupplyRequest, LogisticsShipment } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Factory,
  Sparkles,
  Send,
  CircleDollarSign,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Truck,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const CHART_DATA = [
  { month: 'May', supply: 1200, demand: 850 },
  { month: 'Jun', supply: 1500, demand: 1100 },
  { month: 'Jul', supply: 1800, demand: 1400 },
  { month: 'Aug', supply: 2100, demand: 1900 },
  { month: 'Sep', supply: 2450, demand: 2150 },
];

export default function DashboardOverviewPage() {
  const { user, role } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [topMatches, setTopMatches] = useState<MatchRecord[]>([]);
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, matchesData, requestsData, shipmentsData] = await Promise.all([
          db.getAnalytics(),
          db.getMatches(),
          db.getRequests(),
          db.getShipments(),
        ]);
        setAnalytics(statsData);
        setTopMatches(matchesData.slice(0, 3));
        setRequests(requestsData.slice(0, 3));
        setShipments(shipmentsData.slice(0, 2));
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {role} PERSPECTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Welcome back, <strong className="text-slate-800">{user.name}</strong> ({user.company}). Monitor your carbon supply, matches, and active transactions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {role === 'SUPPLIER' ? (
            <Link href="/listings/new">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4" /> List CO₂
              </Button>
            </Link>
          ) : (
            <Link href="/requirements/new">
              <Button variant="secondary" size="md">
                <Plus className="w-4 h-4" /> Create Requirement
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AVAILABLE CO₂</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Factory className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {analytics ? `${formatNumber(analytics.co2AvailableTotal)} t` : '2,450 t'}
            </span>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12.5% vs last month
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE MATCHES</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {analytics ? analytics.activeMatchesCount : 24}
            </span>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +8 this month
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE REQUESTS</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {requests.length || 8}
            </span>
            <p className="text-xs text-amber-600 font-semibold mt-1">
              {requests.filter(r => r.status === 'PENDING').length || 3} awaiting action
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">POTENTIAL VALUE</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {analytics ? formatCurrency(analytics.potentialCarbonValue) : '₹1.2 Cr'}
            </span>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% vs last month
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Matches Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Supply vs Demand Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">CO₂ Supply vs Demand Growth</h3>
              <p className="text-xs text-slate-500">Monthly metric tonnes trend across platform</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Supply (t)
              </span>
              <span className="flex items-center gap-1.5 text-teal-600">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Demand (t)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1220', borderRadius: '12px', border: 'none', color: '#fff' }}
                />
                <Area type="monotone" dataKey="supply" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorSupply)" />
                <Area type="monotone" dataKey="demand" stroke="#0F766E" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Matches Showcase Widget */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recommended Matches</h3>
              <p className="text-xs text-slate-500">Highest ranked supply-demand pairs</p>
            </div>
            <Link href="/matches" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {topMatches.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    {m.listing?.supplier_name || 'Mumbai Steel Works'}
                  </span>
                  <MatchScoreBadge score={m.score} size="sm" />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>500 t/mo • 99.2% purity</span>
                  <span className="font-semibold text-slate-700">₹4,500/t</span>
                </div>
                <Link href={`/matches`} className="inline-block text-xs font-bold text-blue-600 hover:underline">
                  Analyze Match & Logistics →
                </Link>
              </div>
            ))}
          </div>

          <Link href="/matches">
            <Button variant="outline" className="w-full text-xs">
              Explore Full Match Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Grid: Recent Requests & Active Shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Supply Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Supply Requests</h3>
              <p className="text-xs text-slate-500">Incoming buyer requests awaiting action</p>
            </div>
            <Link href="/requests" className="text-xs font-bold text-blue-600 hover:underline">
              Manage Requests
            </Link>
          </div>

          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{r.buyer_name}</h4>
                  <p className="text-xs text-slate-500">{r.quantity} t/month • {r.duration_months} months</p>
                  <p className="text-xs font-semibold text-blue-700 mt-0.5">{formatCurrency(r.calculated_total_value)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <Link href="/requests">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Shipments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Shipments</h3>
              <p className="text-xs text-slate-500">Real-time transport status tracking</p>
            </div>
            <Link href="/shipments" className="text-xs font-bold text-blue-600 hover:underline">
              View All Shipments
            </Link>
          </div>

          <div className="space-y-3">
            {shipments.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-900">{s.tracking_code}</span>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{s.origin} → {s.destination}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(s.estimated_cost)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
