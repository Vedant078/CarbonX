"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Factory, Building2, Send, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { MatchRecord } from "@/types";

export default function DealerOpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [match, setMatch] = useState<MatchRecord | null>(null);

  const [quantity, setQuantity] = useState("300");
  const [price, setPrice] = useState("4200");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadMatch() {
      if (params?.id) {
        const data = await db.getMatchById(params.id as string);
        if (data) setMatch(data);
      }
    }
    loadMatch();
  }, [params?.id]);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/deal-proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "DEALER",
        },
        body: JSON.stringify({
          buyer_id: match?.requirement?.buyer_id || "user-buyer-demo",
          buyer_name: match?.requirement?.buyer_name || "GreenFuel Technologies",
          carbon_source_id: match?.carbon_source_id || "src-mumbai-steel",
          carbon_source_name: match?.source?.company_name || "Mumbai Steel Works",
          quantity: Number(quantity),
          price_per_tonne: Number(price),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Authorization Failed");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/dealer/proposals"), 2000);
      }
    } catch (err: any) {
      setError(err.message || "Server Error");
    } finally {
      setSubmitting(false);
    }
  };

  const src = match?.source || match?.listing;
  const req = match?.requirement;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 font-sans flex items-center justify-center">
      <div className="max-w-3xl w-full bg-card/60 border border-border/80 p-8 rounded-2xl space-y-6 shadow-2xl">
        <div className="space-y-2 border-b border-border/40 pb-4">
          <Link href="/dealer/opportunities" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to opportunities
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-mono text-foreground">Brokerage Opportunity Detail</h1>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
              {match?.score || 94}% MATCH SCORE
            </span>
          </div>
        </div>

        {/* Pairing Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 bg-muted/20 border border-border/40 rounded-xl space-y-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> BUYER DEMAND
            </span>
            <div className="font-bold text-foreground text-sm">{req?.buyer_name || "GreenFuel Technologies"}</div>
            <div className="text-muted-foreground">Requirement: {req?.required_quantity || 300} tonnes/mo • {req?.required_purity || 99.5}% purity</div>
            <div className="text-muted-foreground">Location: {req?.location || "Pune, MH"}</div>
          </div>

          <div className="p-4 bg-muted/20 border border-border/40 rounded-xl space-y-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Factory className="w-3.5 h-3.5 text-emerald-400" /> CARBON SOURCE
            </span>
            <div className="font-bold text-foreground text-sm">{src?.company_name || "Mumbai Steel Works"}</div>
            <div className="text-muted-foreground">Available: {src?.available_quantity || 500} tonnes/mo • {src?.purity || 99.7}% purity</div>
            <div className="text-muted-foreground">Location: {src?.location || "Mumbai, MH"}</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg font-mono">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg font-mono flex items-center gap-2">
            <Check className="w-4 h-4" /> Dealer Proposal Created! Redirecting to Proposals Manager...
          </div>
        )}

        {/* Dealer Proposal Creation Form */}
        <form onSubmit={handleCreateProposal} className="space-y-4 font-mono text-xs pt-2">
          <h2 className="text-base font-bold text-foreground">Create Deal Proposal</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Proposal Volume (tonnes/mo)</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Agreed Price (₹/tonne)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Carbon Value (3 mo agreement):</span>
              <span className="font-bold text-foreground">₹{(Number(quantity) * Number(price) * 3).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dealer Commission (5%):</span>
              <span className="font-bold text-indigo-400">₹{(Number(quantity) * Number(price) * 3 * 0.05).toLocaleString()}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-mono text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Sending Proposal to Buyer..." : "Create & Send Proposal →"}
          </button>
        </form>
      </div>
    </div>
  );
}
