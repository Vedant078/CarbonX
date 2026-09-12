"use client";

import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck } from "lucide-react";

export default function LogisticsVehiclesPage() {
  const fleet = [
    { id: "V-01", name: "28-Tonne Cryogenic ISO Tanker", reg: "MH-12-AZ-4421", status: "Active (In Transit)", capacity: "28 Tonnes", temp: "-30°C Liquid CO₂" },
    { id: "V-02", name: "High-Pressure Supercritical Tanker", reg: "MH-14-BX-8812", status: "Ready (Unassigned)", capacity: "32 Tonnes", temp: "Ambient High-P" },
    { id: "V-03", name: "Bulk Liquid CO₂ Semi-Trailer", reg: "GJ-06-CX-9021", status: "Ready (Unassigned)", capacity: "25 Tonnes", temp: "-25°C Liquid CO₂" },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Cryogenic Tanker Fleet</h1>
          <p className="text-sm text-muted-foreground mt-1">Specialized industrial gas transport vehicle management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {fleet.map((v) => (
          <div key={v.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold">{v.id} • {v.reg}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                {v.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">{v.name}</h3>
            <div className="bg-muted/20 p-3 rounded-xl border border-border/40 space-y-1">
              <div>Capacity: <span className="text-foreground font-bold">{v.capacity}</span></div>
              <div>Thermal Rating: <span className="text-emerald-400">{v.temp}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
