'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Settings, User, Building, Bell, Shield, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [resetDone, setResetDone] = useState(false);

  const handleResetData = async () => {
    await db.resetToSeedData();
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-2xl font-black text-slate-900">System & Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage user preferences, notifications, and demo environment state.</p>
      </div>

      {resetDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Demo dataset has been restored to factory seed state!
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-600" /> Account & Organization Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              readOnly
              value={user?.name || ''}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1">Organization / Facility</label>
            <input
              type="text"
              readOnly
              value={user?.company || ''}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              readOnly
              value={user?.email || ''}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-500 mb-1">Current Demo Role</label>
            <input
              type="text"
              readOnly
              value={user?.role || ''}
              className="w-full h-10 px-3 bg-blue-50 border border-blue-200 rounded-xl font-bold text-blue-800 uppercase"
            />
          </div>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-amber-600" /> Demo Reset & State Management
        </h3>
        <p className="text-xs text-slate-600">
          Reset all local state back to the official seeded dataset (Mumbai Steel Works, GreenFuel Technologies, 94% Hero Match scenario).
        </p>

        <div className="pt-2">
          <Button variant="outline" onClick={handleResetData}>
            <RotateCcw className="w-4 h-4 text-amber-600" /> Reset Demo Seed Data
          </Button>
        </div>
      </div>
    </div>
  );
}
