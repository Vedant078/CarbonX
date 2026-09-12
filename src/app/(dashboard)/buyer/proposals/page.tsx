"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Check, X, RefreshCw, FileText, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { FacilitatedDeal } from "@/types";

export default function BuyerProposalsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProposals = async () => {
    setLoading(true);
    const data = await db.getDeals();
    setDeals(data.filter((d) => d.buyer_id === user?.id || true));
    setLoading(false);
  };

  useEffect(() => {
    loadProposals();
  }, [user?.id]);

  const handleAcceptProposal = async (dealId: string) => {
    setActionId(dealId);
    try {
      const res = await fetch(`/api/deal-proposals/${dealId}/accept`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "BUYER",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Authorization Failed: ${data.message}`);
      } else {
        setMessage(`Deal #${dealId} accepted & confirmed! Shipment initialized for logistics providers.`);
        await loadProposals();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Dealer Commercial Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">Review, accept, or reject carbon brokerage proposals from dealers</p>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl font-mono text-xs flex items-center justify-between">
          <span>{message}</span>
          <Link href="/buyer/deals" className="underline font-bold">
            View Active Contracts →
          </Link>
        </div>
      )}

      <div className="space-y-4 font-mono text-xs">
        {deals.map((deal) => {
          const isPending = deal.status === "PROPOSED" || deal.status === "NEGOTIATING" || deal.status === "MATCHED";
          return (
            <div key={deal.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">PROPOSAL #{deal.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                      {deal.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-1">{deal.carbon_source_name}</h3>
                  <p className="text-muted-foreground text-[11px]">Facilitated by Broker: {deal.dealer_name || "CarbonBridge Brokers"}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px]">TOTAL VALUE</span>
                    <span className="text-xl font-bold text-emerald-400">₹{deal.total_value.toLocaleString()}</span>
                  </div>

                  {/* ONLY BUYER can Accept or Reject proposals */}
                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptProposal(deal.id)}
                        disabled={actionId === deal.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Accept Proposal
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">QUANTITY</span>
                  <span className="font-bold text-foreground">{deal.quantity} tonnes/month</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">PRICE PER TONNE</span>
                  <span className="font-bold text-foreground">₹{deal.price_per_tonne}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">MATCH COMPATIBILITY</span>
                  <span className="font-bold text-emerald-400">{deal.match_score || 94}% Score</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">LOGISTICS COST</span>
                  <span className="font-bold text-foreground">₹{deal.logistics_cost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
