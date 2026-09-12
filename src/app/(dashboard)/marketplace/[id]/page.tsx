'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/context/auth-context';
import { CarbonListing, MatchRecord } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { generateLogisticsEstimate } from '@/lib/logistics';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';
import { Modal } from '@/components/ui/modal';
import {
  ArrowLeft,
  Factory,
  MapPin,
  Truck,
  Sparkles,
  CheckCircle2,
  Calendar,
  Thermometer,
  Gauge,
  Send,
  Building2,
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user } = useAuth();
  const [listing, setListing] = useState<CarbonListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Request Form state
  const [requestedQty, setRequestedQty] = useState<number>(300);
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [durationMonths, setDurationMonths] = useState<number>(3);
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        const item = await db.getListingById(id);
        if (item) {
          setListing(item);
          setRequestedQty(Math.min(item.available_quantity, 300));
        }
      } catch (err) {
        console.error('Failed to load listing', err);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-semibold">
        Loading listing details...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Listing not found</h2>
        <Link href="/marketplace">
          <Button variant="outline">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const logistics = generateLogisticsEstimate(listing.location, 'Pune, Maharashtra', requestedQty);

  // Calculated economics
  const carbonValue = requestedQty * listing.price_per_tonne * durationMonths;
  const estimatedTotal = carbonValue + logistics.estimatedCost;

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.createBuyerRequest({
        buyer_id: user?.id || "demo-buyer",
        buyer_name: user?.company || 'GreenFuel Technologies',
        carbon_source_id: listing.id,
        quantity: requestedQty,
      });

      setModalOpen(false);
      router.push('/dashboard/buyer');
    } catch (err) {
      console.error('Error submitting request', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Back Button */}
      <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* Main Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                {listing.industry || (listing as any).source_type} PROCESS
              </span>
              <StatusBadge status={listing.verification_status || (listing as any).status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {listing.facility_name || (listing as any).title}
            </h1>
            <p className="text-sm font-bold text-slate-700 mt-1 flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-blue-600" /> {listing.company_name || (listing as any).supplier_name} •{' '}
              <span className="font-normal text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {listing.location}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <MatchScoreBadge score={94} size="lg" />
          </div>
        </div>

        {/* 4 Core Metric Callouts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">AVAILABLE SUPPLY</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">{listing.available_quantity} t/mo</span>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <span className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider">PURITY</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700">{listing.purity}%</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">UNIT PRICE</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">₹{formatNumber(listing.price_per_tonne)}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">AVAILABILITY</span>
            <span className="text-sm font-extrabold text-slate-900 mt-1 block">Oct 2026 Onwards</span>
          </div>
        </div>
      </div>

      {/* Grid: Technical Details vs Logistics Estimate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Technical Details */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Technical Capture Specification
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Source Process</span>
              <span className="font-bold text-slate-900">{listing.industry || (listing as any).source_type} Manufacturing</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Capture Method</span>
              <span className="font-bold text-slate-900">{listing.capture_method}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-slate-400" /> Temperature
              </span>
              <span className="font-bold text-slate-900">{listing.temperature || '35°C'}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" /> Pressure
              </span>
              <span className="font-bold text-slate-900">{listing.pressure || '2.5 bar'}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Location Coordinates</span>
              <span className="font-mono text-slate-700">{listing.latitude}, {listing.longitude}</span>
            </div>
          </div>
        </div>

        {/* Logistics Estimation Card */}
        <div className="lg:col-span-6 bg-[#0B1220] text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> LOGISTICS ESTIMATE
              </span>
              <span className="text-xs text-slate-400 font-medium">Route: Mumbai → Pune</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Distance</span>
                <span className="text-lg font-black text-white">{logistics.distanceKm} km</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transport Mode</span>
                <span className="text-xs font-bold text-sky-300">{logistics.transportMode}</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Transport Cost</span>
                <span className="text-lg font-black text-emerald-400">{formatCurrency(logistics.estimatedCost)}</span>
              </div>

              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost / Tonne</span>
                <span className="text-lg font-black text-white">₹{logistics.costPerTonne}</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            className="w-full shadow-lg"
            onClick={() => setModalOpen(true)}
          >
            Request Supply <Send className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Supply Request Modal Wizard */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request CO₂ Supply"
        subtitle={`Submit supply agreement request to ${listing.company_name || (listing as any).supplier_name}`}
        maxWidth="lg"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Selected Supplier:</span>
              <p className="font-bold text-slate-900">{listing.company_name || (listing as any).supplier_name}</p>
            </div>
            <MatchScoreBadge score={94} size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requested Quantity (tonnes/month)
              </label>
              <input
                type="number"
                min="10"
                max={listing.available_quantity}
                value={requestedQty}
                onChange={(e) => setRequestedQty(parseInt(e.target.value, 10) || 10)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contract Duration (months)
              </label>
              <select
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value, 10))}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Month Trial</option>
                <option value={3}>3 Months Contract</option>
                <option value={6}>6 Months Contract</option>
                <option value={12}>12 Months Annual Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Preferred Supply Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message to Supplier (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add specific delivery specs, off-loading conditions, or contract notes..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Calculated Economics Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-blue-400 uppercase tracking-wider block text-[10px]">
              CALCULATED TRANSACTION ECONOMICS
            </span>
            <div className="flex justify-between">
              <span className="text-slate-300">Carbon Commodity Value ({requestedQty} t/mo × {durationMonths} mo):</span>
              <span className="font-bold">{formatCurrency(carbonValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Estimated Logistics (Cryogenic Tanker):</span>
              <span className="font-bold text-sky-400">{formatCurrency(logistics.estimatedCost)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-extrabold">
              <span>Estimated Total Agreement:</span>
              <span className="text-emerald-400">{formatCurrency(estimatedTotal)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting Request...' : 'Submit Supply Request →'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
