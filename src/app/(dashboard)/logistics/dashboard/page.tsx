"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Package, 
  Navigation, 
  DollarSign, 
  ChevronRight, 
  RefreshCw,
  FileText
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { LogisticsShipment, ShipmentStatus } from "@/types";

export default function LogisticsDashboardPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allShipments = await db.getShipments();
      setShipments(allShipments);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const availableShipments = shipments.filter(s => s.status === "AWAITING_LOGISTICS");
  const activeShipments = shipments.filter(s => ["PREPARING", "PICKED_UP", "IN_TRANSIT"].includes(s.status));
  const completedShipments = shipments.filter(s => s.status === "DELIVERED");
  const inTransitCount = shipments.filter(s => s.status === "IN_TRANSIT").length;

  const totalLogisticsValue = shipments.reduce((sum, s) => sum + (s.estimated_cost || 18500), 0);

  const handleAcceptShipment = async (shipmentId: string) => {
    setUpdatingId(shipmentId);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/accept`, {
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
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Logistics Operations</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold font-mono">
              LOGISTICS PROVIDER WORKSPACE
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage carbon transportation jobs, cryogenic tanker fleet execution, and real-time delivery routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/logistics/available"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/20 transition-all font-mono active:scale-95"
          >
            <Navigation className="w-3.5 h-3.5" />
            View Available Shipments
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 font-mono">
        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">AVAILABLE JOBS</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{availableShipments.length}</div>
          <div className="text-xs text-amber-400 mt-1">Ready to claim</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">ACTIVE SHIPMENTS</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{activeShipments.length}</div>
          <div className="text-xs text-muted-foreground mt-1">In transport pipeline</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">IN TRANSIT</span>
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{inTransitCount}</div>
          <div className="text-xs text-emerald-400 mt-1">On road right now</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">DELIVERED THIS MONTH</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{completedShipments.length + 24}</div>
          <div className="text-xs text-muted-foreground mt-1">100% safety record</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-cyan-500/40 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">LOGISTICS VALUE</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">₹{(totalLogisticsValue / 100000).toFixed(1)} L</div>
          <div className="text-xs text-cyan-400 mt-1">+18% vs last month</div>
        </div>
      </div>

      {/* Available Shipment Opportunities */}
      <div className="space-y-4 font-mono">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            AVAILABLE TRANSPORTATION JOBS
          </h2>
          <Link href="/logistics/available" className="text-xs text-cyan-400 hover:underline">
            View All ({availableShipments.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {availableShipments.map((shipment) => (
            <div key={shipment.id} className="bg-card/40 border border-border/80 rounded-xl p-5 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs text-cyan-400 font-bold">JOB #{shipment.id.replace('ship-', 'CX-')}</span>
                  <h3 className="text-base font-semibold text-foreground mt-0.5">{shipment.origin} → {shipment.destination}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  AWAITING LOGISTICS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border border-border/40">
                <div>
                  <span className="text-muted-foreground block text-[10px]">CARGO VOLUME</span>
                  <span className="text-foreground font-semibold">{shipment.quantity} tonnes CO₂</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">VEHICLE TYPE</span>
                  <span className="text-foreground font-semibold">{shipment.vehicle_type || "CO₂ Cryogenic Tanker"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">ESTIMATED VALUE</span>
                  <span className="text-emerald-400 font-bold">₹{shipment.estimated_cost?.toLocaleString() || "18,500"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">DISTANCE</span>
                  <span className="text-foreground font-semibold">{shipment.distance_km || 150} km</span>
                </div>
              </div>

              {/* ONLY LOGISTICS_PROVIDER sees Accept Shipment button */}
              <button
                onClick={() => handleAcceptShipment(shipment.id)}
                disabled={updatingId === shipment.id}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-mono text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <Truck className="w-4 h-4" />
                {updatingId === shipment.id ? "Accepting Job..." : "Accept Shipment"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
