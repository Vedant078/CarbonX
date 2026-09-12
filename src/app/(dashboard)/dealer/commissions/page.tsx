"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { FacilitatedDeal } from "@/types";

export default function DealerCommissionsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);

  useEffect(() => {
    async function loadDeals() {
      const data = await db.getDeals();
      setDeals(data);
    }
    loadDeals();
  }, []);

  const totalDealVal = deals.reduce((sum, d) => sum + d.total_value, 0) + 4800000;
  const totalCommission = deals.reduce((sum, d) => sum + d.commission, 0) + 720000;
  const pendingCommission = deals.filter((d) => d.status !== "COMPLETED").reduce((sum, d) => sum + d.commission, 0);
  const completedCommission = totalCommission - pendingCommission;

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Brokerage Commissions & Financials</h1>
          <p className="text-sm text-muted-foreground mt-1">Track facilitated deal value, commission payouts, and brokerage earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-card/40 border border-border/60 rounded-xl p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">TOTAL FACILITATED VALUE</span>
          <span className="text-2xl font-bold text-foreground">₹{(totalDealVal / 100000).toFixed(1)} L</span>
        </div>
        <div className="bg-card/40 border border-border/60 rounded-xl p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">TOTAL COMMISSION</span>
          <span className="text-2xl font-bold text-indigo-400">₹{(totalCommission / 100000).toFixed(1)} L</span>
        </div>
        <div className="bg-card/40 border border-border/60 rounded-xl p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">PENDING COMMISSION</span>
          <span className="text-2xl font-bold text-amber-400">₹{pendingCommission.toLocaleString()}</span>
        </div>
        <div className="bg-card/40 border border-border/60 rounded-xl p-4">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">COMPLETED PAYOUTS</span>
          <span className="text-2xl font-bold text-emerald-400">₹{completedCommission.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        <h2 className="text-base font-bold text-foreground">Facilitated Transactions Commission Breakdown</h2>
        {deals.map((d) => (
          <div key={d.id} className="bg-card/40 border border-border/80 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-indigo-400 font-bold">DEAL #{d.id}</span>
              <div className="font-bold text-foreground mt-0.5">{d.carbon_source_name} → {d.buyer_name}</div>
              <div className="text-muted-foreground text-[11px]">Total Carbon Value: ₹{d.total_carbon_value.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold block text-sm">₹{d.commission.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground">5% Brokerage Commission</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
