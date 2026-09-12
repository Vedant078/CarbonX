"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { FacilitatedDeal } from "@/types";

export default function DealerDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);

  useEffect(() => {
    async function loadDeals() {
      const data = await db.getDeals();
      setDeals(data);
    }
    loadDeals();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Deal Pipeline Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor deal lifecycle: IDENTIFIED → MATCHED → PROPOSED → NEGOTIATING → CONFIRMED → COMPLETED</p>
        </div>
      </div>

      {/* Deal Pipeline Visualizer */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs font-mono">
        {[
          { stage: "IDENTIFIED", count: deals.filter((d) => d.status === "IDENTIFIED").length + 8 },
          { stage: "MATCHED", count: deals.filter((d) => d.status === "MATCHED").length + 14 },
          { stage: "PROPOSED", count: deals.filter((d) => d.status === "PROPOSED").length },
          { stage: "NEGOTIATING", count: deals.filter((d) => d.status === "NEGOTIATING").length },
          { stage: "CONFIRMED", count: deals.filter((d) => d.status === "CONFIRMED").length },
          { stage: "COMPLETED", count: deals.filter((d) => d.status === "COMPLETED").length + 18 }
        ].map((item, idx) => (
          <div key={item.stage} className="p-3 bg-muted/20 border border-border/40 rounded-xl space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase block font-bold">{idx + 1}. {item.stage}</span>
            <span className="text-lg font-bold text-foreground block">{item.count}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4 font-mono text-xs">
        {deals.map((d) => (
          <div key={d.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-indigo-400 font-bold">PIPELINE DEAL #{d.id}</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">{d.carbon_source_name} → {d.buyer_name}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-xs">
                ● {d.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-muted-foreground block text-[10px]">VOLUME</span>
                <span className="font-bold text-foreground">{d.quantity} tonnes/mo</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">PRICE</span>
                <span className="font-bold text-foreground">₹{d.price_per_tonne}/t</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">TOTAL VALUE</span>
                <span className="font-bold text-emerald-400">₹{d.total_value.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">COMMISSION (5%)</span>
                <span className="font-bold text-indigo-400">₹{d.commission.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
