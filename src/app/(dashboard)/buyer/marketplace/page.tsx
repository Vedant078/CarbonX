"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, MapPin, Factory, ArrowRight, CheckCircle2, Send, Sparkles, TrendingUp, Clock, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { CarbonSource, BiddingOpportunity } from "@/types";

export default function BuyerMarketplacePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"BIDDING" | "DIRECT">("BIDDING");
  const [sources, setSources] = useState<CarbonSource[]>([]);
  const [opportunities, setOpportunities] = useState<BiddingOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [minPurity, setMinPurity] = useState<number>(95);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [sourcesData, oppsData] = await Promise.all([
        db.getSources(),
        db.getBiddingOpportunities(),
      ]);
      setSources(sourcesData);
      setOpportunities(oppsData);
    }
    loadData();
  }, []);

  const filteredSources = useMemo(() => {
    return sources.filter((item) => {
      const matchSearch =
        !search ||
        item.company_name.toLowerCase().includes(search.toLowerCase()) ||
        item.facility_name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.industry.toLowerCase().includes(search.toLowerCase());

      const matchIndustry = selectedIndustry === "ALL" || item.industry === selectedIndustry;
      const matchPurity = item.purity >= minPurity;

      return matchSearch && matchIndustry && matchPurity;
    });
  }, [sources, search, selectedIndustry, minPurity]);

  const filteredOpps = useMemo(() => {
    return opportunities.filter((item) => {
      if (item.status === "CANCELLED") return false;
      return (
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [opportunities, search]);

  const handleRequestSupply = async (source: CarbonSource) => {
    setRequestingId(source.id);
    setRequestError(null);
    setRequestSuccess(null);

    try {
      const res = await fetch("/api/supply-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carbon_source_id: source.id,
          quantity: 300,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok) {
        const errMsg = data?.error?.message || data?.message || "Unable to submit supply request. Please try again.";
        setRequestError(errMsg);
      } else {
        setRequestSuccess(`Supply request created for ${source.company_name}!`);
        setTimeout(() => setRequestSuccess(null), 5000);
      }
    } catch (e: any) {
      console.error(e);
      setRequestError("The backend service is temporarily unavailable. Please try again.");
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">CO₂ Marketplace & Bidding</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
              BUYER DEMAND MODE
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Participate in competitive bidding opportunities or submit direct supply requests to industrial capture facilities.
          </p>
        </div>

        <Link
          href="/buyer/requirements/new"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all font-mono shrink-0"
        >
          + Post Requirement
        </Link>
      </div>

      {requestError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-4 rounded-xl font-mono text-xs flex items-center justify-between animate-in fade-in">
          <span>{requestError}</span>
          <button onClick={() => setRequestError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
        </div>
      )}

      {requestSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 p-4 rounded-xl font-mono text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {requestSuccess}
          </span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab("BIDDING")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
            activeTab === "BIDDING"
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Competitive Bidding ({opportunities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("DIRECT")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
            activeTab === "DIRECT"
              ? "bg-slate-900 text-white border-slate-900 shadow-md"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Factory className="w-4 h-4 text-emerald-400" />
          <span>Direct Supply Listings ({sources.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search facility name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {/* TAB 1: COMPETITIVE BIDDING OPPORTUNITIES */}
      {activeTab === "BIDDING" && (
        <div className="space-y-4">
          {filteredOpps.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="font-mono text-base font-bold text-slate-900">No Bidding Opportunities Found</h3>
              <p className="text-xs font-mono text-slate-500 max-w-md mx-auto">
                There are currently no active CO₂ auctions matching your criteria. Check back shortly or post your custom requirement!
              </p>
              <Link
                href="/buyer/requirements/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono transition-all"
              >
                + Post Buyer Requirement
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOpps.map((opp) => {
                const src = opp.source;
                const companyName = opp.dealer_name || src?.company_name || "CarbonBridge Trading";
                const location = src?.location || "Mumbai, Maharashtra";
                const purity = src?.purity || 99.2;
                const verification = src?.verification_status || "VERIFIED";
                const isLive = opp.status === "LIVE";

                return (
                  <div
                    key={opp.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            isLive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}>
                            {opp.status} • {opp.bid_count} Bids
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {verification}
                          </span>
                        </div>

                        <span className="text-xs font-mono text-slate-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {isLive ? "LIVE AUCTION" : "UPCOMING"}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold font-mono text-slate-900">{opp.title}</h2>
                        <p className="text-xs font-mono text-slate-600 mt-1 flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{companyName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {location}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-xs py-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-500 block">CO₂ QUANTITY</span>
                          <span className="font-bold text-slate-900">{opp.quantity} tonnes</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">PURITY</span>
                          <span className="font-bold text-slate-900">{purity}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">STARTING PRICE</span>
                          <span className="font-bold text-slate-700">₹{opp.starting_price.toLocaleString("en-IN")}/t</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">CURRENT HIGHEST</span>
                          <span className="font-extrabold text-emerald-700">₹{opp.current_highest_bid.toLocaleString("en-IN")}/t</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
                        {opp.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        Increment: ₹{opp.minimum_bid_increment}/t
                      </span>
                      <Link
                        href={`/marketplace/bidding/${opp.id}`}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <span>Place Bid</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT SUPPLY LISTINGS */}
      {activeTab === "DIRECT" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {item.industry}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {item.verification_status}
                  </span>
                </div>

                <div>
                  <h3 className="font-mono text-base font-bold text-slate-900">{item.company_name}</h3>
                  <p className="text-xs font-mono text-slate-500">{item.facility_name}</p>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-slate-600 border-t border-b border-slate-100 py-3">
                  <div className="flex justify-between">
                    <span>Available Supply:</span>
                    <span className="font-bold text-slate-900">{item.available_quantity} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CO₂ Purity:</span>
                    <span className="font-bold text-slate-900">{item.purity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unit Price:</span>
                    <span className="font-bold text-emerald-700">₹{item.price_per_tonne.toLocaleString("en-IN")}/tonne</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRequestSupply(item)}
                disabled={requestingId === item.id}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 font-mono text-xs font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{requestingId === item.id ? "Submitting..." : "Submit Supply Request"}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
