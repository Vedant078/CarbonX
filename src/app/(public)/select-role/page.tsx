"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Briefcase, Truck, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types";
import { getDashboardRouteForRole } from "@/lib/rbac";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function SelectRolePage() {
  const router = useRouter();
  const { user, selectRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user && user.role) {
      router.replace(getDashboardRouteForRole(user.role));
    }
  }, [user, isLoading, router]);

  const handleChooseRole = async (role: UserRole) => {
    await selectRole(role);
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6 lg:px-12 flex flex-col justify-center items-center font-sans">
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12 flex flex-col items-center">
        <BrandLogo href="/" size="md" subtitle="Workspace Setup" className="justify-center mb-1" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-semibold">
          FIRST TIME SETUP
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-mono">
          Choose your CarbonX workspace
        </h1>
        <p className="text-muted-foreground text-base max-w-xl mx-auto">
          Your workspace determines the tools, permissions, and operations available to you.
        </p>
      </div>

      {/* 3 Role Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* BUYER CARD */}
        <div className="bg-card/50 border border-border/80 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-card/80 transition-all group shadow-xl">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">WORKSPACE 1</span>
              <h2 className="text-xl font-bold font-mono text-foreground mt-0.5">BUYER</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              Find and purchase captured CO₂ for industrial applications.
            </p>
            <div className="space-y-2 pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Search carbon supply</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Submit CO₂ requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Accept commercial proposals</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleChooseRole("BUYER")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold font-mono text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              Continue as Buyer →
            </button>
          </div>
        </div>

        {/* DEALER CARD */}
        <div className="bg-card/50 border border-border/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-500/50 hover:bg-card/80 transition-all group shadow-xl">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit border border-indigo-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">WORKSPACE 2</span>
              <h2 className="text-xl font-bold font-mono text-foreground mt-0.5">DEALER</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              Match carbon supply with industrial demand and manage deals.
            </p>
            <div className="space-y-2 pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                <span>Discover match opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                <span>Create deal proposals</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-indigo-400" />
                <span>Track 5% commissions</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleChooseRole("DEALER")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold font-mono text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              Continue as Dealer →
            </button>
          </div>
        </div>

        {/* LOGISTICS CARD */}
        <div className="bg-card/50 border border-border/80 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-card/80 transition-all group shadow-xl">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase">WORKSPACE 3</span>
              <h2 className="text-xl font-bold font-mono text-foreground mt-0.5">LOGISTICS PROVIDER</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              Manage carbon transportation, cryogenic tankers, and deliveries.
            </p>
            <div className="space-y-2 pt-2 border-t border-border/40 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Accept available transport jobs</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Assign vehicle & driver</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>Update delivery status</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleChooseRole("LOGISTICS")}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-semibold font-mono text-xs bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              Continue as Logistics →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
