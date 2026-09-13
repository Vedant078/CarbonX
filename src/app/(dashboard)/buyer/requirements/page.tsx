"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FilePlus, MapPin, RefreshCw, AlertTriangle, Calendar, Layers, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { BuyerRequirement } from "@/types";

export default function BuyerRequirementsPage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requirements", {
        cache: "no-store",
        headers: {
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "BUYER",
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server returned error status ${res.status}`);
      }

      const data = await res.json();
      const list = data.requirements || data.data?.requirements || [];
      setRequirements(list);
    } catch (err: any) {
      console.error("[buyer/requirements] Failed to fetch requirements:", err);
      setError(err.message || "Failed to load requirements. Please try again.");
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">My CO₂ Requirements</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage active industrial carbon demand profiles</p>
        </div>
        <Link href="/buyer/requirements/new">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono shadow-md transition-all active:scale-95">
            + Create Requirement
          </button>
        </Link>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 bg-card/20 rounded-2xl border border-border/40 font-mono">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading CO₂ supply requirements...</p>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Unable to load requirements
          </div>
          <p>{error}</p>
          <button
            onClick={fetchRequirements}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {!loading && !error && requirements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-card/20 border border-dashed border-border/80 rounded-2xl space-y-4 text-center font-mono">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FilePlus className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-foreground">No CO₂ requirements yet.</h3>
            <p className="text-xs text-muted-foreground">
              Post your industrial CO₂ supply specifications to discover compatible verified dealers and receive customized quotes.
            </p>
          </div>
          <Link href="/buyer/requirements/new">
            <button className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all active:scale-95">
              + Create Requirement
            </button>
          </Link>
        </div>
      )}

      {!loading && !error && requirements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {requirements.map((req) => (
            <div key={req.id} className="bg-card/40 border border-border/80 p-5 rounded-xl space-y-3 hover:border-emerald-500/40 transition-all shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{req.title || `${req.required_quantity}t CO₂ Requirement`}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" /> {req.location}
                    </span>
                    {req.created_at && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">
                  {req.status || "ACTIVE"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/40">
                <div>
                  Quantity: <span className="text-foreground font-bold">{req.required_quantity} t/mo</span>
                </div>
                <div>
                  Min Purity: <span className="text-emerald-400 font-bold">{req.required_purity}%</span>
                </div>
                <div>
                  Application: <span className="text-foreground font-semibold">{req.application}</span>
                </div>
                <div>
                  Max Price: <span className="text-foreground font-semibold">₹{req.max_price?.toLocaleString() || req.max_price}/t</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
