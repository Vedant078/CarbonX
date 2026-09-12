'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { AnalyticsSummary } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  Factory,
  BarChart3,
  Sparkles,
  Truck,
  TrendingUp,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DEMAND_BY_APP = [
  { name: 'Synthetic Fuel', value: 4500, color: '#2563EB' },
  { name: 'Construction', value: 3200, color: '#0F766E' },
  { name: 'Greenhouse', value: 1800, color: '#16A34A' },
  { name: 'Algae Farming', value: 1400, color: '#D97706' },
  { name: 'Chemicals', value: 1550, color: '#6366F1' },
];

const SUPPLY_BY_SOURCE = [
  { name: 'Steel', volume: 4500 },
  { name: 'Cement', volume: 3800 },
  { name: 'Power', volume: 2900 },
  { name: 'Chemical', volume: 1250 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await db.getAnalytics();
        setStats(data);
      } catch (err) {
        console.error('Error loading analytics', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Ecosystem Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track supply volume, demand distribution, match performance, and logistics economics.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">CO₂ LISTED</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats ? `${formatNumber(stats.co2AvailableTotal)} t` : '12,450 t'}
          </span>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% platform growth
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">CO₂ UTILIZED</span>
          <span className="text-2xl sm:text-3xl font-black text-teal-700">
            {stats ? `${formatNumber(stats.co2UtilizedTotal)} t` : '8,920 t'}
          </span>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.5% year-to-date
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AVERAGE MATCH SCORE</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-600">
            {stats ? `${stats.averageMatchScore}%` : '89%'}
          </span>
          <p className="text-xs text-blue-600 font-semibold">High compatibility index</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AVERAGE LOGISTICS</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{stats ? stats.averageLogisticsCostPerTonne : 61.67}/t
          </span>
          <p className="text-xs text-slate-500 font-medium">Within target transport threshold</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Demand by Application Pie Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Demand by Utilization Application</h3>
          <p className="text-xs text-slate-500">Breakdown of buyer requirements in tonnes/month</p>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEMAND_BY_APP}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DEMAND_BY_APP.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supply by Source Bar Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Supply Volume by Source Sector</h3>
          <p className="text-xs text-slate-500">Available CO₂ from steel, cement, power, and chemical</p>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUPPLY_BY_SOURCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B1220', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="volume" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
