"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Truck, MapPin, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { LogisticsShipment } from "@/types";

export default function LogisticsAvailableJobsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const loadJobs = async () => {
    const data = await db.getShipments();
    setShipments(data.filter((s) => s.status === "AWAITING_LOGISTICS"));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleAcceptJob = async (id: string) => {
    setClaimingId(id);
    try {
      const res = await fetch(`/api/shipments/${id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "LOGISTICS_PROVIDER",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`Authorization Failed: ${data.message}`);
      } else {
        await loadJobs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Available Transportation Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1">Confirmed carbon deals awaiting carrier assignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {shipments.map((s) => (
          <div key={s.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-cyan-400 font-bold">SHIPMENT #{s.id.replace('ship-', 'CX-')}</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">{s.origin} → {s.destination}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                UNASSIGNED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/40">
              <div>Volume: <span className="text-foreground font-bold">{s.quantity} t CO₂</span></div>
              <div>Vehicle: <span className="text-foreground">{s.vehicle_type || "CO₂ Tanker"}</span></div>
              <div>Est Value: <span className="text-emerald-400 font-bold">₹{s.estimated_cost?.toLocaleString() || "18,500"}</span></div>
              <div>Distance: <span className="text-foreground">{s.distance_km || 150} km</span></div>
            </div>

            {/* ONLY LOGISTICS_PROVIDER sees Accept Shipment button */}
            <button
              onClick={() => handleAcceptJob(s.id)}
              disabled={claimingId === s.id}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-mono text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              {claimingId === s.id ? "Accepting..." : "Accept Shipment"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
