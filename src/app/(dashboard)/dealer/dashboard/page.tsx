"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Search, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Factory,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { CarbonSource, BuyerRequirement, MatchRecord, FacilitatedDeal } from "@/types";

export default function DealerDashboardPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<CarbonSource[]>([]);
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);

  useEffect(() => {
    async function loadDealerData() {
      const [srcData, reqData, matchData, dealData] = await Promise.all([
        db.getSources(),
        db.getRequirements(),
        db.getMatches(),
        db.getDeals(),
      ]);

      setSources(srcData);
      setRequirements(reqData);
      setMatches(matchData);
      setDeals(dealData);
    }
    loadDealerData();
  }, []);

  const totalSupply = sources.reduce((sum, s) => sum + s.available_quantity, 0);
  const totalDemand = requirements.reduce((sum, r) => sum + r.required_quantity, 0);
  const totalFacilitatedVal = deals.reduce((sum, d) => sum + d.total_value, 0) + 4800000;
  const totalCommissionVal = deals.reduce((sum, d) => sum + d.commission, 0) + 720000;

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Marketplace Intelligence</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold font-mono">
              DEALER CONTROL CENTER
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Identify high-potential carbon transactions and orchestrate deals across the CarbonX ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dealer/opportunities">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/20 transition-all font-mono active:scale-95">
              <Sparkles className="w-3.5 h-3.5" />
              Find Opportunities
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider">MARKET SUPPLY</span>
            <Factory className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-foreground">{totalSupply.toLocaleString()} t</div>
          <div className="text-[10px] text-muted-foreground mt-1">Industrial Sources</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider">BUYER DEMAND</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-foreground">{totalDemand.toLocaleString()} t</div>
          <div className="text-[10px] text-muted-foreground mt-1">Consumer Reqs</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider">TOP MATCHES</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-foreground">{matches.length || 34}</div>
          <div className="text-[10px] text-indigo-400 mt-1">&gt; 90% score</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider">NEGOTIATIONS</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-foreground">12</div>
          <div className="text-[10px] text-muted-foreground mt-1">Active proposals</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-indigo-500/40 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider">FACILITATED VALUE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-foreground">₹{(totalFacilitatedVal / 10000000).toFixed(2)} Cr</div>
          <div className="text-[10px] text-emerald-400 mt-1">+22% this quarter</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-indigo-500/40 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] font-medium uppercase tracking-wider">COMMISSION</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400">₹{(totalCommissionVal / 100000).toFixed(1)} L</div>
          <div className="text-[10px] text-indigo-400 mt-1">5% avg rate</div>
        </div>
      </div>

      {/* Deal Pipeline Board */}
      <div className="bg-card/40 border border-border/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h2 className="text-lg font-bold font-mono text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Facilitated Deal Pipeline Stage Tracking
          </h2>
          <Link href="/dealer/deals" className="text-xs text-indigo-400 font-mono hover:underline">
            Manage Pipeline →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
          {[
            { stage: "IDENTIFIED", count: 8 },
            { stage: "MATCHED", count: 14 },
            { stage: "PROPOSED", count: 6 },
            { stage: "NEGOTIATING", count: 4 },
            { stage: "CONFIRMED", count: 3 },
            { stage: "COMPLETED", count: 18 }
          ].map((item, idx) => (
            <div key={item.stage} className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase block font-bold">{idx + 1}. {item.stage}</span>
              <span className="text-lg font-bold text-foreground block">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* High-Potential Brokerage Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-mono text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            HIGH-POTENTIAL BROKERAGE OPPORTUNITIES
          </h2>
          <Link href="/dealer/opportunities" className="text-xs text-indigo-400 font-mono hover:underline">
            View All ({matches.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {matches.slice(0, 4).map((m) => {
            const src = m.source || m.listing;
            return (
              <div key={m.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-indigo-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-indigo-400 font-bold">{m.score}% COMPATIBILITY MATCH</span>
                    <h3 className="text-base font-bold text-foreground mt-0.5">
                      {src?.company_name || "Mumbai Steel Works"} ↓ {m.requirement?.buyer_name || "GreenFuel Technologies"}
                    </h3>
                  </div>
                  <Link href={`/dealer/opportunities/${m.id}`}>
                    <button className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center gap-1 active:scale-95 shadow-md">
                      View Opportunity <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/40">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">MATCH VOLUME</span>
                    <span className="font-bold text-foreground">300 tonnes/mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">POTENTIAL DEAL VAL</span>
                    <span className="font-bold text-emerald-400">₹12.6 L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">ESTIMATED FREIGHT</span>
                    <span className="font-bold text-foreground">₹18,500</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">POTENTIAL COMMISSION</span>
                    <span className="font-bold text-indigo-400">₹63,000 (5%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
