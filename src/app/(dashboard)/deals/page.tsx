'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Deal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileCheck, ArrowRight, Truck, Factory, Building2, CheckCircle2 } from 'lucide-react';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await db.getDeals();
        setDeals(data);
      } catch (err) {
        console.error('Error loading deals', err);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Active & Completed Deals</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track executed carbon supply contracts and delivery timelines.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6 hover:border-blue-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-slate-900">{deal.id.toUpperCase()}</span>
                <StatusBadge status={deal.status} />
              </div>
              <span className="text-xs text-slate-400 font-mono">Executed: {formatDate(deal.created_at)}</span>
            </div>

            {/* Supplier -> Buyer Visual Flow */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">SUPPLIER</span>
                  <span className="font-bold text-slate-900">{deal.carbon_source_name || (deal as any).supplier_name || "Industrial Emitter"}</span>
                </div>
              </div>

              <div className="flex-1 px-4 text-center">
                <span className="text-blue-600 font-bold block text-xs">{deal.quantity} t/month</span>
                <div className="w-full h-0.5 bg-blue-300 relative flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">BUYER</span>
                  <span className="font-bold text-slate-900">{deal.buyer_name}</span>
                </div>
                <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
              </div>
            </div>

            {/* Economics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-2xl text-xs">
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">CO₂ Rate</span>
                <span className="font-bold">₹{deal.price_per_tonne}/t</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Carbon Commodity Value</span>
                <span className="font-bold">{formatCurrency(deal.total_carbon_value)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Logistics Cost</span>
                <span className="font-bold text-sky-400">{formatCurrency(deal.logistics_cost)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold text-[10px] uppercase">Total Contract Value</span>
                <span className="font-extrabold text-emerald-400 text-sm">{formatCurrency(deal.total_value)}</span>
              </div>
            </div>

            {/* Contract Progress Timeline Steps */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Contract Timeline</span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px] font-semibold text-slate-600">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Request
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                </div>
                <div className={`p-2 rounded-lg border flex items-center gap-1 ${['PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(deal.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                  ✓ Prepared
                </div>
                <div className={`p-2 rounded-lg border flex items-center gap-1 ${['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(deal.status) ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold' : 'bg-slate-100 text-slate-400'}`}>
                  ● In Transit
                </div>
                <div className={`p-2 rounded-lg border flex items-center gap-1 ${['DELIVERED', 'COMPLETED'].includes(deal.status) ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-slate-100 text-slate-400'}`}>
                  ○ Delivered
                </div>
                <div className={`p-2 rounded-lg border flex items-center gap-1 ${deal.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                  ○ Completed
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Link href="/shipments">
                <Button variant="outline" size="sm">
                  <Truck className="w-3.5 h-3.5 text-sky-600" /> Track Shipment Details →
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
