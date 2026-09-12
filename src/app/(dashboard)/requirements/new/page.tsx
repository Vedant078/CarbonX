'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { ApplicationType } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Sparkles, MapPin, DollarSign, Layers } from 'lucide-react';

export default function CreateRequirementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [application, setApplication] = useState<ApplicationType>('Synthetic Fuel');
  const [title, setTitle] = useState('High-Purity CO₂ for Synthetic E-Fuel Plant');
  const [requiredQuantity, setRequiredQuantity] = useState<number>(300);
  const [requiredPurity, setRequiredPurity] = useState<number>(99.0);
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [maxDistance, setMaxDistance] = useState<number>(250);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [frequency, setFrequency] = useState('Monthly');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await db.createRequirement({
        buyer_id: user?.id || "demo-buyer",
        buyer_name: user?.company || 'GreenFuel Technologies',
        title,
        application,
        required_quantity: requiredQuantity,
        required_purity: requiredPurity,
        location,
        latitude: location.includes('Mumbai') ? 19.076 : 18.5204, // Pune lat
        longitude: location.includes('Mumbai') ? 72.8777 : 73.8567, // Pune lon
        max_distance: maxDistance,
        max_price: maxPrice,
        frequency,
        status: 'ACTIVE',
      });

      router.push('/matches');
    } catch (err) {
      console.error('Failed to create requirement', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" /> BUYER DEMAND SPECIFICATION
          </div>
          <h1 className="text-2xl font-black text-slate-900">Define CO₂ Supply Requirement</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specify your technical requirement parameters to discover compatible supplier matches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Application Industry</label>
            <select
              value={application}
              onChange={(e) => setApplication(e.target.value as ApplicationType)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Synthetic Fuel">Synthetic Fuel Synthesis (E-Fuel / SAF)</option>
              <option value="Construction">Building Materials / Concrete Curing</option>
              <option value="Greenhouse">Greenhouse Crop Enrichment</option>
              <option value="Algae">Algae Bio-Fixation</option>
              <option value="Chemicals">Chemical & Polymer Production</option>
              <option value="Other">Other Industrial Use</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Required Quantity (tonnes/month)</label>
              <input
                type="number"
                min="10"
                value={requiredQuantity}
                onChange={(e) => setRequiredQuantity(parseInt(e.target.value, 10) || 10)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Required Purity (%)</label>
              <input
                type="number"
                step="0.1"
                min="90"
                max="100"
                value={requiredPurity}
                onChange={(e) => setRequiredPurity(parseFloat(e.target.value) || 99.0)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Location / Facility Site</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Transport Distance (km)</label>
              <input
                type="number"
                min="10"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value, 10) || 50)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Price Budget (₹ / tonne)</label>
              <input
                type="number"
                min="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10) || 1000)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="secondary" size="lg" type="submit" disabled={submitting}>
              {submitting ? 'Calculating Matches...' : 'Find Matches →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
