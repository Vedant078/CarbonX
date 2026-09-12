"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Package, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
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
    window.addEventListener("carbonx_db_updated", loadData);
    return () => window.removeEventListener("carbonx_db_updated", loadData);
  }, []);

  const availableShipments = shipments.filter(s => s.status === "AWAITING_LOGISTICS");
  const activeShipments = shipments.filter(s => ["PREPARING", "PICKED_UP", "IN_TRANSIT"].includes(s.status));
  const completedShipments = shipments.filter(s => s.status === "DELIVERED");
  const inTransitCount = shipments.filter(s => s.status === "IN_TRANSIT").length;

  const totalLogisticsValue = shipments.reduce((sum, s) => sum + (s.estimated_cost || 18500), 0);

  const handleAcceptShipment = async (shipmentId: string) => {
    setUpdatingId(shipmentId);
    try {
      await db.acceptShipment(
        shipmentId, 
        user?.id || "demo-logistics",
        user?.name || "EcoTransit Logistics"
      );
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (shipmentId: string, nextStatus: ShipmentStatus) => {
    setUpdatingId(shipmentId);
    try {
      await db.updateShipmentStatus(
        shipmentId, 
        nextStatus, 
        `Updated status to ${nextStatus.replace('_', ' ')} by driver ${user?.name || 'EcoTransit Driver'}`
      );
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const getNextStatus = (current: ShipmentStatus): ShipmentStatus | null => {
    switch (current) {
      case "AWAITING_LOGISTICS": return "PREPARING";
      case "PREPARING": return "PICKED_UP";
      case "PICKED_UP": return "IN_TRANSIT";
      case "IN_TRANSIT": return "DELIVERED";
      default: return null;
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case "AWAITING_LOGISTICS":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" /> Awaiting Courier</span>;
      case "PREPARING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"><Package className="w-3 h-3" /> Preparing</span>;
      case "PICKED_UP":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><Truck className="w-3 h-3" /> Picked Up</span>;
      case "IN_TRANSIT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse"><Navigation className="w-3 h-3" /> In Transit</span>;
      case "DELIVERED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><CheckCircle2 className="w-3 h-3" /> Delivered</span>;
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">Logistics Operations</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
              LOGISTICS PROVIDER
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage carbon transportation and delivery routes across India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card/50 text-foreground hover:bg-card transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Fleet Data
          </button>
          <Link
            href="/dashboard/logistics/routes"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            View Available Shipments
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">AVAILABLE SHIPMENTS</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{availableShipments.length}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <span>Ready to claim</span>
          </div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">ACTIVE SHIPMENTS</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{activeShipments.length}</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">In pipeline</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">IN TRANSIT</span>
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{inTransitCount}</div>
          <div className="text-xs text-emerald-400 mt-1 font-mono">On road right now</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">DELIVERED THIS MONTH</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">{completedShipments.length + 24}</div>
          <div className="text-xs text-muted-foreground mt-1 font-mono">100% safety rating</div>
        </div>

        <div className="bg-card/40 border border-border/60 rounded-xl p-4 hover:border-emerald-500/40 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium font-mono uppercase tracking-wider">LOGISTICS VALUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">₹{(totalLogisticsValue / 100000).toFixed(1)} L</div>
          <div className="text-xs text-emerald-400 mt-1 font-mono">+18% vs last month</div>
        </div>
      </div>

      {/* Available Shipment Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground font-mono flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              Available Shipment Opportunities
            </h2>
            <p className="text-xs text-muted-foreground">Unassigned CO₂ transport jobs matching your transport capabilities</p>
          </div>
          <span className="text-xs text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            {availableShipments.length} Jobs Ready
          </span>
        </div>

        {availableShipments.length === 0 ? (
          <div className="bg-card/20 border border-dashed border-border/60 rounded-xl p-8 text-center">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">No available shipments currently</p>
            <p className="text-xs text-muted-foreground mt-1">Check back once Buyers & Dealers confirm new carbon purchase deals.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableShipments.map((shipment) => (
              <div key={shipment.id} className="bg-card/40 border border-border/80 rounded-xl p-5 hover:border-emerald-500/40 transition-all space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">SHIPMENT #{shipment.id.replace('ship-', 'CX-')}</span>
                    <h3 className="text-base font-semibold text-foreground mt-0.5">{shipment.origin} → {shipment.destination}</h3>
                  </div>
                  {getStatusBadge(shipment.status)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-3 rounded-lg border border-border/40 font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">VOLUME & PURE</span>
                    <span className="text-foreground font-semibold">{shipment.quantity} tonnes CO₂</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">TRANSPORT TYPE</span>
                    <span className="text-foreground font-semibold">{shipment.vehicle_type || "CO₂ Cryogenic Tanker"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">ESTIMATED VALUE</span>
                    <span className="text-emerald-400 font-bold">₹{shipment.estimated_cost?.toLocaleString() || "18,500"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">ESTIMATED TIME</span>
                    <span className="text-foreground font-semibold">2 Days Delivery</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Distance approx {shipment.distance_km || 150} km</span>
                  </div>
                  <button
                    onClick={() => handleAcceptShipment(shipment.id)}
                    disabled={updatingId === shipment.id}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
                  >
                    {updatingId === shipment.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Truck className="w-3.5 h-3.5" />
                    )}
                    Accept Shipment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Freight & Shipment Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground font-mono flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              Active Shipments & Logistics Tracking
            </h2>
            <p className="text-xs text-muted-foreground">Update transport status live for buyers & dealers in real-time</p>
          </div>
        </div>

        {activeShipments.length === 0 ? (
          <div className="bg-card/20 border border-dashed border-border/60 rounded-xl p-8 text-center">
            <Truck className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">No active shipments in transit</p>
            <p className="text-xs text-muted-foreground mt-1">Accept an available shipment above to start logistics execution.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeShipments.map((shipment) => {
              const nextStatus = getNextStatus(shipment.status);
              return (
                <div key={shipment.id} className="bg-card/40 border border-border/80 rounded-xl p-5 space-y-4 hover:border-emerald-500/40 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-emerald-400 font-bold">SHIPMENT #{shipment.id.replace('ship-', 'CX-')}</span>
                        {getStatusBadge(shipment.status)}
                      </div>
                      <h3 className="text-lg font-bold text-foreground mt-1">{shipment.origin} → {shipment.destination}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      {nextStatus && (
                        <button
                          onClick={() => handleUpdateStatus(shipment.id, nextStatus)}
                          disabled={updatingId === shipment.id}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-colors disabled:opacity-50"
                        >
                          {updatingId === shipment.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                          Update to {nextStatus.replace('_', ' ')}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">CARGO VOLUME</span>
                      <span className="text-foreground font-semibold text-sm">{shipment.quantity} tonnes CO₂</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">ASSIGNED DRIVER</span>
                      <span className="text-foreground font-semibold text-sm">{shipment.driver_name || "Rajesh Kumar (MH-12-AZ-4421)"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">ETA / DELIVERY</span>
                      <span className="text-foreground font-semibold text-sm">{shipment.estimated_delivery || "Tomorrow, 4:00 PM"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">CONTRACT VALUE</span>
                      <span className="text-emerald-400 font-semibold text-sm">₹{shipment.estimated_cost?.toLocaleString() || "18,500"}</span>
                    </div>
                  </div>

                  {/* Status Steps Visualizer */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-muted-foreground mb-2">TRANSPORT TIMELINE</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                      {[
                        { key: "PREPARING", label: "1. PREPARING" },
                        { key: "PICKED_UP", label: "2. PICKED UP" },
                        { key: "IN_TRANSIT", label: "3. IN TRANSIT" },
                        { key: "DELIVERED", label: "4. DELIVERED" }
                      ].map((step, idx) => {
                        const stepOrder = ["PREPARING", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
                        const currentIdx = stepOrder.indexOf(shipment.status);
                        const isCurrent = shipment.status === step.key;
                        const isPast = currentIdx > idx;

                        return (
                          <div 
                            key={step.key} 
                            className={`p-2 rounded-lg border transition-all ${
                              isCurrent 
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                                : isPast
                                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-600"
                                  : "bg-muted/10 border-border/40 text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tracking Notes */}
                  {shipment.tracking_notes && shipment.tracking_notes.length > 0 && (
                    <div className="bg-muted/10 border border-border/40 rounded-lg p-3 text-xs space-y-1">
                      <div className="font-mono text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Recent Tracking Log:
                      </div>
                      <div className="text-foreground font-mono">
                        "{shipment.tracking_notes[shipment.tracking_notes.length - 1]}"
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Freight History */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground font-mono flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-cyan-400" />
          Completed Delivery History ({completedShipments.length})
        </h2>

        {completedShipments.length > 0 && (
          <div className="bg-card/40 border border-border/60 rounded-xl overflow-hidden">
            <div className="divide-y divide-border/40 text-xs font-mono">
              {completedShipments.map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="font-semibold text-foreground">{s.origin} → {s.destination} ({s.quantity} t)</div>
                    <div className="text-muted-foreground text-[11px]">Delivered on {s.updated_at ? new Date(s.updated_at).toLocaleDateString() : 'Today'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-bold">₹{s.estimated_cost?.toLocaleString() || "18,500"}</span>
                    {getStatusBadge(s.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
