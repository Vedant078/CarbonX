"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { BuyerRequirement } from "@/types";

export default function DealerDemandPage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);

  useEffect(() => {
    async function loadRequirements() {
      const data = await db.getRequirements();
      setRequirements(data);
    }
    loadRequirements();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Buyer Demand Requirements</h1>
          <p className="text-sm text-muted-foreground mt-1">Active industrial CO₂ requirements posted by consumer companies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {requirements.map((req) => (
          <div key={req.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-indigo-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 uppercase">
                  {req.application}
                </span>
                <h3 className="text-base font-bold text-foreground mt-2">{req.buyer_name}</h3>
                <p className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> Delivery Location: {req.location}
                </p>
              </div>

              <Link href="/dealer/opportunities">
                <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1">
                  Match Supply <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">DEMAND VOLUME</span>
                <span className="font-bold text-foreground">{req.required_quantity} tonnes/mo</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block">MIN PURITY</span>
                <span className="font-bold text-emerald-400">≥ {req.required_purity}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
