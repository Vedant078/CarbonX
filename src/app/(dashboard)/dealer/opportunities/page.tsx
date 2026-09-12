"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ChevronRight, 
  Factory, 
  Building2, 
  Layers, 
  Gavel, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { MatchRecord, BiddingOpportunity, CarbonSource } from "@/types";
import { Button } from "@/components/ui/button";

export default function DealerOpportunitiesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"bidding" | "matches">("bidding");
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [opportunities, setOpportunities] = useState<BiddingOpportunity[]>([]);
  const [sources, setSources] = useState<CarbonSource[]>([]);
  const [loading, setLoading] = useState(true);

  // New Auction Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionDesc, setAuctionDesc] = useState("");
  const [auctionQuantity, setAuctionQuantity] = useState("300");
  const [startingPrice, setStartingPrice] = useState("3800");
  const [minIncrement, setMinIncrement] = useState("50");
  const [durationHours, setDurationHours] = useState("48");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [matchData, oppRes, srcData] = await Promise.all([
        db.getMatches(),
        fetch("/api/bidding/opportunities"),
        db.getSources(),
      ]);

      setMatches(matchData);
      setSources(srcData);
      if (srcData.length > 0) {
        setSelectedSourceId(srcData[0].id);
      }

      if (oppRes.ok) {
        const oppJson = await oppRes.json();
        if (oppJson.opportunities) setOpportunities(oppJson.opportunities);
      }
    } catch (err) {
      console.error("Error loading dealer opportunities", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/bidding/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carbon_source_id: selectedSourceId,
          title: auctionTitle || "Spot CO₂ Supply Auction",
          description: auctionDesc,
          quantity: Number(auctionQuantity),
          starting_price: Number(startingPrice),
          minimum_bid_increment: Number(minIncrement),
          duration_hours: Number(durationHours),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.message || "Failed to create auction");
      } else {
        setActionSuccess("Bidding Auction published successfully!");
        setShowCreateModal(false);
        setAuctionTitle("");
        setAuctionDesc("");
        loadData();
      }
    } catch (err: any) {
      setActionError(err.message || "Server Error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConvertWinningBid = async (oppId: string, winningBidId?: string) => {
    if (!winningBidId) {
      setActionError("No winning bid exists for this opportunity yet.");
      return;
    }

    setSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/bidding/opportunities/${oppId}/create-proposal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bid_id: winningBidId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.message || "Failed to create commercial proposal");
      } else {
        setActionSuccess("Commercial proposal created from winning bid! Added to Dealer Proposals.");
        loadData();
      }
    } catch (err: any) {
      setActionError(err.message || "Server Error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Dealer Opportunities & Bidding</h1>
          <p className="text-sm text-muted-foreground mt-1">Orchestrate CO₂ competitive auctions and facilitate direct buyer-seller matches</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Launch CO₂ Auction
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {actionSuccess}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-border/60 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab("bidding")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold ${
            activeTab === "bidding"
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Gavel className="w-4 h-4" />
          Competitive Bidding Auctions ({opportunities.length})
        </button>

        <button
          onClick={() => setActiveTab("matches")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold ${
            activeTab === "matches"
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Direct Supply Matches ({matches.length})
        </button>
      </div>

      {/* Tab 1: Bidding Auctions */}
      {activeTab === "bidding" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {opportunities.map((opp) => {
              const currentHighest = opp.current_highest_bid || opp.starting_price;
              const hasBids = (opp.bid_count || 0) > 0;

              return (
                <div key={opp.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                        {opp.status.toUpperCase()} AUCTION
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-1.5">{opp.title}</h3>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Factory className="w-3.5 h-3.5 text-muted-foreground" /> {opp.source_company_name || opp.source?.company_name || "Industrial CO₂ Facility"} ({opp.source_location || opp.source?.location || "India"})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">CURRENT HIGHEST</span>
                      <span className="text-lg font-bold text-emerald-400">₹{currentHighest.toLocaleString()} / t</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-muted/20 p-3 rounded-xl border border-border/40 text-center">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">VOLUME</span>
                      <span className="font-bold text-foreground">{opp.quantity} tonnes</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">BIDS PLACED</span>
                      <span className="font-bold text-amber-400">{opp.bid_count || 0} bids</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">TOTAL VALUE</span>
                      <span className="font-bold text-emerald-400">₹{(currentHighest * opp.quantity).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link href={`/marketplace/bidding/${opp.id}`}>
                      <button className="px-3.5 py-1.5 rounded-lg border border-border bg-card/50 hover:bg-card text-foreground font-bold text-xs transition-all">
                        View Auction Room →
                      </button>
                    </Link>

                    {hasBids && (
                      <button
                        onClick={() => handleConvertWinningBid(opp.id, opp.winning_bid_id)}
                        disabled={submitting}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Create Proposal from Winning Bid
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Direct Matches */}
      {activeTab === "matches" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {matches.map((m) => {
            const src = m.source || m.listing;
            const req = m.requirement;
            return (
              <div key={m.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-indigo-500/40 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                      {m.score}% MATCH SCORE
                    </span>
                    <h3 className="text-base font-bold text-foreground mt-1.5">
                      {src?.company_name || "Mumbai Steel Works"} ↓ {req?.buyer_name || "GreenFuel Technologies"}
                    </h3>
                  </div>
                  <Link href={`/dealer/opportunities/${m.id}`}>
                    <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1">
                      View Opportunity <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">CARBON SOURCE</span>
                    <span className="font-bold text-foreground">{src?.company_name} ({src?.industry})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">BUYER DEMAND</span>
                    <span className="font-bold text-foreground">{req?.buyer_name || "GreenFuel Tech"} ({req?.required_quantity}t)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">POTENTIAL DEAL VALUE</span>
                    <span className="font-bold text-emerald-400">₹12.6 L</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">ESTIMATED COMMISSION</span>
                    <span className="font-bold text-indigo-400">₹63,000 (5%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Launch Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Gavel className="w-5 h-5 text-indigo-400" /> Launch Competitive CO₂ Auction
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAuction} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1">Select Industrial CO₂ Source</label>
                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-foreground font-mono focus:outline-none focus:border-indigo-500"
                >
                  {sources.map((s) => (
                    <option key={s.id} value={s.id} className="bg-card text-foreground">
                      {s.company_name} ({s.facility_name}) — {s.available_quantity} t available @ ₹{s.price_per_tonne}/t
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1">Auction Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spot 500t Ultra-Pure CO2 Auction"
                  value={auctionTitle}
                  onChange={(e) => setAuctionTitle(e.target.value)}
                  className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-foreground font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Auction Quantity (tonnes)</label>
                  <input
                    type="number"
                    required
                    value={auctionQuantity}
                    onChange={(e) => setAuctionQuantity(e.target.value)}
                    className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-foreground font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Starting Price (₹/tonne)</label>
                  <input
                    type="number"
                    required
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-foreground font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1">Min Bid Increment (₹)</label>
                  <input
                    type="number"
                    required
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-foreground font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1">Auction Duration (Hours)</label>
                  <input
                    type="number"
                    required
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    className="w-full bg-muted/30 border border-border/80 rounded-lg px-3 py-2 text-foreground font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="font-mono text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold"
                >
                  {submitting ? "Publishing..." : "Publish CO₂ Auction →"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
