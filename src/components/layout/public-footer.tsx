import React from 'react';
import Link from 'next/link';
import { Atom } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#0B1220] text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Atom className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Carbon<span className="text-blue-500">X</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Captured Carbon. Matched to Opportunity. Digital infrastructure for the circular carbon economy, connecting industrial capture with productive utilization.
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Demo Platform • Built for Climate-Tech Innovation Hackathon
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Discover CO₂
                </Link>
              </li>
              <li>
                <Link href="/listings/new" className="hover:text-white transition-colors">
                  List Captured CO₂
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-white transition-colors">
                  Matching Engine
                </Link>
              </li>
              <li>
                <Link href="/shipments" className="hover:text-white transition-colors">
                  Logistics Estimator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Platform & Demo
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Supplier Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Buyer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors">
                  Ecosystem Analytics
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Platform
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CarbonX. All rights reserved. Industrial Carbon Capture-to-Utilization Network.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Demo Documentation</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
