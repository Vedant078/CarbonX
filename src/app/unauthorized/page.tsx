"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowRight, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { getDashboardRouteForRole } from "@/lib/rbac";

export default function UnauthorizedPage() {
  const { role } = useAuth();
  const dashboardRoute = getDashboardRouteForRole(role || 'BUYER');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-6 bg-card/60 border border-border/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
            Access Restricted
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This workspace is not available for your account role ({role ? role.replace('_', ' ') : 'USER'}).
          </p>
        </div>

        <div className="pt-4">
          <Link
            href={dashboardRoute}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-mono text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/40"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to My Dashboard →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
