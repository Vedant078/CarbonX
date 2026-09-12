"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Briefcase, Truck } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isLoading } = useAuth();
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
      setError(err.message || "Failed to log in as demo account");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200/90 p-8 rounded-2xl shadow-xl">
        
        {/* Brand & Titles */}
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-mono font-bold text-white text-base shadow-md mx-auto">
            CX
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold font-mono tracking-tight text-slate-900">
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

        {/* Primary OAuth Action: Continue with Google */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-mono text-sm font-semibold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          <p className="text-[10px] text-center text-slate-500 font-mono font-medium">
            Secure authentication powered by OAuth
          </p>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center border-t border-slate-200 pt-4">
          <span className="bg-white px-3 text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest absolute">
            EXPLORE DEMO WORKSPACE
          </span>
        </div>

        {/* 3 DEMO ACCOUNTS */}
        <div className="space-y-2.5 pt-2 font-mono">
          {/* BUYER DEMO */}
          <button
            type="button"
            onClick={() => handleDemoLogin("buyer.demo@carbonx.demo")}
            className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-950 text-xs font-bold flex items-center justify-between transition-all group active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-emerald-800" />
              <span className="text-emerald-950 font-bold">Buyer Demo</span>
            </div>
            <span className="text-[10px] text-emerald-900 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>buyer.demo@carbonx.demo</span>
              <span className="text-emerald-800 font-bold">→</span>
            </span>
          </button>

          {/* DEALER DEMO */}
          <button
            type="button"
            onClick={() => handleDemoLogin("dealer.demo@carbonx.demo")}
            className="w-full py-2.5 px-4 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-950 text-xs font-bold flex items-center justify-between transition-all group active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-indigo-800" />
              <span className="text-indigo-950 font-bold">Dealer Demo</span>
            </div>
            <span className="text-[10px] text-indigo-900 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>dealer.demo@carbonx.demo</span>
              <span className="text-indigo-800 font-bold">→</span>
            </span>
          </button>

          {/* LOGISTICS DEMO */}
          <button
            type="button"
            onClick={() => handleDemoLogin("logistics.demo@carbonx.demo")}
            className="w-full py-2.5 px-4 rounded-xl border border-cyan-200 bg-cyan-50/80 hover:bg-cyan-100/80 text-cyan-950 text-xs font-bold flex items-center justify-between transition-all group active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
          >
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-cyan-800" />
              <span className="text-cyan-950 font-bold">Logistics Demo</span>
            </div>
            <span className="text-[10px] text-cyan-900 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>logistics.demo@carbonx.demo</span>
              <span className="text-cyan-800 font-bold">→</span>
            </span>
          </button>
        </div>

        {/* Email Login Form Fallback */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-200 font-mono text-xs">
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
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            {isLoading ? "Signing In..." : "Sign In with Email →"}
          </button>
        </form>

        <div className="text-center pt-2 font-mono text-xs text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-emerald-700 font-bold hover:underline">
            Register for CarbonX →
          </Link>
        </div>

      </div>
    </div>
  );
}
