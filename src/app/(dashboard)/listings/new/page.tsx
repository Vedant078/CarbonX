'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { SourceType } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Factory,
  Layers,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [sourceType, setSourceType] = useState<SourceType>('Steel');
  const [title, setTitle] = useState('Flue Gas CO₂ Recovery Unit');
  const [facilityName, setFacilityName] = useState(user?.company || 'Mumbai Steel Works');
  const [captureMethod, setCaptureMethod] = useState('Amine-Based Solvent Absorption');

  const [quantity, setQuantity] = useState<number>(500);
  const [purity, setPurity] = useState<number>(99.2);
  const [pricePerTonne, setPricePerTonne] = useState<number>(4500);
  const [availabilityDate, setAvailabilityDate] = useState('2026-10-01');

  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [latitude, setLatitude] = useState<number>(19.076);
  const [longitude, setLongitude] = useState<number>(72.8777);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) setStep(step + 1);
  };

  const handlePublish = async () => {
    setSubmitting(true);
    try {
      await db.createListing({
        supplier_id: user?.id || 'demo-supplier',
        supplier_name: facilityName,
        title,
        source_type: sourceType,
        location,
        latitude,
        longitude,
        available_quantity: quantity,
        unit: 'tonnes/month',
        purity,
        capture_method: captureMethod,
        temperature: '35°C',
        pressure: '2.5 bar',
        availability_date: availabilityDate,
        price_per_tonne: pricePerTonne,
        status: 'ACTIVE',
      });

      router.push('/listings');
    } catch (err) {
      console.error('Failed to create listing', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Link href="/listings" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Listings
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">List Captured CO₂</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish your facility's captured carbon supply to the CarbonX marketplace.
          </p>
        </div>

        {/* 4-Step Progress Indicator Bar */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-6 text-xs">
          {[
            { num: 1, label: 'Source' },
            { num: 2, label: 'Supply' },
            { num: 3, label: 'Location' },
            { num: 4, label: 'Review' },
          ].map((item) => {
            const isDone = item.num < step;
            const isCurrent = item.num === step;
            return (
              <div
                key={item.num}
                className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <span className="block text-[10px] uppercase opacity-80">Step {item.num}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: SOURCE */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Factory className="w-4 h-4 text-blue-600" /> Step 1: Industrial Source Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Source Industry Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Steel">Steel Plant</option>
                <option value="Cement">Cement Facility</option>
                <option value="Power">Thermal Power Plant</option>
                <option value="Chemical">Chemical / Refinery</option>
                <option value="Other">Other Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facility Name</label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Listing Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capture Technology Method</label>
              <select
                value={captureMethod}
                onChange={(e) => setCaptureMethod(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Amine-Based Solvent Absorption">Amine-Based Solvent Absorption</option>
                <option value="Calcium Looping Process">Calcium Looping Process</option>
                <option value="Chilled Ammonia Process">Chilled Ammonia Process</option>
                <option value="Cryogenic Distillation">Cryogenic Distillation</option>
                <option value="Membrane Separation Technology">Membrane Separation Technology</option>
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary">
                Next: Supply Details →
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: SUPPLY */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Step 2: Supply Metrics & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Quantity (tonnes/month)</label>
                <input
                  type="number"
                  min="10"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 10)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">CO₂ Purity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="90"
                  max="100"
                  value={purity}
                  onChange={(e) => setPurity(parseFloat(e.target.value) || 99.0)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price per Tonne (INR ₹)</label>
                <input
                  type="number"
                  min="500"
                  value={pricePerTonne}
                  onChange={(e) => setPricePerTonne(parseInt(e.target.value, 10) || 1000)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Availability Start Date</label>
                <input
                  type="date"
                  value={availabilityDate}
                  onChange={(e) => setAvailabilityDate(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button type="submit" variant="primary">
                Next: Location Details →
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3: LOCATION */}
        {step === 3 && (
          <form onSubmit={handleNext} className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Step 3: Location & Coordinates
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facility Location / City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 19.076)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 72.8777)}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Simulated Map Preview Box */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2">
              <span className="font-bold text-blue-400 block">SIMULATED LOCATION NODE</span>
              <p>Facility Pin: <strong className="text-white">{location}</strong> ({latitude}, {longitude})</p>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button type="submit" variant="primary">
                Next: Review & Publish →
              </Button>
            </div>
          </form>
        )}

        {/* STEP 4: REVIEW & PUBLISH */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Step 4: Review Listing Summary
            </h3>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Facility / Supplier</span>
                  <span className="font-bold text-slate-900 text-sm">{facilityName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Industry Source</span>
                  <span className="font-bold text-blue-600 text-sm">{sourceType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block font-semibold">Available Supply</span>
                  <span className="font-extrabold text-slate-900">{quantity} t/month</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Purity Level</span>
                  <span className="font-extrabold text-emerald-600">{purity}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Unit Price</span>
                  <span className="font-extrabold text-slate-900">₹{formatNumber(pricePerTonne)}/t</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Location</span>
                  <span className="font-extrabold text-slate-900">{location}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>
                ← Edit Location
              </Button>
              <Button variant="secondary" size="lg" onClick={handlePublish} disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish Listing Now →'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
