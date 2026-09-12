"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Send, Sparkles, DollarSign } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { FacilitatedDeal } from "@/types";

export default function DealerProposalsPage() {
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
          <h1 className="text-3xl font-bold font-mono text-foreground">Facilitated Commercial Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage active deal proposals issued to buyers & carbon emitters</p>
        </div>
        <Link href="/dealer/opportunities">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono shadow-md">
            + Create Proposal
          </button>
        </Link>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {deals.map((d) => (
          <div key={d.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-indigo-400 font-bold">PROPOSAL #{d.id}</span>
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
                <span className="text-muted-foreground block text-[10px]">PRICE / TONNE</span>
                <span className="font-bold text-foreground">₹{d.price_per_tonne}/t</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">TOTAL VALUE</span>
                <span className="font-bold text-emerald-400">₹{d.total_value.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">ESTIMATED COMMISSION</span>
                <span className="font-bold text-indigo-400">₹{d.commission.toLocaleString()} (5%)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
