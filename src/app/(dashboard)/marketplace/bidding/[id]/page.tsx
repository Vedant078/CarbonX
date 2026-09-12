"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  TrendingUp,
  ShieldCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { BiddingOpportunity, Bid } from "@/types";

export default function BiddingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [opportunity, setOpportunity] = useState<BiddingOpportunity | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [bidAmount, setBidAmount] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isEnded: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  });

  const loadData = async () => {
    try {
      const res = await fetch(`/api/bidding/opportunities/${id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setOpportunity(data.opportunity);
        setBids(data.bids || []);

        const minNext = data.opportunity.bid_count === 0
          ? data.opportunity.starting_price
          : data.opportunity.current_highest_bid + data.opportunity.minimum_bid_increment;

        setBidAmount(String(minNext));
        setQuantity(String(data.opportunity.quantity));
      }
    } catch (err) {
      console.error("Failed to load bidding opportunity", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!opportunity?.auction_end_time) return;

    const updateCountdown = () => {
      const diff = new Date(opportunity.auction_end_time).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isEnded: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isEnded: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [opportunity?.auction_end_time]);

  const numAmount = Number(bidAmount) || 0;
  const numQty = Number(quantity) || 0;
  const totalCost = numAmount * numQty;

  const minRequiredNextBid = opportunity
    ? opportunity.bid_count === 0
      ? opportunity.starting_price
      : opportunity.current_highest_bid + opportunity.minimum_bid_increment
    : 0;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (numAmount < minRequiredNextBid) {
      setError(`Your bid must be at least ₹${minRequiredNextBid.toLocaleString("en-IN")} per tonne.`);
      return;
    }

    if (opportunity && numQty > opportunity.quantity) {
      setError(`Quantity cannot exceed available ${opportunity.quantity} tonnes.`);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmBid = async () => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/bidding/opportunities/${id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_per_tonne: numAmount,
          quantity: numQty,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit bid");
      }

      setSuccessMessage(data.message || "Your bid was placed successfully!");
      setShowConfirmModal(false);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Bid submission failed");
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 font-mono text-white">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-spin">
          <Zap className="w-5 h-5 text-emerald-400" />
        </div>
        <p className="text-xs text-slate-400">Loading Bidding Opportunity Details...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-8 text-center font-mono space-y-4">
        <p className="text-red-400 text-sm font-bold">Bidding Opportunity Not Found</p>
        <Link href="/buyer/marketplace" className="text-xs text-emerald-600 underline">
          ← Return to Marketplace
        </Link>
      </div>
    );
  }

  const isBuyer = user?.role === "BUYER";
  const source = opportunity.source;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto font-sans">
      {/* Back Link */}
      <Link
        href={isBuyer ? "/buyer/marketplace" : "/dealer/opportunities"}
        className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-mono font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {/* Hero Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> COMPETITIVE BIDDING OPPORTUNITY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                {opportunity.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">{opportunity.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {source?.company_name || "Industrial Facility"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {source?.location || "India"}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {source?.verification_status || "VERIFIED"}
              </span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
              TIME REMAINING
            </span>
            {timeLeft.isEnded ? (
              <span className="text-base font-bold font-mono text-red-400">BIDDING ENDED</span>
            ) : (
              <div className="text-xl font-bold font-mono text-emerald-400 flex items-center justify-center gap-1">
                <Clock className="w-5 h-5 animate-pulse text-emerald-400" />
                <span>{String(timeLeft.hours).padStart(2, "0")}h</span>
                <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>
                <span>{String(timeLeft.seconds).padStart(2, "0")}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-4 rounded-xl font-mono flex items-center gap-2 shadow-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl font-mono flex items-center gap-2 shadow-sm font-semibold">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Info + Bid Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Bid History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specifications Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold font-mono text-slate-900 border-b border-slate-200 pb-3">
              CO₂ Technical Specifications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">TOTAL QUANTITY</span>
                <span className="text-base font-bold text-slate-900">{opportunity.quantity} tonnes</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">CO₂ PURITY</span>
                <span className="text-base font-bold text-slate-900">{source?.purity || 99.2}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">CAPTURE METHOD</span>
                <span className="text-xs font-bold text-slate-900 truncate block">{source?.capture_method || "Amine Solvent"}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">STARTING PRICE</span>
                <span className="text-base font-bold text-slate-900">₹{opportunity.starting_price.toLocaleString("en-IN")}/t</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">MIN INCREMENT</span>
                <span className="text-base font-bold text-emerald-700">₹{opportunity.minimum_bid_increment}/t</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">TOTAL BIDS</span>
                <span className="text-base font-bold text-slate-900">{opportunity.bid_count} bids</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-relaxed pt-2">
              {opportunity.description}
            </p>
          </div>

          {/* Bid History Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold font-mono text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Real-Time Bid History
              </h2>
              <span className="text-xs font-mono text-slate-500">{bids.length} submitted bids</span>
            </div>

            {bids.length === 0 ? (
              <div className="text-center py-8 font-mono text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No bids submitted yet. Be the first Buyer to place a bid!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                      <th className="py-2.5 px-3">BIDDER COMPANY</th>
                      <th className="py-2.5 px-3">BID / TONNE</th>
                      <th className="py-2.5 px-3">QUANTITY</th>
                      <th className="py-2.5 px-3">TOTAL VALUE</th>
                      <th className="py-2.5 px-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bids.map((b) => {
                      const isWinning = b.status === "WINNING" || b.status === "ACCEPTED";
                      return (
                        <tr key={b.id} className={isWinning ? "bg-emerald-50/60 font-semibold" : "hover:bg-slate-50"}>
                          <td className="py-3 px-3 text-slate-900">
                            {b.bidder_company}
                            {b.bidder_id === user?.id && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950 font-bold">
                                YOU
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-900 font-bold">
                            ₹{b.amount_per_tonne.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-slate-700">{b.quantity} t</td>
                          <td className="py-3 px-3 text-slate-900">
                            ₹{b.total_amount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isWinning
                                  ? "bg-emerald-600 text-white"
                                  : b.status === "OUTBID"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Place Bid Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-md sticky top-6">
            <div className="space-y-1 text-center border-b border-slate-200 pb-4">
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
                CURRENT HIGHEST BID
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-700">
                ₹{opportunity.current_highest_bid.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-500 ml-1">/ tonne</span>
              </div>
              <span className="text-xs font-mono text-slate-600 block pt-1">
                Minimum next bid: <strong className="text-slate-900">₹{minRequiredNextBid.toLocaleString("en-IN")}/t</strong>
              </span>
            </div>

            {isBuyer ? (
              <form onSubmit={handleOpenConfirm} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Your Bid per Tonne (₹)</label>
                  <input
                    type="number"
                    required
                    min={minRequiredNextBid}
                    step={opportunity.minimum_bid_increment}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Must be ≥ ₹{minRequiredNextBid.toLocaleString("en-IN")} (Increment ₹{opportunity.minimum_bid_increment})
                  </span>
                </div>

                <div>
                  <label className="block text-slate-800 font-bold mb-1">Required Quantity (Tonnes)</label>
                  <input
                    type="number"
                    required
                    max={opportunity.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Total CO₂ Cost:</span>
                    <span className="font-bold text-slate-900">₹{totalCost.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Dealer Commission (5%):</span>
                    <span>₹{Math.round(totalCost * 0.05).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={timeLeft.isEnded || submitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>{timeLeft.isEnded ? "Bidding Ended" : "Place Bid →"}</span>
                </button>
              </form>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2 font-mono text-xs text-slate-600">
                <p className="font-bold text-slate-800">Dealer Review Mode</p>
                <p className="text-[11px]">Bidding is reserved for authenticated Buyers. Dealers can review winning bids and draft commercial proposals.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="space-y-1 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-mono text-slate-900">Confirm Your Bid</h3>
              <p className="text-xs text-slate-600">Please review your competitive bid parameters before submitting.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">CO₂ Facility:</span>
                <span className="font-bold text-slate-900">{source?.company_name || "Supplier Facility"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Bid per Tonne:</span>
                <span className="font-bold text-emerald-700">₹{numAmount.toLocaleString("en-IN")}/t</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-bold text-slate-900">{numQty} tonnes</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-600 font-bold">Total Bid Amount:</span>
                <span className="font-extrabold text-slate-900">₹{totalCost.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold text-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBid}
                disabled={submitting}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Confirm & Place Bid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
