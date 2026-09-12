"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, ChevronRight, Navigation, CheckCircle2, RefreshCw, FileText } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { LogisticsShipment, ShipmentStatus } from "@/types";

export default function LogisticsShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [shipment, setShipment] = useState<LogisticsShipment | null>(null);

  const [vehicleType, setVehicleType] = useState("28-Tonne Cryogenic Semi-Trailer");
  const [driverName, setDriverName] = useState("Rajesh Kumar (MH-12-AZ-4421)");
  const [driverPhone, setDriverPhone] = useState("+91 98230 44210");
  const [pickupDate, setPickupDate] = useState("Today, 10:00 AM");
  const [estimatedDelivery, setEstimatedDelivery] = useState("Tomorrow, 4:00 PM");

  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadShipment = async () => {
    if (params?.id) {
      const data = await db.getShipmentById(params.id as string);
      if (data) {
        setShipment(data);
        if (data.vehicle_type) setVehicleType(data.vehicle_type);
        if (data.driver_name) setDriverName(data.driver_name);
        if (data.estimated_delivery) setEstimatedDelivery(data.estimated_delivery);
      }
    }
  };

  useEffect(() => {
    loadShipment();
  }, [params?.id]);

  const handleUpdateStatus = async (nextStatus: ShipmentStatus) => {
    setUpdating(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/shipments/${shipment?.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "LOGISTICS_PROVIDER",
        },
        body: JSON.stringify({
          status: nextStatus,
          note: `Updated transport status to ${nextStatus.replace('_', ' ')} by carrier driver ${driverName}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(`Authorization Mismatch: ${data.message}`);
      } else {
        setMessage(`Shipment status successfully updated to ${nextStatus}!`);
        await loadShipment();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/shipments/${shipment?.id}/transport-details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "LOGISTICS_PROVIDER",
        },
        body: JSON.stringify({
          vehicle_type: vehicleType,
          driver_name: driverName,
          driver_phone: driverPhone,
          pickup_date: pickupDate,
          estimated_delivery: estimatedDelivery,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(`Authorization Mismatch: ${data.message}`);
      } else {
        setMessage("Transport vehicle and driver details updated!");
        await loadShipment();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
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

  const nextStatus = shipment ? getNextStatus(shipment.status) : null;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 font-sans flex items-center justify-center">
      <div className="max-w-3xl w-full bg-card/60 border border-border/80 p-8 rounded-2xl space-y-6 shadow-2xl">
        <div className="space-y-2 border-b border-border/40 pb-4">
          <Link href="/logistics/shipments" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to shipments
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-mono text-foreground">
              Shipment Transport Control #{shipment?.id.replace('ship-', 'CX-')}
            </h1>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
              ● {shipment?.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg font-mono">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        {/* Status Transition Control (Logistics Provider Only) */}
        {nextStatus && (
          <div className="bg-cyan-950/20 border border-cyan-500/30 p-5 rounded-2xl space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-cyan-400 font-bold uppercase">NEXT STATUS TRANSITION</span>
                <p className="text-sm font-bold text-foreground mt-0.5">Advance status to: {nextStatus.replace('_', ' ')}</p>
              </div>
              <button
                onClick={() => handleUpdateStatus(nextStatus)}
                disabled={updating}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Advance to {nextStatus.replace('_', ' ')}
              </button>
            </div>
          </div>
        )}

        {/* Transport Vehicle & Driver Management Form */}
        <form onSubmit={handleSaveDetails} className="space-y-4 font-mono text-xs border-t border-border/40 pt-4">
          <h2 className="text-base font-bold text-foreground">Transport Vehicle & Driver Allocation</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Vehicle Type / Semi-Trailer</label>
              <input
                type="text"
                required
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Assigned Driver Name & Reg</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Pickup Date & Time</label>
              <input
                type="text"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Estimated Delivery Time</label>
              <input
                type="text"
                required
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 rounded-xl bg-card border border-border hover:border-cyan-500 font-mono text-xs font-bold text-foreground transition-all active:scale-95 disabled:opacity-50"
          >
            Save Vehicle & Driver Details
          </button>
        </form>
      </div>
    </div>
  );
}
