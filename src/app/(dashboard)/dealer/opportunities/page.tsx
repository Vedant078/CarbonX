"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  AlertCircle,
  X
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { MatchRecord, BiddingOpportunity, CarbonSource } from "@/types";
import { Button } from "@/components/ui/button";

export default function DealerOpportunitiesPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"bidding" | "matches">("bidding");
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [opportunities, setOpportunities] = useState<BiddingOpportunity[]>([]);
  const [sources, setSources] = useState<CarbonSource[]>([]);
  const [loading, setLoading] = useState(true);

  // New Auction Form State & Validations
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionDesc, setAuctionDesc] = useState("");
  const [auctionQuantity, setAuctionQuantity] = useState("300");
  const [startingPrice, setStartingPrice] = useState("3800");
  const [minIncrement, setMinIncrement] = useState("50");
  const [durationHours, setDurationHours] = useState("12");

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (srcData.length > 0 && !selectedSourceId) {
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

  // Escape key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCreateModal) {
        setShowCreateModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCreateModal]);

  // Validation functions
  const validateForm = () => {
    if (!selectedSourceId) return "Please select an industrial CO₂ source.";
    if (!auctionTitle.trim()) return "Auction title is required.";

    const qty = Number(auctionQuantity);
    if (isNaN(qty) || qty <= 0) return "Quantity must be greater than zero.";

    const price = Number(startingPrice);
    if (isNaN(price) || price <= 0) return "Starting price must be greater than zero.";

    const inc = Number(minIncrement);
    if (isNaN(inc) || inc < 50 || !Number.isInteger(inc)) {
      return "Minimum bid increment must be at least ₹50.";
    }

    const dur = Number(durationHours);
    if (isNaN(dur) || dur < 12 || !Number.isInteger(dur)) {
      return "Auction duration must be at least 12 hours.";
    }

    return null;
  };

  const getMinIncrementError = () => {
    if (minIncrement === "" || minIncrement === undefined) return "Minimum bid increment is required.";
    const inc = Number(minIncrement);
    if (isNaN(inc) || inc < 50) return "Minimum bid increment must be at least ₹50.";
    if (!Number.isInteger(inc)) return "Minimum bid increment must be a whole number.";
    return null;
  };

  const getDurationError = () => {
    if (durationHours === "" || durationHours === undefined) return "Auction duration is required.";
    const dur = Number(durationHours);
    if (isNaN(dur) || dur < 12) return "Auction duration must be at least 12 hours.";
    if (!Number.isInteger(dur)) return "Auction duration must be a whole number.";
    return null;
  };

  const getQuantityError = () => {
    if (auctionQuantity === "" || auctionQuantity === undefined) return "Quantity is required.";
    const qty = Number(auctionQuantity);
    if (isNaN(qty) || qty <= 0) return "Quantity must be greater than zero.";
    return null;
  };

  const getPriceError = () => {
    if (startingPrice === "" || startingPrice === undefined) return "Starting price is required.";
    const price = Number(startingPrice);
    if (isNaN(price) || price <= 0) return "Starting price must be greater than zero.";
    return null;
  };

  const minIncErr = getMinIncrementError();
  const durErr = getDurationError();
  const qtyErr = getQuantityError();
  const priceErr = getPriceError();
  const isFormInvalid = !!(minIncErr || durErr || qtyErr || priceErr || !auctionTitle.trim() || !selectedSourceId);

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    const validationError = validateForm();
    if (validationError) {
      setModalError(validationError);
      return;
    }

    setSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/bidding/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carbon_source_id: selectedSourceId,
          title: auctionTitle.trim(),
          description: auctionDesc.trim(),
          quantity: Number(auctionQuantity),
          starting_price: Number(startingPrice),
          minimum_bid_increment: Number(minIncrement),
          duration_hours: Number(durationHours),
        }),
      });

      const contentType = res.headers.get("content-type");
      let data: any = null;
      let rawText = "";

      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        try {
          rawText = await res.text();
        } catch {
          rawText = "";
        }
      }

      if (!res.ok) {
        if (data && (data.message || data.error)) {
          setModalError(data.message || data.error);
        } else if (res.status === 401) {
          setModalError("Your session has expired. Please log in again.");
        } else if (res.status === 403) {
          setModalError("You do not have permission to create an auction.");
        } else if (res.status === 404) {
          setModalError("The selected CO₂ source could not be found.");
        } else if (res.status >= 500) {
          setModalError("The auction could not be created because of a server or database error.");
        } else {
          setModalError(rawText || `Server error (HTTP ${res.status}).`);
        }
      } else {
        setActionSuccess("Bidding Auction published successfully!");
        setShowCreateModal(false);
        setAuctionTitle("");
        setAuctionDesc("");
        setMinIncrement("50");
        setDurationHours("12");
        loadData();
      }
    } catch (err: any) {
      setModalError(err?.message || "Unable to connect to server. Please check your connection.");
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
            onClick={() => {
              setModalError("");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-950/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Launch CO₂ Auction
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {actionSuccess}
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

      {/* PORTAL-RENDERED LAUNCH AUCTION MODAL */}
      {showCreateModal && mounted && createPortal(
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="launch-auction-modal-title"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
        >
          {/* Light backdrop overlay */}
          <div 
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Dialog Container - Clean Light Dashboard Theme */}
          <div className="relative z-[1010] bg-white border border-slate-200/90 rounded-xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col font-sans overflow-hidden my-auto text-slate-900">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div>
                <h2 id="launch-auction-modal-title" className="text-base font-bold font-mono text-slate-900 tracking-tight">
                  Create CO₂ auction
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  Publish captured CO₂ supply for verified industrial buyers.
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleCreateAuction} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-sans bg-white">
              {/* General Server Error Banner */}
              {modalError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-red-800 mb-0.5">Submission error</span>
                    <span>{modalError}</span>
                  </div>
                </div>
              )}

              {/* SECTION A — SUPPLY */}
              <div className="space-y-3.5">
                <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                  Supply
                </div>

                <div>
                  <label htmlFor="auction-source-select" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Industrial CO₂ source <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    id="auction-source-select"
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors font-sans truncate"
                  >
                    {sources.map((s) => (
                      <option key={s.id} value={s.id} className="bg-white text-slate-900">
                        {s.company_name} ({s.facility_name}) — {s.available_quantity}t available @ ₹{s.price_per_tonne}/t
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="auction-title-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Auction title <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    id="auction-title-input"
                    type="text"
                    required
                    placeholder="e.g. Spot 500t Ultra-Pure CO2 Auction"
                    value={auctionTitle}
                    onChange={(e) => setAuctionTitle(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors font-sans"
                  />
                </div>
              </div>

              {/* SECTION B — AUCTION DETAILS */}
              <div className="space-y-3.5 pt-2 border-t border-slate-200/80">
                <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase pt-1">
                  Auction details
                </div>

                <div>
                  <label htmlFor="auction-desc-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Auction notes or specifications <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="auction-desc-input"
                    rows={2}
                    placeholder="Purity specifications, delivery timeframe, off-take conditions..."
                    value={auctionDesc}
                    onChange={(e) => setAuctionDesc(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors resize-none font-sans"
                  />
                </div>
              </div>

              {/* SECTION C — COMMERCIAL TERMS */}
              <div className="space-y-3.5 pt-2 border-t border-slate-200/80">
                <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase pt-1">
                  Commercial terms
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Auction Quantity */}
                  <div>
                    <label htmlFor="auction-quantity-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Auction quantity (tonnes) <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      id="auction-quantity-input"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={auctionQuantity}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault();
                      }}
                      onChange={(e) => setAuctionQuantity(e.target.value)}
                      className={`w-full bg-slate-50/80 border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 transition-colors font-sans ${
                        qtyErr 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                      }`}
                    />
                    <p className="text-slate-500 text-[11px] mt-1">Must be greater than 0</p>
                    {qtyErr && (
                      <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 text-red-500" /> {qtyErr}
                      </p>
                    )}
                  </div>

                  {/* Starting Price */}
                  <div>
                    <label htmlFor="starting-price-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Starting price (₹/tonne) <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      id="starting-price-input"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={startingPrice}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault();
                      }}
                      onChange={(e) => setStartingPrice(e.target.value)}
                      className={`w-full bg-slate-50/80 border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 transition-colors font-sans ${
                        priceErr 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                      }`}
                    />
                    <p className="text-slate-500 text-[11px] mt-1">Must be greater than 0</p>
                    {priceErr && (
                      <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 text-red-500" /> {priceErr}
                      </p>
                    )}
                  </div>

                  {/* Minimum Bid Increment */}
                  <div>
                    <label htmlFor="min-increment-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Minimum bid increment (₹) <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      id="min-increment-input"
                      type="number"
                      min="50"
                      step="1"
                      required
                      value={minIncrement}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault();
                      }}
                      onChange={(e) => setMinIncrement(e.target.value)}
                      className={`w-full bg-slate-50/80 border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 transition-colors font-sans ${
                        minIncErr 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                      }`}
                    />
                    <p className="text-slate-500 text-[11px] mt-1">Minimum allowed: ₹50</p>
                    {minIncErr && (
                      <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 text-red-500" /> {minIncErr}
                      </p>
                    )}
                  </div>

                  {/* Auction Duration */}
                  <div>
                    <label htmlFor="duration-hours-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Auction duration (hours) <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                      id="duration-hours-input"
                      type="number"
                      min="12"
                      step="1"
                      required
                      value={durationHours}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E' || e.key === '.') e.preventDefault();
                      }}
                      onChange={(e) => setDurationHours(e.target.value)}
                      className={`w-full bg-slate-50/80 border rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-1 transition-colors font-sans ${
                        durErr 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                          : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-600'
                      }`}
                    />
                    <p className="text-slate-500 text-[11px] mt-1">Minimum allowed: 12 hours</p>
                    {durErr && (
                      <p className="text-red-600 text-[11px] font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 text-red-500" /> {durErr}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-3 shrink-0 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isFormInvalid}
                  className={`px-5 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-md ${
                    submitting || isFormInvalid
                      ? "bg-indigo-600/40 text-white/70 border border-indigo-600/30 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/20 active:scale-[0.98]"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish auction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
