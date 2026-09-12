'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { LogisticsShipment, ShipmentStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Truck, MapPin, CheckCircle2, Clock, Navigation, ShieldCheck } from 'lucide-react';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<LogisticsShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const loadShipments = async () => {
    try {
      const data = await db.getShipments();
      setShipments(data);
    } catch (err) {
      console.error('Error loading shipments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  const handleStatusChange = async (shipmentId: string, newStatus: ShipmentStatus) => {
    try {
      const updated = await db.updateShipmentStatus(shipmentId, newStatus);
      setUpdateMsg(`✓ Shipment ${updated.tracking_code} updated to ${newStatus.replace('_', ' ')}!`);
      await loadShipments();
    } catch (err) {
      console.error('Failed to update shipment status', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Active Shipments & Logistics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time transportation tracking for cryogenic CO₂ tank deliveries.
          </p>
        </div>
      </div>

      {updateMsg && (
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-900 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <span>{updateMsg}</span>
          <button onClick={() => setUpdateMsg(null)} className="text-blue-600 hover:text-blue-900">
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-6">
        {shipments.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6 hover:border-blue-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">TRACKING CODE</span>
                  <h3 className="text-lg font-black text-slate-900">{s.tracking_code}</h3>
                </div>
              </div>
              <StatusBadge status={s.status} />
            </div>

            {/* ROUTE VISUALIZATION CARD */}
            <div className="bg-[#0B1220] rounded-2xl p-6 text-white border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" /> ROUTE DISPATCH SPECIFICATION
                </span>
                <span className="text-slate-400">{s.transport_mode}</span>
              </div>

              {/* Origin -> Route -> Destination Visual */}
              <div className="flex items-center justify-between bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-800 relative">
                <div className="text-center z-10 max-w-[120px]">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                    M
                  </div>
                  <span className="text-xs font-bold text-white block truncate">{s.origin.split(',')[0]}</span>
                  <span className="block text-[10px] text-slate-400">Origin</span>
                </div>

                <div className="flex-1 px-4 text-center z-10">
                  <span className="text-xs font-bold text-sky-400 block mb-1">{s.distance_km} km</span>
                  <div className="w-full h-1 bg-slate-800 rounded-full relative flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-sky-500 animate-ping absolute" />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Est. {s.estimated_delivery_days} Days Delivery</span>
                </div>

                <div className="text-center z-10 max-w-[120px]">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto mb-1 font-bold text-xs">
                    P
                  </div>
                  <span className="text-xs font-bold text-white block truncate">{s.destination.split(',')[0]}</span>
                  <span className="block text-[10px] text-slate-400">Destination</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Transport Cost</span>
                  <span className="font-bold text-emerald-400 text-sm">{formatCurrency(s.estimated_cost)}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost / Tonne</span>
                  <span className="font-bold text-white text-sm">₹{s.cost_per_tonne}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Associated Deal</span>
                  <span className="font-bold text-sky-400 text-sm">{s.deal_id.toUpperCase()}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Window</span>
                  <span className="font-bold text-white text-sm">{s.estimated_delivery_days} Days</span>
                </div>
              </div>
            </div>

            {/* Interactive Demo Status Transition Controls */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Demo Status Controls:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {(['PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'] as const).map((statusVal) => {
                  const isActive = s.status === statusVal;
                  return (
                    <button
                      key={statusVal}
                      onClick={() => handleStatusChange(s.id, statusVal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {statusVal.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
