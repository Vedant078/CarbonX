"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Briefcase, Truck, ArrowRight, Check, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const roleParam = searchParams.get("role");
  const initialRole: UserRole = 
    roleParam === "dealer" 
      ? "DEALER" 
      : roleParam === "logistics" 
        ? "LOGISTICS_PROVIDER" 
        : "BUYER";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("Enterprise");
  const [industry, setIndustry] = useState("Synthetic Fuel");
  const [location, setLocation] = useState("Mumbai, Maharashtra");

  // Role Profiles
  // Buyer
  const [primaryApplication, setPrimaryApplication] = useState("Synthetic Fuel Synthesis");
  const [monthlyRequirement, setMonthlyRequirement] = useState("300");
  const [requiredPurity, setRequiredPurity] = useState("99.5%");
  const [preferredLocation, setPreferredLocation] = useState("Pune / Western India");

  // Dealer
  const [organizationType, setOrganizationType] = useState("Commodity Brokerage");
  const [operatingRegion, setOperatingRegion] = useState("Pan-India / West");
  const [dealVolume, setDealVolume] = useState("1000 - 5000 tonnes/mo");

  // Logistics
  const [transportType, setTransportType] = useState("Cryogenic Tanker Fleet");
  const [fleetSize, setFleetSize] = useState("15 ISO Tankers");
  const [serviceRegion, setServiceRegion] = useState("Western & Central India");
  const [co2Capability, setCo2Capability] = useState("High-Pressure Liquid & Supercritical CO₂");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roleParam === "dealer") setRole("DEALER");
    else if (roleParam === "logistics") setRole("LOGISTICS_PROVIDER");
    else setRole("BUYER");
  }, [roleParam]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    try {
      let roleProfile = {};
      if (role === "BUYER") {
        roleProfile = { primaryApplication, monthlyRequirement: `${monthlyRequirement} tonnes/month`, requiredPurity, preferredLocation };
      } else if (role === "DEALER") {
        roleProfile = { organizationType, operatingRegion, dealVolume };
      } else {
        roleProfile = { transportType, fleetSize, serviceRegion, co2Capability };
      }

      await register({
        email,
        password,
        name,
        role,
        company: companyName,
        location,
        buyerProfile: role === "BUYER" ? roleProfile : undefined,
        dealerProfile: role === "DEALER" ? roleProfile : undefined,
        logisticsProfile: role === "LOGISTICS_PROVIDER" ? roleProfile : undefined,
      });

      // Auth context register routes automatically to role dashboard
    } catch (err: any) {
      setError(err.message || "Failed to complete registration");
      setSubmitting(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "BUYER": return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case "DEALER": return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case "LOGISTICS_PROVIDER": return <Truck className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-2xl w-full space-y-8 bg-card/60 border border-border/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        
        {/* Header Header & Role Badge */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/get-started" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to roles
            </Link>
            <span className="text-xs font-mono text-muted-foreground">STEP {step} OF 4</span>
          </div>

          <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                {getRoleIcon()}
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground block uppercase">JOINING CARBONX AS</span>
                <span className="text-sm font-bold font-mono text-foreground tracking-wide">{role.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(["BUYER", "DEALER", "LOGISTICS_PROVIDER"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all ${
                    role === r
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                      : "bg-background/40 border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "LOGISTICS_PROVIDER" ? "LOGISTICS" : r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="grid grid-cols-4 gap-2">
          {["Account", "Company", "Role Profile", "Complete"].map((sName, idx) => {
            const stepNum = idx + 1;
            const active = step >= stepNum;
            return (
              <div key={sName} className="space-y-1">
                <div className={`h-1.5 rounded-full transition-all ${active ? "bg-emerald-500" : "bg-muted/40"}`} />
                <span className={`text-[10px] font-mono block text-center ${active ? "text-emerald-400 font-bold" : "text-muted-foreground"}`}>
                  {stepNum}. {sName}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg font-mono">
            {error}
          </div>
        )}

        {/* STEP 1: ACCOUNT */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-mono text-foreground">Step 1 — Create Your Account</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (!name || !email || !password) {
                  setError("Please fill in all account fields");
                  return;
                }
                setError("");
                setStep(2);
              }}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
            >
              Continue to Company Profile →
            </button>
          </div>
        )}

        {/* STEP 2: COMPANY */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-mono text-foreground">Step 2 — Company Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GreenFuel Technologies India"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Synthetic Fuels / Chemicals"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl border border-border font-mono text-xs font-semibold text-foreground hover:bg-card transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!companyName) {
                    setError("Company name is required");
                    return;
                  }
                  setError("");
                  setStep(3);
                }}
                className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-sm font-semibold text-white transition-colors"
              >
                Continue to Role Profile →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ROLE PROFILE */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold font-mono text-foreground">
              Step 3 — {role.replace('_', ' ')} Profile
            </h2>

            {role === "BUYER" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Primary CO₂ Application</label>
                  <input
                    type="text"
                    value={primaryApplication}
                    onChange={(e) => setPrimaryApplication(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">Monthly CO₂ Req. (tonnes)</label>
                    <input
                      type="text"
                      value={monthlyRequirement}
                      onChange={(e) => setMonthlyRequirement(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">Required Purity</label>
                    <input
                      type="text"
                      value={requiredPurity}
                      onChange={(e) => setRequiredPurity(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Preferred Supply Location</label>
                  <input
                    type="text"
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {role === "DEALER" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Organization Type</label>
                  <input
                    type="text"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">Operating Region</label>
                    <input
                      type="text"
                      value={operatingRegion}
                      onChange={(e) => setOperatingRegion(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">Expected Monthly Volume</label>
                    <input
                      type="text"
                      value={dealVolume}
                      onChange={(e) => setDealVolume(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === "LOGISTICS_PROVIDER" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Transport Vehicle Type</label>
                  <input
                    type="text"
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">Fleet Size</label>
                    <input
                      type="text"
                      value={fleetSize}
                      onChange={(e) => setFleetSize(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">Service Region</label>
                    <input
                      type="text"
                      value={serviceRegion}
                      onChange={(e) => setServiceRegion(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl border border-border font-mono text-xs font-semibold text-foreground hover:bg-card transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-sm font-semibold text-white transition-colors"
              >
                Review Registration →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: COMPLETE */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-mono text-foreground">Step 4 — Confirm Registration Summary</h2>
            
            <div className="bg-muted/20 border border-border/80 rounded-xl p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-muted-foreground">ACCOUNT</span>
                <span className="text-foreground font-semibold">{name} ({email})</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-muted-foreground">COMPANY</span>
                <span className="text-foreground font-semibold">{companyName} — {industry}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">PERSONA ROLE</span>
                <span className="text-emerald-400 font-bold">{role}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-mono text-sm font-bold text-white transition-colors shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              {submitting ? "Entering Ecosystem..." : "Enter CarbonX →"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-xs font-mono text-muted-foreground">Loading registration...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
