"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FilePlus, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function NewRequirementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purity, setPurity] = useState("");
  const [application, setApplication] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-role": user?.role || "BUYER",
        },
        body: JSON.stringify({
          title,
          required_quantity: Number(quantity),
          required_purity: Number(purity),
          application,
          location,
          max_price: Number(budget),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create requirement");
      } else {
        router.push("/buyer/requirements");
      }
    } catch (err: any) {
      setError(err.message || "Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-12 font-sans flex items-center justify-center">
      <div className="max-w-xl w-full bg-card/60 border border-border/80 p-8 rounded-2xl space-y-6 shadow-2xl">
        <div className="space-y-2">
          <Link href="/buyer/requirements" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-mono">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to requirements
          </Link>
          <h1 className="text-2xl font-bold font-mono text-foreground flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-emerald-400" />
            Create CO₂ Requirement
          </h1>
          <p className="text-xs text-muted-foreground">Post carbon demand to CarbonX matching engine</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-muted-foreground mb-1">Requirement Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Food Grade CO₂ for Beverage Plant"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Monthly CO₂ Req (tonnes)</label>
              <input
                type="number"
                required
                placeholder="e.g. 125"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Required Purity (%)</label>
              <input
                type="text"
                required
                placeholder="e.g. 99.5"
                value={purity}
                onChange={(e) => setPurity(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1">Application</label>
              <input
                type="text"
                required
                placeholder="e.g. Beverage"
                value={application}
                onChange={(e) => setApplication(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1">Max Budget (₹/tonne)</label>
              <input
                type="number"
                required
                placeholder="e.g. 4500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-muted-foreground mb-1">Delivery Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Delhi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-muted/20 border border-border/80 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Publishing Requirement..." : "Create Requirement →"}
          </button>
        </form>
      </div>
    </div>
  );
}
