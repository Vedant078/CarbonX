"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Briefcase, Truck } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password, false);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError("");
    try {
      await login(demoEmail, undefined, true);
    } catch (err: any) {
      setError(err.message || "Failed to enter demo workspace");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center px-4 py-10 font-sans">
      <div className="max-w-lg w-full space-y-6 bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-xl">
        
        {/* Brand & Titles */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-mono font-bold text-white text-base shadow-md mx-auto">
            CX
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900">
              Welcome to CarbonX
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              Connect captured carbon with the industries that can put it to work.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-mono text-center font-semibold">
            {error}
          </div>
        )}

        {/* Presentation Demo Personas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              HACKATHON DEMO WORKSPACES
            </span>
            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Instant Access
            </span>
          </div>

          {/* 1. BUYER DEMO CARD */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-all space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-700 text-white shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-bold text-emerald-950">Buyer Demo</h3>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">BUYER</span>
                  </div>
                  <p className="text-[11px] font-mono text-emerald-900 font-semibold">Aarav Mehta — GreenSteel Industries</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              Purchase captured CO₂ for industrial production and sustainability goals.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
              <span className="text-[10px] font-mono text-emerald-900 font-bold">buyer.demo@carbonx.demo</span>
              <button
                type="button"
                onClick={() => handleDemoLogin("buyer.demo@carbonx.demo")}
                disabled={isLoading}
                className="py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 font-mono text-xs font-bold text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-1 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Enter Buyer Demo →"}
              </button>
            </div>
          </div>

          {/* 2. DEALER DEMO CARD */}
          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-all space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-700 text-white shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-bold text-indigo-950">Dealer Demo</h3>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900">DEALER</span>
                  </div>
                  <p className="text-[11px] font-mono text-indigo-900 font-semibold">Riya Sharma — CarbonBridge Trading</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              Match captured CO₂ supply with buyer demand and manage commercial proposals.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60">
              <span className="text-[10px] font-mono text-indigo-900 font-bold">dealer.demo@carbonx.demo</span>
              <button
                type="button"
                onClick={() => handleDemoLogin("dealer.demo@carbonx.demo")}
                disabled={isLoading}
                className="py-1.5 px-3 rounded-lg bg-indigo-700 hover:bg-indigo-600 font-mono text-xs font-bold text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-1 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Enter Dealer Demo →"}
              </button>
            </div>
          </div>

          {/* 3. LOGISTICS DEMO CARD */}
          <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100/70 transition-all space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-700 text-white shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-sm font-bold text-cyan-950">Logistics Demo</h3>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-900">LOGISTICS</span>
                  </div>
                  <p className="text-[11px] font-mono text-cyan-900 font-semibold">Kabir Rao — BlueRoute Logistics</p>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-700 leading-snug">
              Manage CO₂ transportation, shipments, vehicles, drivers, and delivery routes.
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-cyan-200/60">
              <span className="text-[10px] font-mono text-cyan-900 font-bold">logistics.demo@carbonx.demo</span>
              <button
                type="button"
                onClick={() => handleDemoLogin("logistics.demo@carbonx.demo")}
                disabled={isLoading}
                className="py-1.5 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-600 font-mono text-xs font-bold text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-700 focus:ring-offset-1 disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Enter Logistics Demo →"}
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center border-t border-slate-200">
          <span className="bg-white px-3 text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider -mt-2.5">
            OR SIGN IN WITH ACCOUNT
          </span>
        </div>

        {/* Email & Password Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-800 font-bold mb-1">Work Email</label>
            <input
              type="email"
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-slate-800 font-bold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Signing In..." : "Sign In with Email →"}
          </button>
        </form>

        <div className="text-center font-mono text-xs text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-emerald-700 font-bold hover:underline">
            Register for CarbonX →
          </Link>
        </div>

      </div>
    </div>
  );
}
