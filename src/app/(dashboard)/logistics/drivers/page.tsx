"use client";

import React from "react";
import { UserCheck, ShieldCheck } from "lucide-react";

export default function LogisticsDriversPage() {
  const drivers = [
    { id: "D-101", name: "Rajesh Kumar", cert: "Hazardous Materials Hazmat Level 4", status: "Active (On Route MH-12)", phone: "+91 98230 44210" },
    { id: "D-102", name: "Suresh Patil", cert: "Cryogenic Liquid Pressure Safety", status: "Available", phone: "+91 98221 88120" },
    { id: "D-103", name: "Amit Sharma", cert: "Industrial Gas Transport Master", status: "Available", phone: "+91 98210 90210" },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">Driver Roster & Certifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Certified Hazmat & cryogenic liquid transport personnel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        {drivers.map((d) => (
          <div key={d.id} className="bg-card/40 border border-border/80 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold">{d.id}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                {d.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground">{d.name}</h3>
            <div className="bg-muted/20 p-3 rounded-xl border border-border/40 space-y-1">
              <div>Hazmat Cert: <span className="text-emerald-400 font-bold">{d.cert}</span></div>
              <div>Contact Phone: <span className="text-foreground">{d.phone}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
