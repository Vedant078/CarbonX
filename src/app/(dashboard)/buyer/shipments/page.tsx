"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, MapPin, CheckCircle2, Clock, Navigation, ShieldCheck, Eye } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { LogisticsShipment } from "@/types";

export default function BuyerShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);

  useEffect(() => {
    async function loadShipments() {
      const data = await db.getShipments();
      setShipments(data);
    }
    loadShipments();
  }, []);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold font-mono text-foreground">Incoming Freight Shipments</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
              READ-ONLY TRACKING MODE
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Real-time status updates for your purchased carbon deliveries</p>
        </div>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {shipments.map((shipment) => (
          <div key={shipment.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
              <div>
                <span className="text-emerald-400 font-bold">SHIPMENT #{shipment.id.replace('ship-', 'CX-')}</span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{shipment.origin} → {shipment.destination}</h3>
                <p className="text-muted-foreground text-[11px]">Carrier: {shipment.logistics_provider_name || "EcoTransit Logistics"}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-full font-bold text-xs border ${
                  shipment.status === "DELIVERED"
                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    : shipment.status === "IN_TRANSIT"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  ● {shipment.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
              <div>
                <span className="text-muted-foreground block text-[10px]">CARGO VOLUME</span>
                <span className="font-bold text-foreground">{shipment.quantity} tonnes CO₂</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">ASSIGNED DRIVER</span>
                <span className="font-bold text-foreground">{shipment.driver_name || "Assigned Driver"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">TRANSPORT VEHICLE</span>
                <span className="font-bold text-foreground">{shipment.vehicle_type || "CO₂ Cryogenic Tanker"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px]">ESTIMATED DELIVERY</span>
                <span className="font-bold text-emerald-400">{shipment.estimated_delivery || "Tomorrow, 4:00 PM"}</span>
              </div>
            </div>

            {/* Tracking Log */}
            {shipment.tracking_notes && shipment.tracking_notes.length > 0 && (
              <div className="bg-muted/10 border border-border/40 rounded-lg p-3 space-y-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block">Latest Logistics Status Log:</span>
                <p className="text-foreground text-xs">"{shipment.tracking_notes[shipment.tracking_notes.length - 1]}"</p>
              </div>
            )}

            {/* Read-Only Notice: Strictly NO shipment modification controls! */}
            <div className="text-[11px] text-muted-foreground italic flex items-center gap-1.5 pt-1 border-t border-border/30">
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Shipment controls are read-only for Buyers. Transportation updates are managed strictly by the assigned Logistics Provider.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
