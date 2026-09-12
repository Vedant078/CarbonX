"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Factory, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { CarbonSource } from "@/types";

export default function DealerSupplyPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<CarbonSource[]>([]);

  useEffect(() => {
    async function loadSources() {
      const data = await db.getSources();
      setSources(data);
    }
    loadSources();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Marketplace Carbon Supply Entities</h1>
          <p className="text-sm text-muted-foreground mt-1">Industrial emitters, capture capacity, and available supply metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
        {sources.map((s) => (
          <div key={s.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-indigo-500/40 transition-all">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase">
                {s.industry}
              </span>
              <h3 className="text-lg font-bold text-foreground mt-2">{s.company_name}</h3>
              <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {s.location} ({s.facility_name})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">AVAILABLE</span>
                <span className="font-bold text-foreground">{s.available_quantity} t/mo</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">PURITY</span>
                <span className="font-bold text-emerald-400">{s.purity}%</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">UNIT PRICE</span>
                <span className="font-bold text-foreground">₹{s.price_per_tonne}/t</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">STATUS</span>
                <span className="font-bold text-cyan-400">VERIFIED</span>
              </div>
            </div>

            <Link href="/dealer/opportunities">
              <button className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1">
                Explore Demand Matches <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
