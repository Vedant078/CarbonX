'use client';

import React from 'react';
import { Sparkles, Factory, Flame, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MatchScoreBadge } from '@/components/ui/match-score-badge';

export function HeroNetworkVisual() {
  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-square max-w-xl mx-auto bg-gradient-to-b from-slate-900 via-[#0B1220] to-[#102A43] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-white overflow-hidden flex items-center justify-center select-none group">
      {/* Background Orbital Rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25">
        <div className="w-[85%] h-[85%] rounded-full border border-blue-500/40 animate-spin" style={{ animationDuration: '40s' }} />
        <div className="w-[60%] h-[60%] rounded-full border border-teal-500/30 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
      </div>

      {/* SVG Connecting Network Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-blue-400/40 stroke-2">
        {/* Lines connecting Central Node to 4 Corner Nodes */}
        <line x1="50%" y1="50%" x2="22%" y2="22%" className="animate-dash" />
        <line x1="50%" y1="50%" x2="78%" y2="22%" className="animate-dash" />
        <line x1="50%" y1="50%" x2="22%" y2="78%" className="animate-dash" />
        <line x1="50%" y1="50%" x2="78%" y2="78%" className="animate-dash" />
      </svg>

      {/* Central Node (CO2 500 t) */}
      <div className="relative z-10 flex flex-col items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl animate-pulse-subtle">
        <div className="w-full h-full rounded-full bg-[#0B1220] flex flex-col items-center justify-center text-center border border-blue-400/30">
          <span className="text-xs sm:text-sm font-extrabold text-blue-400 tracking-wider">CAPTURED</span>
          <span className="text-xl sm:text-2xl font-black text-white leading-none my-0.5">CO₂</span>
          <span className="text-xs font-bold text-slate-300">500 t/mo</span>
        </div>
      </div>

      {/* Corner Connected Nodes */}
      {/* Node 1: Top Left - STEEL */}
      <div className="absolute top-6 left-6 z-10 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-blue-400 flex items-center justify-center">
          <Factory className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUPPLIER</span>
          <span className="text-xs sm:text-sm font-bold text-white">STEEL • 500 t</span>
        </div>
      </div>

      {/* Node 2: Top Right - CEMENT */}
      <div className="absolute top-6 right-6 z-10 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center">
          <Factory className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUPPLIER</span>
          <span className="text-xs sm:text-sm font-bold text-white">CEMENT • 800 t</span>
        </div>
      </div>

      {/* Node 3: Bottom Left - SYNTHETIC FUEL */}
      <div className="absolute bottom-6 left-6 z-10 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-900/60 text-blue-400 flex items-center justify-center">
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-wider">BUYER</span>
          <span className="text-xs sm:text-sm font-bold text-white">SYNTHETIC FUEL</span>
        </div>
      </div>

      {/* Node 4: Bottom Right - CONCRETE */}
      <div className="absolute bottom-6 right-6 z-10 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-teal-900/60 text-teal-400 flex items-center justify-center">
          <Building2Icon className="w-4 h-4" />
        </div>
        <div>
          <span className="block text-[10px] font-bold text-teal-400 uppercase tracking-wider">BUYER</span>
          <span className="text-xs sm:text-sm font-bold text-white">CONCRETE • 450 t</span>
        </div>
      </div>

      {/* Floating Data Badges / Cards */}
      <div className="absolute top-[28%] left-[8%] z-20 animate-float">
        <MatchScoreBadge score={94} size="sm" />
      </div>

      <div className="absolute top-[26%] right-[10%] z-20 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-float-delayed">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>99.2% Purity</span>
      </div>

      <div className="absolute bottom-[28%] left-[10%] z-20 bg-slate-900/90 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-float">
        <Truck className="w-3.5 h-3.5 text-sky-400" />
        <span>150 km Transport</span>
      </div>

      <div className="absolute bottom-[26%] right-[8%] z-20 bg-slate-900/90 border border-slate-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-float-delayed">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        <span>₹18,500 Logistics</span>
      </div>
    </div>
  );
}

function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
