"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navigation, MapPin, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import { LogisticsShipment } from "@/types";

export default function LogisticsRoutesPage() {
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);

  useEffect(() => {
    async function loadRoutes() {
      const data = await db.getShipments();
      setShipments(data);
    }
    loadRoutes();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Active Route Activity & Telematics</h1>
          <p className="text-sm text-muted-foreground mt-1">Live GPS routing logs for carbon transport tankers</p>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {shipments.map((s) => (
          <div key={s.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-cyan-400 font-bold">ROUTE #{s.tracking_code || `CX-MH-${s.id}`}</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">{s.origin} → {s.destination} ({s.distance_km || 150} km)</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs">
                ● {s.status.replace('_', ' ')}
              </span>
            </div>

            <div className="bg-muted/20 p-3 rounded-xl border border-border/40 flex items-center justify-between">
              <div>
                <span className="text-muted-foreground block text-[10px]">CARGO & DRIVER</span>
                <span className="text-foreground font-bold">{s.quantity}t CO₂ • Driver: {s.driver_name || "Unassigned"}</span>
              </div>
              <Link href={`/logistics/shipments/${s.id}`}>
                <button className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs">
                  Manage Transport →
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
