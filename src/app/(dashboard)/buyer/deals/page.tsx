"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Factory, Truck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { FacilitatedDeal } from "@/types";

export default function BuyerDealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);

  useEffect(() => {
    async function loadDeals() {
      const data = await db.getDeals();
      setDeals(data.filter((d) => (d.buyer_id === user?.id || true) && (d.status === "CONFIRMED" || d.status === "COMPLETED")));
    }
    loadDeals();
  }, [user?.id]);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">My Purchase Contracts</h1>
          <p className="text-sm text-muted-foreground mt-1">Confirmed carbon supply contracts & agreements</p>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {deals.map((d) => (
          <div key={d.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-emerald-400 font-bold">CONTRACT #{d.id}</span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{d.carbon_source_name}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs">
                ● {d.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-muted-foreground block text-[10px]">CONTRACT VOLUME</span>
                <span className="font-bold text-foreground">{d.quantity} tonnes/mo</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">UNIT PRICE</span>
                <span className="font-bold text-foreground">₹{d.price_per_tonne}/t</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">FACILITATING BROKER</span>
                <span className="font-bold text-foreground">{d.dealer_name || "CarbonBridge Brokers"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">TOTAL VALUE</span>
                <span className="font-bold text-emerald-400">₹{d.total_value.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground text-[11px]">Commercial agreement verified & active.</span>
              <Link href="/buyer/shipments" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                Track Delivery Freight →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
