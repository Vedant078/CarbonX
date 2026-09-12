"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, MapPin, Factory, ArrowRight, CheckCircle2, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { CarbonSource } from "@/types";

export default function BuyerMarketplacePage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<CarbonSource[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [minPurity, setMinPurity] = useState<number>(95);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSupply() {
      const data = await db.getSources();
      setSources(data);
    }
    loadSupply();
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

  const handleRequestSupply = async (source: CarbonSource) => {
    setRequestingId(source.id);
    try {
      const res = await fetch("/api/supply-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "BUYER",
        },
        body: JSON.stringify({
          carbon_source_id: source.id,
          quantity: 300,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Authorization Failed: ${data.message}`);
      } else {
        setRequestSuccess(`Supply request created for ${source.company_name}!`);
        setTimeout(() => setRequestSuccess(null), 4000);
      }
    } catch (e: any) {
      console.error(e);
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">CO₂ Marketplace Supply</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
              BUYER DEMAND MODE
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Search verified industrial capture facilities and submit supply requests directly.
          </p>
        </div>

        <Link
          href="/buyer/requirements/new"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all font-mono"
        >
          + Post Requirement
        </Link>
      </div>

      {requestSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl font-mono text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {requestSuccess}
          </span>
          <Link href="/buyer/requests" className="underline font-bold">
            View Requests →
          </Link>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-card/40 border border-border/60 p-4 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search company, location, or process (e.g. Steel, Pune)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-muted/20 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full px-3 py-2 bg-muted/20 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Industrial Sectors</option>
            <option value="Steel">Steel & Ferrous Metallurgy</option>
            <option value="Cement">Cement & Building Materials</option>
            <option value="Power">Power Generation & Thermal</option>
            <option value="Chemical">Chemical & Petrochemical</option>
          </select>
        </div>

        <div>
          <select
            value={minPurity}
            onChange={(e) => setMinPurity(Number(e.target.value))}
            className="w-full px-3 py-2 bg-muted/20 border border-border/60 rounded-lg text-foreground focus:outline-none focus:border-emerald-500"
          >
            <option value={90}>Min Purity: 90%+</option>
            <option value={95}>Min Purity: 95%+</option>
            <option value={99}>Min Purity: 99%+</option>
            <option value={99.5}>Min Purity: 99.5%+</option>
          </select>
        </div>
      </div>

      {/* Supply Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSources.map((item) => (
          <div
            key={item.id}
            className="bg-card/40 border border-border/80 rounded-2xl p-6 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
                  {item.industry}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">94% MATCH</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                  {item.company_name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {item.location} ({item.facility_name})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/40 text-xs">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase">AVAILABLE CAPACITY</span>
                  <span className="font-bold text-foreground">{item.available_quantity} t/month</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase">PURITY LEVEL</span>
                  <span className="font-bold text-emerald-400">{item.purity}% Pure</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block">UNIT PRICE</span>
                  <span className="text-base font-bold text-foreground">₹{item.price_per_tonne.toLocaleString()} / t</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase block">ESTIMATED FREIGHT</span>
                  <span className="text-xs font-semibold text-foreground">₹18,500</span>
                </div>
              </div>
            </div>

            {/* ONLY BUYER gets Request Supply button */}
            <button
              onClick={() => handleRequestSupply(item)}
              disabled={requestingId === item.id}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {requestingId === item.id ? "Submitting Request..." : "Request Supply"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
