"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gavel, Clock, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Building2, MapPin, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Bid } from "@/types";
import { Button } from "@/components/ui/button";

export default function BuyerMyBidsPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBids = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/bidding/my-bids", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBids(data.bids || []);
      }
    } catch (err) {
      console.error("Failed to load buyer bids", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBids();
  }, []);

  const winningBids = bids.filter((b) => b.status === "WINNING" || b.status === "ACCEPTED");
  const outbidBids = bids.filter((b) => b.status === "OUTBID");

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">My CO₂ Bids</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
              BUYER DASHBOARD
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Track active competitive bids, monitor leading status, and increase your bids on high-demand CO₂ supply opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadBids}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/buyer/marketplace"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md font-mono shrink-0 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Browse Auctions
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">TOTAL SUBMITTED BIDS</span>
            <Gavel className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{bids.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">Across all auctions</div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">LEADING / WINNING BIDS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{winningBids.length}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Currently highest bidder</div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider">OUTBID BIDS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{outbidBids.length}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Action recommended</div>
        </div>
      </div>

      {/* Bids List */}
      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center font-mono text-xs text-muted-foreground animate-pulse">
          Loading your competitive bids...
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-card border border-border/80 rounded-2xl p-12 text-center space-y-4 shadow-xs">
          <Gavel className="w-10 h-10 text-emerald-500/60 mx-auto" />
          <h3 className="font-mono text-base font-bold text-foreground">No Bids Submitted Yet</h3>
          <p className="text-xs font-mono text-muted-foreground max-w-md mx-auto">
            You haven't placed any competitive bids on industrial CO₂ supply auctions. Explore available auctions and place your bid!
          </p>
          <Link
            href="/buyer/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono shadow-md transition-all"
          >
            Browse CO₂ Auctions →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bids.map((bid) => {
              const isWinning = bid.status === "WINNING" || bid.status === "ACCEPTED";
              const isOutbid = bid.status === "OUTBID";
              const opp = bid.opportunity;

              return (
                <div
                  key={bid.id}
                  className={`bg-card border rounded-2xl p-6 space-y-4 shadow-sm transition-all flex flex-col justify-between ${
                    isWinning
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : isOutbid
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-border/80"
                  }`}
                >
                  <div className="space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-bold">
                        BID ID: {bid.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border ${
                          isWinning
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isOutbid
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {isWinning ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            WINNING (LEADING)
                          </>
                        ) : isOutbid ? (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            OUTBID
                          </>
                        ) : (
                          bid.status
                        )}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-foreground">
                        {opp?.title || `CO₂ Supply Auction`}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <Building2 className="w-3 h-3 text-emerald-400" />
                        <span>{opp?.dealer_name || "CarbonBridge Trading"}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs py-2 bg-muted/20 p-3 rounded-xl border border-border/40">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">YOUR BID PER TONNE</span>
                        <span className="font-bold text-foreground">₹{bid.amount_per_tonne.toLocaleString("en-IN")}/t</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">QUANTITY</span>
                        <span className="font-bold text-foreground">{bid.quantity} tonnes</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">TOTAL BID VALUE</span>
                        <span className="font-extrabold text-emerald-400">₹{bid.total_amount.toLocaleString("en-IN")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">SUBMITTED ON</span>
                        <span className="font-semibold text-muted-foreground">{new Date(bid.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between font-mono text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      {isOutbid ? "Increase bid to reclaim lead" : "Leading bidder"}
                    </span>
                    <Link
                      href={`/marketplace/bidding/${bid.bidding_opportunity_id}`}
                      className={`py-2 px-4 rounded-xl font-bold text-white transition-all shadow-xs flex items-center gap-1.5 ${
                        isOutbid ? "bg-amber-600 hover:bg-amber-500" : "bg-emerald-600 hover:bg-emerald-500"
                      }`}
                    >
                      <span>{isOutbid ? "Increase Bid" : "View Auction"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
