"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, Navigation, ChevronRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { LogisticsShipment } from "@/types";

export default function LogisticsShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);

  useEffect(() => {
    async function loadShipments() {
      const data = await db.getShipments();
      setShipments(data.filter((s) => s.status !== "AWAITING_LOGISTICS"));
    }
    loadShipments();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Active & Completed Freight Shipments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage transport status progression & route details</p>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {shipments.map((s) => (
          <div key={s.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-cyan-400 font-bold">SHIPMENT #{s.id.replace('ship-', 'CX-')}</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">{s.origin} → {s.destination}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold text-xs">
                  ● {s.status.replace('_', ' ')}
                </span>
                <Link href={`/logistics/shipments/${s.id}`}>
                  <button className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all flex items-center gap-1">
                    Manage Transport <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-muted-foreground block text-[10px]">VOLUME</span>
                <span className="font-bold text-foreground">{s.quantity} t CO₂</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">DRIVER</span>
                <span className="font-bold text-foreground">{s.driver_name || "Unassigned"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">VEHICLE</span>
                <span className="font-bold text-foreground">{s.vehicle_type || "Cryogenic Tanker"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">EST VALUE</span>
                <span className="font-bold text-emerald-400">₹{s.estimated_cost?.toLocaleString() || "18,500"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
