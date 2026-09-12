"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Send, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { FacilitatedDeal } from "@/types";

export default function BuyerRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<FacilitatedDeal[]>([]);

  useEffect(() => {
    async function loadReqs() {
      const data = await db.getDeals();
      setRequests(data.filter((d) => d.buyer_id === user?.id || true));
    }
    loadReqs();
  }, [user?.id]);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Supply Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Track purchase intents sent to carbon sources & dealers</p>
        </div>
        <Link href="/buyer/marketplace">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono shadow-md">
            + Request Supply
          </button>
        </Link>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {requests.map((r) => (
          <div key={r.id} className="bg-card/40 border border-border/80 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-emerald-400 font-bold">REQUEST #{r.id}</span>
              <h3 className="text-base font-bold text-foreground mt-0.5">{r.carbon_source_name}</h3>
              <p className="text-muted-foreground text-[11px]">{r.quantity} tonnes/mo • Requested price ₹{r.price_per_tonne}/t</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold block mb-1">
                {r.status}
              </span>
              <span className="text-muted-foreground text-[10px]">Awaiting Dealer Proposal</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
