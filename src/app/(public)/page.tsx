'use client';

import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { HeroNetworkVisual } from '@/components/landing/hero-network-visual';
import { Button } from '@/components/ui/button';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  ArrowRight,
  Sparkles,
  Factory,
  Flame,
  Truck,
  CheckCircle2,
  Building2,
  Sprout,
  FlaskConical,
  BarChart3,
  Shield,
  Layers,
  MapPin,
  TrendingUp,
  DollarSign,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] text-slate-900 font-sans flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl border border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Hero Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  THE CARBON UTILIZATION MARKETPLACE
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0B1220] tracking-tight leading-[1.05]">
                  Turn captured CO₂ <br className="hidden sm:inline" />
                  into a <span className="text-blue-600">resource.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                  CarbonX connects industrial facilities that capture CO₂ with businesses that put it to productive use—with intelligent matching, marketplace discovery, and logistics estimation built in.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/marketplace">
                    <Button variant="primary" size="lg" className="shadow-lg hover:shadow-xl">
                      Explore Marketplace <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>

                  <Link href="/#list-co2">
                    <Button variant="outline" size="lg">
                      List Captured CO₂
                    </Button>
                  </Link>
                </div>

                {/* Quick Trust Indicators */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Industrial Sources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Explainable Match Scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Transportation Costing</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Network Visual */}
              <div className="lg:col-span-5 w-full">
                <HeroNetworkVisual />
              </div>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM METRICS STRIP */}
        <section className="py-10 bg-[#0B1220] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 md:divide-x divide-slate-800">
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">12,450 t</span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CO₂ Available</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tight">38</span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Suppliers</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-teal-400 tracking-tight">24</span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilization Projects</p>
              </div>
              <div className="space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">₹4.2 Cr</span>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potential Carbon Value</p>
              </div>
            </div>

            {/* Industry Badges */}
            <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-400">
              <span className="text-slate-500 uppercase tracking-widest text-[10px]">Supported Sectors:</span>
              {['CEMENT', 'STEEL', 'POWER', 'SYNTHETIC FUELS', 'CONCRETE MATERIALS', 'GREENHOUSES', 'CHEMICALS'].map((sector) => (
                <span key={sector} className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                  {sector}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="scroll-mt-20 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">ECOSYSTEM FLOW</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0B1220] tracking-tight">
              How CarbonX connects capture to opportunity
            </h3>
            <p className="text-slate-600 text-base">
              A transparent four-step workflow from industrial capture to end utilization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'CAPTURE',
                desc: 'Industrial facilities capture CO₂ from steel, cement, power, or chemical processes.',
                icon: Factory,
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                step: '02',
                title: 'LIST',
                desc: 'Publish available quantity, purity percentage, location, capture method, and pricing.',
                icon: Layers,
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
              },
              {
                step: '03',
                title: 'MATCH',
                desc: 'Deterministic matching ranks compatible buyer demand by purity, distance, quantity, and economics.',
                icon: Sparkles,
                color: 'text-teal-600 bg-teal-50 border-teal-200',
              },
              {
                step: '04',
                title: 'DELIVER',
                desc: 'Estimate transport distance, cryogenic tanker cost, delivery window, and complete the deal.',
                icon: Truck,
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                  <span className="text-3xl font-black text-slate-300 block mb-4 group-hover:text-blue-600 transition-colors">
                    {item.step}
                  </span>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* MARKETPLACE PREVIEW SECTION */}
        <section className="py-20 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">LIVE DISCOVERY</h2>
                <h3 className="text-3xl font-black text-[#0B1220] tracking-tight mt-1">
                  Explore captured carbon supply
                </h3>
              </div>
              <Link href="/marketplace">
                <Button variant="outline">
                  View All Marketplace Listings →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">STEEL</span>
                  <StatusBadge status="AVAILABLE" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900">Mumbai Steel Works</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Mumbai, Maharashtra
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Quantity</span>
                    <span className="font-bold text-slate-900">500 t/month</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Purity</span>
                    <span className="font-bold text-emerald-600">99.2%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-slate-500">Price</span>
                    <p className="text-base font-extrabold text-slate-900">₹4,500 <span className="text-xs font-normal text-slate-500">/ tonne</span></p>
                  </div>
                  <MatchScoreBadge score={94} size="sm" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CEMENT</span>
                  <StatusBadge status="AVAILABLE" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900">Gujarat Cement Infra</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Ahmedabad, Gujarat
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Quantity</span>
                    <span className="font-bold text-slate-900">800 t/month</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Purity</span>
                    <span className="font-bold text-emerald-600">96.5%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-slate-500">Price</span>
                    <p className="text-base font-extrabold text-slate-900">₹3,800 <span className="text-xs font-normal text-slate-500">/ tonne</span></p>
                  </div>
                  <MatchScoreBadge score={91} size="sm" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CHEMICAL</span>
                  <StatusBadge status="AVAILABLE" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900">Pune Chemical Industries</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Pune, Maharashtra
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Quantity</span>
                    <span className="font-bold text-slate-900">350 t/month</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Purity</span>
                    <span className="font-bold text-emerald-600">99.8%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-xs text-slate-500">Price</span>
                    <p className="text-base font-extrabold text-slate-900">₹5,200 <span className="text-xs font-normal text-slate-500">/ tonne</span></p>
                  </div>
                  <MatchScoreBadge score={88} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* MATCHING INTELLIGENCE SECTION */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0B1220] rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                MATCHING INTELLIGENCE ENGINE
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Find the right carbon, not just any carbon.
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                CarbonX uses a multi-factor scoring model that evaluates quantity compatibility (30%), purity requirement (25%), transportation distance (20%), budget constraints (15%), and application suitability (10%).
              </p>

              <div className="space-y-3 pt-2 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Explainable breakdown for judge & buyer evaluation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Deterministic, reproducible match score calculation</span>
                </div>
              </div>
            </div>

            {/* Right Match Card Showcase */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase">HERO DEMO MATCH</span>
                    <h4 className="text-lg font-bold text-white">Mumbai Steel → GreenFuel</h4>
                  </div>
                  <MatchScoreBadge score={94} size="lg" />
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-300">
                      <span>Quantity Compatibility (30%)</span>
                      <span className="text-blue-400">100 / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-300">
                      <span>Purity Match (25%)</span>
                      <span className="text-blue-400">98 / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-300">
                      <span>Logistics Distance (20%)</span>
                      <span className="text-blue-400">90 / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: '90%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1 text-slate-300">
                      <span>Price Budget Match (15%)</span>
                      <span className="text-blue-400">92 / 100</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white mb-1">Why this match?</p>
                  <p>✓ 500 t/mo available exceeds 300 t/mo needed</p>
                  <p>✓ 99.2% purity satisfies 99.0% min purity</p>
                  <p>✓ 150 km transport within 250 km max range</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LOGISTICS INTELLIGENCE SECTION */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">LOGISTICS ENGINE</h2>
                <h3 className="text-3xl sm:text-4xl font-black text-[#0B1220] tracking-tight">
                  The best match is also the one you can move.
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Transportation costs can make or break a carbon utilization project. CarbonX calculates transport distance, transport mode, total cost, and delivery window to make economic tradeoffs explicit.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="block text-2xl font-black text-slate-900">₹61.67</span>
                    <span className="text-xs text-slate-500 font-medium">Estimated cost / tonne</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="block text-2xl font-black text-blue-600">2 Days</span>
                    <span className="text-xs text-slate-500 font-medium">Delivery window</span>
                  </div>
                </div>
              </div>

              {/* Route Visual Card */}
              <div className="lg:col-span-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">ROUTE SPECIFICATION</span>
                    <span className="px-2.5 py-1 bg-sky-950 border border-sky-800 text-sky-300 rounded-full text-xs font-semibold">
                      CO₂ Tanker (Cryogenic)
                    </span>
                  </div>

                  {/* Route Visual */}
                  <div className="flex items-center justify-between bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
                    <div className="text-center z-10">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-1 font-bold text-sm">
                        M
                      </div>
                      <span className="text-xs font-bold text-white">MUMBAI</span>
                      <span className="block text-[10px] text-slate-400">Supplier Site</span>
                    </div>

                    <div className="flex-1 px-4 text-center z-10">
                      <span className="text-xs font-bold text-sky-400 block mb-1">150 km</span>
                      <div className="w-full h-0.5 bg-slate-800 relative flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-sky-500 animate-ping absolute" />
                      </div>
                    </div>

                    <div className="text-center z-10">
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-1 font-bold text-sm">
                        P
                      </div>
                      <span className="text-xs font-bold text-white">PUNE</span>
                      <span className="block text-[10px] text-slate-400">Buyer Facility</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                      <span className="block text-slate-400">Estimated Total Cost</span>
                      <span className="text-lg font-bold text-white">₹18,500</span>
                    </div>
                    <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                      <span className="block text-slate-400">Payload Volume</span>
                      <span className="text-lg font-bold text-white">300 tonnes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* APPLICATIONS SECTION */}
        <section id="applications" className="scroll-mt-20 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">PRODUCTIVE USE</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0B1220] tracking-tight">
              Supported Utilization Pathways
            </h3>
            <p className="text-slate-600 text-base">
              CarbonX serves diverse industrial CO₂ buyers across high-value markets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { title: 'Synthetic Fuels', desc: 'E-kerosene, methanol, and sustainable aviation fuel (SAF)', icon: Flame },
              { title: 'Building Materials', desc: 'CO₂ mineralized pre-cast concrete and aggregate', icon: Building2 },
              { title: 'Greenhouses', desc: 'Agricultural yield enrichment for commercial greenhouses', icon: Sprout },
              { title: 'Algae Farming', desc: 'Bio-fixation for high-protein algae and bioplastics', icon: Layers },
              { title: 'Chemical Production', desc: 'Polyurethanes, polymers, and industrial carbonates', icon: FlaskConical },
            ].map((app) => {
              const Icon = app.icon;
              return (
                <div key={app.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{app.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{app.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* INDUSTRIAL EMITTER ONBOARDING SECTION */}
        <section id="list-co2" className="scroll-mt-20 py-20 bg-slate-900 text-white border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Factory className="w-3.5 h-3.5" /> INDUSTRIAL EMITTER ONBOARDING
                </div>

                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Connect your industrial CO₂ supply with CarbonX
                </h2>

                <p className="text-slate-300 text-base leading-relaxed">
                  Are you a steel, cement, thermal power, or chemical plant capturing carbon? CarbonX provides digital infrastructure to verify, price, and match your captured CO₂ stream with commercial buyers.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 text-blue-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Submit Capture Specifications</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Specify available monthly tonnage, purity %, temperature, pressure, and location coordinates.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/50 text-teal-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Automated Match & Verification</h4>
                      <p className="text-xs text-slate-400 mt-0.5">CarbonX verifies capture parameters and ranks off-taker demand within optimal transport radius.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Execute Commercial Contracts</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Finalize offtake proposals with commercial intermediaries and buyers with integrated logistics estimation.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link href="/marketplace">
                    <Button variant="secondary" size="lg">
                      Explore Active Off-takers →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">EMITTER PARTNERSHIP INQUIRY</span>
                  <h3 className="text-xl font-bold text-white mt-1">Register Your Facility Capture Output</h3>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); alert("Inquiry submitted! A CarbonX representative will contact your technical team."); }} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Facility Name & Company</label>
                    <input type="text" placeholder="e.g. Jindal Steel CO₂ Recovery Unit" required className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Source Industry</label>
                      <select className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Steel Plant</option>
                        <option>Cement Plant</option>
                        <option>Power Plant</option>
                        <option>Chemical / Refinery</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Output (t/month)</label>
                      <input type="number" placeholder="500" required className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Location / State</label>
                    <input type="text" placeholder="e.g. Angul, Odisha" required className="w-full h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <Button variant="primary" size="md" type="submit" className="w-full font-bold">
                    Submit Facility Specs for Review →
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-20 bg-[#0B1220] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-xl">
              <Sparkles className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Have captured CO₂? Or looking for supply?
            </h2>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              Enter the complete CarbonX prototype and experience the full capture-to-deal user journey.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="shadow-xl">
                  Launch Application Prototype →
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="bg-slate-950 text-white border-slate-800 hover:bg-slate-900">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
