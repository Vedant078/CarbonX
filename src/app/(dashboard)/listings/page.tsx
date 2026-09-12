'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/context/auth-context';
import { CarbonListing } from '@/types';
import { formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Factory, MapPin, Plus, Edit, Eye } from 'lucide-react';

export default function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<CarbonListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMyListings() {
      try {
        const all = await db.getListings();
        setListings(all);
      } catch (err) {
        console.error('Failed to load listings', err);
      } finally {
        setLoading(false);
      }
    }
    loadMyListings();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Carbon Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your industrial CO₂ supply listings published on CarbonX.
          </p>
        </div>

        <Link href="/listings/new">
          <Button variant="primary">
            <Plus className="w-4 h-4" /> + List Captured CO₂
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {item.industry || (item as any).source_type}
                </span>
                <StatusBadge status={item.verification_status || (item as any).status} />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{item.company_name || (item as any).supplier_name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
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
                <span className="text-[11px] text-slate-400 block">Unit Rate</span>
                <p className="text-base font-extrabold text-slate-900">₹{formatNumber(item.price_per_tonne)}/t</p>
              </div>

              <Link href={`/marketplace/${item.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-3.5 h-3.5" /> View Listing
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
