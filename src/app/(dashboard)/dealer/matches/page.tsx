"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, MapPin } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { MatchRecord } from "@/types";

export default function DealerMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  useEffect(() => {
    async function loadMatches() {
      const data = await db.getMatches();
      setMatches(data);
    }
    loadMatches();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Intelligent Match Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Multi-attribute scoring engine results (quantity, purity, distance, price)</p>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {matches.map((m) => {
          const src = m.source || m.listing;
          const req = m.requirement;
          return (
            <div key={m.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-indigo-500/40 transition-all">
              <div className="flex items-start justify-between border-b border-border/40 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold">
                    {m.score}% MATCH SCORE
                  </span>
                  <h3 className="text-lg font-bold text-foreground mt-1">
                    {src?.company_name || "Mumbai Steel Works"} ↓ {req?.buyer_name || "GreenFuel Technologies"}
                  </h3>
                </div>
                <Link href={`/dealer/opportunities/${m.id}`}>
                  <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1">
                    View Opportunity <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Match Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                <div className="p-2.5 bg-muted/20 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase block">QUANTITY SCORE</span>
                  <span className="font-bold text-emerald-400 text-sm">{m.quantityScore || 98}%</span>
                </div>
                <div className="p-2.5 bg-muted/20 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase block">PURITY SCORE</span>
                  <span className="font-bold text-emerald-400 text-sm">{m.purityScore || 96}%</span>
                </div>
                <div className="p-2.5 bg-muted/20 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase block">DISTANCE SCORE</span>
                  <span className="font-bold text-foreground text-sm">{m.distanceScore || 88}%</span>
                </div>
                <div className="p-2.5 bg-muted/20 rounded-xl border border-border/40">
                  <span className="text-[10px] text-muted-foreground uppercase block">PRICE SCORE</span>
                  <span className="font-bold text-emerald-400 text-sm">{m.priceScore || 92}%</span>
                </div>
                <div className="p-2.5 bg-muted/20 rounded-xl border border-border/40 col-span-2 md:col-span-1">
                  <span className="text-[10px] text-muted-foreground uppercase block">APPLICATION</span>
                  <span className="font-bold text-indigo-400 text-sm">{m.applicationScore || 95}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
