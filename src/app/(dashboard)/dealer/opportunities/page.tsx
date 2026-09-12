"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Factory, Building2, Layers } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { MatchRecord } from "@/types";

export default function DealerOpportunitiesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  useEffect(() => {
    async function loadOpportunities() {
      const data = await db.getMatches();
      setMatches(data);
    }
    loadOpportunities();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Marketplace Match Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">High-potential carbon supply and demand pairings ready for transaction facilitation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {matches.map((m) => {
          const src = m.source || m.listing;
          const req = m.requirement;
          return (
            <div key={m.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                    {m.score}% MATCH SCORE
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-1.5">
                    {src?.company_name || "Mumbai Steel Works"} ↓ {req?.buyer_name || "GreenFuel Technologies"}
                  </h3>
                </div>
                {/* Dealer action CTA: View Opportunity */}
                <Link href={`/dealer/opportunities/${m.id}`}>
                  <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1">
                    View Opportunity <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">CARBON SOURCE</span>
                  <span className="font-bold text-foreground">{src?.company_name} ({src?.industry})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">BUYER DEMAND</span>
                  <span className="font-bold text-foreground">{req?.buyer_name || "GreenFuel Tech"} ({req?.required_quantity}t)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">POTENTIAL DEAL VALUE</span>
                  <span className="font-bold text-emerald-400">₹12.6 L</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">ESTIMATED COMMISSION</span>
                  <span className="font-bold text-indigo-400">₹63,000 (5%)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
