"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Search, 
  FilePlus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Plus, 
  ArrowRight, 
  ShieldCheck, 
  Factory,
  MapPin,
  Sparkles,
  TrendingDown
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { 
  CarbonSource, 
  BuyerRequirement, 
  MatchRecord, 
  FacilitatedDeal, 
  LogisticsShipment,
  Bid 
} from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MatchScoreBadge } from "@/components/ui/match-score-badge";
import { Gavel, AlertTriangle } from "lucide-react";

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [topMatch, setTopMatch] = useState<MatchRecord | null>(null);
  const [requests, setRequests] = useState<FacilitatedDeal[]>([]);
  const [deals, setDeals] = useState<FacilitatedDeal[]>([]);
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<any[]>([]);

  useEffect(() => {
    async function loadBuyerData() {
      try {
        const [matchesData, requestsData, dealsData, shipmentsData, reqsData] = await Promise.all([
          db.getMatches(),
          db.getRequests(),
          db.getDeals(),
          db.getShipments(),
          db.getRequirements(),
        ]);

        if (matchesData.length > 0) setTopMatch(matchesData[0]);
        setRequests(requestsData.filter((r: any) => r.buyer_id === user?.id || true));
        setDeals(dealsData.filter((d: FacilitatedDeal) => d.buyer_id === user?.id || true));
        setShipments(shipmentsData);
        setRequirements(reqsData.filter((r: any) => r.buyer_id === user?.id || true));

        // Fetch my bids
        const resBids = await fetch("/api/bidding/my-bids");
        if (resBids.ok) {
          const dataBids = await resBids.json();
          if (dataBids.bids) setBids(dataBids.bids);
        }

        // Fetch live bidding opportunities for Live CO2 Auctions section
        const resOpps = await fetch("/api/bidding/opportunities");
        if (resOpps.ok) {
          const dataOpps = await resOpps.json();
          if (dataOpps.opportunities) setLiveAuctions(dataOpps.opportunities);
        }
      } catch (err) {
        console.error("Error loading buyer dashboard", err);
      }
    }
    loadBuyerData();
  }, [user?.id]);

  const source = topMatch?.source || topMatch?.listing;

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
              Good morning, {user?.company || "GreenFuel Technologies"}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
              BUYER WORKSPACE
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Discover compatible carbon supply, accept dealer proposals, and manage your CO₂ demand.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/buyer/marketplace">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20 transition-all active:scale-95 cursor-pointer">
              <Gavel className="w-3.5 h-3.5" />
              Browse CO₂ Auctions
            </button>
          </Link>
          <Link href="/buyer/requirements/new">
            <button className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border bg-card/50 text-foreground hover:bg-card transition-all active:scale-95 cursor-pointer">
              <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
              + Create Requirement
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">CO₂ REQUIRED</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">300 t/mo</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">Purity &gt; 99%</div>
        </div>

        <Link href="/buyer/bids" className="block">
          <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-amber-500/40 transition-all cursor-pointer">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-medium font-mono uppercase tracking-wider">ACTIVE BIDS</span>
              <Gavel className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">{bids.length}</div>
            <div className="text-xs text-emerald-400 mt-1 font-mono">
              {bids.filter(b => b.status === 'WINNING' || b.status === 'ACCEPTED').length} Winning
            </div>
          </div>
        </Link>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">ACTIVE REQUESTS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{requests.length || 3}</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">Awaiting proposals</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">ACTIVE DEALS</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{deals.length || 2}</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">Contracts active</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">ESTIMATED SAVINGS</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">₹4.2 L</div>
          <div className="text-xs text-emerald-400 mt-1 font-mono">vs standard market</div>
        </div>
      </div>

      {/* Section — Live CO2 Auctions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            LIVE CO₂ AUCTIONS ({liveAuctions.length})
          </h2>
          <Link href="/buyer/marketplace" className="text-xs text-emerald-400 hover:underline font-mono">
            View All Auctions →
          </Link>
        </div>

        {liveAuctions.length === 0 ? (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-8 text-center space-y-3 font-mono text-xs">
            <p className="text-muted-foreground">No live auctions are available right now.</p>
            <Link
              href="/buyer/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {liveAuctions.slice(0, 3).map((opp: any) => (
              <div key={opp.id} className="bg-card/40 border border-border/80 rounded-2xl p-5 hover:border-emerald-500/40 transition-all space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {opp.status} • {opp.bid_count} Bids
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" /> LIVE
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-sm line-clamp-1">{opp.title}</h3>
                  <p className="text-xs text-muted-foreground">{opp.dealer_name || opp.source?.company_name || 'CarbonBridge Trading'}</p>

                  <div className="grid grid-cols-2 gap-2 bg-muted/20 p-2.5 rounded-xl border border-border/40 text-[11px]">
                    <div>
                      <span className="text-muted-foreground text-[9px] block uppercase">CO₂ QUANTITY</span>
                      <span className="font-bold text-foreground">{opp.quantity} tonnes</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[9px] block uppercase">CURRENT HIGHEST</span>
                      <span className="font-bold text-emerald-400">₹{opp.current_highest_bid?.toLocaleString('en-IN')}/t</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-border/40">
                  <Link href={`/marketplace/bidding/${opp.id}`}>
                    <Button size="sm" variant="ghost" className="h-7 text-xs font-mono text-muted-foreground hover:text-foreground">
                      View Auction
                    </Button>
                  </Link>
                  <Link href={`/marketplace/bidding/${opp.id}`}>
                    <Button size="sm" className="h-7 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white">
                      Place Bid →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section — Active Bids Summary */}
      {bids.length > 0 && (
        <div className="bg-card/40 border border-border/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h2 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
              <Gavel className="w-5 h-5 text-amber-400" />
              MY COMPETITIVE BIDS ({bids.length})
            </h2>
            <Link href="/buyer/marketplace" className="text-xs text-amber-400 font-mono hover:underline">
              Browse Bidding Auctions →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bids.map((bid) => (
              <div 
                key={bid.id} 
                className={`p-4 rounded-xl border transition-all ${
                  bid.status === 'WINNING' 
                    ? 'bg-emerald-950/10 border-emerald-500/30' 
                    : 'bg-amber-950/10 border-amber-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider block">OPPORTUNITY #{bid.bidding_opportunity_id}</span>
                    <h3 className="font-bold text-foreground font-mono text-sm mt-0.5">
                      {bid.title || `CO₂ Supply Auction`}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono flex items-center gap-1 ${
                    bid.status === 'WINNING'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {bid.status === 'WINNING' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        HIGHEST BIDDER
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        OUTBID
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/30 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">MY BID RATE</span>
                    <span className="font-bold text-foreground text-sm">₹{bid.amount_per_tonne.toLocaleString()} / tonne</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] block">TOTAL VALUE ({bid.quantity} t)</span>
                    <span className="font-bold text-emerald-400 text-sm">₹{bid.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Placed: {new Date(bid.created_at).toLocaleDateString()}
                  </span>
                  <Link href={`/marketplace/bidding/${bid.bidding_opportunity_id}`}>
                    <Button size="sm" className="h-7 text-xs font-mono bg-amber-600 hover:bg-amber-500 text-white">
                      {bid.status === 'OUTBID' ? 'Increase Bid →' : 'View Bidding Room →'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Section — Recommended CO₂ Supply */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            RECOMMENDED CO₂ SUPPLY MATCH
          </h2>
          <Link href="/buyer/marketplace" className="text-xs text-emerald-400 hover:underline font-mono">
            Browse All Marketplace Supply →
          </Link>
        </div>

        {source && (
          <div className="bg-card/40 border border-border/80 rounded-2xl p-6 hover:border-emerald-500/40 transition-all space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-foreground font-mono">{source.company_name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    94% MATCH
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
                  <Factory className="w-3.5 h-3.5 text-muted-foreground" /> {source.facility_name} ({source.industry}) •
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {source.location}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block font-mono">PRICE PER TONNE</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">₹{source.price_per_tonne.toLocaleString()}</span>
                </div>
                <Link href="/buyer/marketplace">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all active:scale-95 shadow-md shadow-emerald-950/40">
                    Request Supply <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-muted/20 p-3 rounded-lg border border-border/40">
                <span className="text-muted-foreground block text-[10px] uppercase">AVAILABLE CAPACITY</span>
                <span className="text-foreground font-bold text-sm">{source.available_quantity} tonnes/mo</span>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border/40">
                <span className="text-muted-foreground block text-[10px] uppercase">CO₂ PURITY</span>
                <span className="text-emerald-400 font-bold text-sm">{source.purity}% Pure</span>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border/40">
                <span className="text-muted-foreground block text-[10px] uppercase">LOGISTICS ROUTE</span>
                <span className="text-foreground font-bold text-sm">Mumbai → Pune</span>
              </div>
              <div className="bg-muted/20 p-3 rounded-lg border border-border/40">
                <span className="text-muted-foreground block text-[10px] uppercase">ESTIMATED LOGISTICS</span>
                <span className="text-foreground font-bold text-sm">₹18,500</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: My Requirements & Dealer Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirements */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
              <FilePlus className="w-4 h-4 text-emerald-400" />
              My CO₂ Requirements
            </h3>
            <Link href="/buyer/requirements/new" className="text-xs text-emerald-400 font-mono hover:underline">
              + Add New
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {requirements.map((req) => (
              <div key={req.id} className="p-3.5 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">{req.required_quantity} t/mo — {req.application}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">Location: {req.location} • Purity ≥ {req.required_purity}%</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Incoming Proposals */}
        <div className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <h3 className="text-base font-bold font-mono text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Dealer Proposals & Contracts
            </h3>
            <Link href="/buyer/proposals" className="text-xs text-indigo-400 font-mono hover:underline">
              View All Proposals →
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {deals.slice(0, 3).map((deal) => (
              <div key={deal.id} className="p-3.5 rounded-lg bg-muted/20 border border-border/40 flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">{deal.carbon_source_name}</div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    {deal.quantity} tonnes @ ₹{deal.price_per_tonne}/t via {deal.dealer_name || "CarbonBridge Brokers"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">₹{deal.total_value.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{deal.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
