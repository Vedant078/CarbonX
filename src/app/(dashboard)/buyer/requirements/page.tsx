"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FilePlus, ShoppingBag, MapPin, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/db";
import { BuyerRequirement } from "@/types";

export default function BuyerRequirementsPage() {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);

  useEffect(() => {
    async function loadReqs() {
      const data = await db.getRequirements();
      setRequirements(data.filter((r) => r.buyer_id === user?.id || true));
    }
    loadReqs();
  }, [user?.id]);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">My CO₂ Requirements</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage active industrial carbon demand profiles</p>
        </div>
        <Link href="/buyer/requirements/new">
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono shadow-md">
            + Create Requirement
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {requirements.map((req) => (
          <div key={req.id} className="bg-card/40 border border-border/80 p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">{req.title || `${req.required_quantity}t CO2 Requirement`}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                {req.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div>Quantity: <span className="text-foreground font-bold">{req.required_quantity} t/mo</span></div>
              <div>Min Purity: <span className="text-emerald-400 font-bold">{req.required_purity}%</span></div>
              <div>Application: <span className="text-foreground">{req.application}</span></div>
              <div>Target Location: <span className="text-foreground">{req.location}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
