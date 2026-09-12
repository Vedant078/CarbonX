"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Briefcase, Truck, Check } from "lucide-react";

export default function GetStartedPage() {
  const roles = [
    {
      id: "buyer",
      title: "BUYER",
      headline: "I need captured CO₂",
      description: "Discover suitable carbon supply and connect with suppliers for your industrial applications.",
      features: [
        "Search CO₂ supply",
        "Find intelligent matches",
        "Track purchases & delivery"
      ],
      icon: ShoppingBag,
      color: "emerald",
      btnText: "Join as Buyer →",
      href: "/register?role=buyer"
    },
    {
      id: "dealer",
      title: "DEALER",
      headline: "I facilitate carbon transactions",
      description: "Connect supply and demand while managing high-margin carbon marketplace opportunities.",
      features: [
        "Discover opportunities",
        "Facilitate matches",
        "Manage deals & pipeline"
      ],
      icon: Briefcase,
      color: "indigo",
      btnText: "Join as Dealer →",
      href: "/register?role=dealer"
    },
    {
      id: "logistics",
      title: "LOGISTICS PROVIDER",
      headline: "I transport CO₂",
      description: "Manage carbon transportation, route execution, cryogenic tankers, and timely deliveries.",
      features: [
        "Find shipment opportunities",
        "Manage transportation",
        "Track deliveries & routes"
      ],
      icon: Truck,
      color: "cyan",
      btnText: "Join as Logistics Provider →",
      href: "/register?role=logistics"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6 lg:px-12 flex flex-col justify-center items-center">
      <div className="max-w-5xl mx-auto text-center space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold">
          3-PERSONA ECOSYSTEM
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-mono">
          Choose how you use CarbonX
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Connect carbon demand, marketplace opportunities, and logistics through one ecosystem.
        </p>
      </div>

      {/* 3 Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <div
              key={role.id}
              className="bg-card/50 border border-border/80 rounded-2xl p-8 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-card/80 transition-all group hover:shadow-2xl hover:shadow-emerald-950/20"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3.5 rounded-xl bg-muted/30 text-emerald-400 border border-border/60 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">
                    {role.title}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold font-mono text-foreground">
                    {role.headline}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-border/40">
                  {role.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-foreground font-mono">
                      <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href={role.href}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold font-mono text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/40 group-hover:bg-emerald-500"
                >
                  <span>{role.btnText}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center text-xs text-muted-foreground font-mono">
        Already have an account?{" "}
        <Link href="/login" className="text-emerald-400 hover:underline font-semibold">
          Sign In →
        </Link>
      </div>
    </div>
  );
}
