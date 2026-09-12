import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/ui/brand-logo';

export function PublicFooter() {
  return (
    <footer className="bg-[#0B1220] text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo href="/" size="md" theme="dark" />
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
                <Link href="/#list-co2" className="hover:text-white transition-colors">
                  List Captured CO₂
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Matching Engine
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
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
                <Link href="/buyer/dashboard" className="hover:text-white transition-colors">
                  Buyer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dealer/dashboard" className="hover:text-white transition-colors">
                  Dealer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/logistics/dashboard" className="hover:text-white transition-colors">
                  Logistics Dashboard
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-white transition-colors">
                  Ecosystem Analytics
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
