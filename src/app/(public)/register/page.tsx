"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Briefcase, Truck, ArrowRight, Check, ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { UserRole } from "@/types";
import { BrandLogo } from "@/components/ui/brand-logo";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const roleParam = searchParams.get("role");
  const initialRole: UserRole = 
    roleParam === "dealer" 
      ? "DEALER" 
      : roleParam === "logistics" 
        ? "LOGISTICS" 
        : "BUYER";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [step, setStep] = useState<number>(1);

  // Common Fields (Steps 1 & 2)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("Mumbai, Maharashtra");

  // BUYER Specific Fields
  const [buyerIndustry, setBuyerIndustry] = useState("Synthetic Fuel Synthesis");
  const [estimatedCo2Req, setEstimatedCo2Req] = useState("300 tonnes/month");
  const [preferredPurity, setPreferredPurity] = useState("99.5% Industrial Grade");
  const [preferredDeliveryLocation, setPreferredDeliveryLocation] = useState("Pune, Maharashtra");
  const [usageObjective, setUsageObjective] = useState("Feedstock for e-methanol production");
  const [sustainabilityGoals, setSustainabilityGoals] = useState("Achieve net-zero carbon emissions by 2030");

  // DEALER Specific Fields
  const [tradingName, setTradingName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("Commodity Brokerage");
  const [areasServed, setAreasServed] = useState("Pan-India / Western Region");
  const [industriesServed, setIndustriesServed] = useState("Chemicals, Food & Beverage, Steel");
  const [commercialExperience, setCommercialExperience] = useState("5+ years in gas trading & off-take agreements");
  const [businessDescription, setBusinessDescription] = useState("B2B carbon matchmaking and structured CO2 deals.");

  // LOGISTICS Specific Fields
  const [logisticsCompanyName, setLogisticsCompanyName] = useState("");
  const [serviceRegions, setServiceRegions] = useState("Western & Central India");
  const [co2TransportCapability, setCo2TransportCapability] = useState("High-Pressure Liquid & Supercritical CO₂");
  const [approxCapacity, setApproxCapacity] = useState("1,500 tonnes/month");
  const [transportModes, setTransportModes] = useState("Cryogenic ISO Tankers & Road Transporters");
  const [fleetInformation, setFleetInformation] = useState("15 Dedicated Cryogenic ISO Tankers with telematics");

  // Form Validation & Errors State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roleParam === "dealer") setRole("DEALER");
    else if (roleParam === "logistics") setRole("LOGISTICS");
    else if (roleParam === "buyer") setRole("BUYER");
  }, [roleParam]);

  // Set default company names when switching roles if user hasn't typed a custom company name
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setFieldErrors({});
    setServerError("");
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!email.trim()) {
      errors.email = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid work email address";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!companyName.trim()) errors.companyName = "Company name is required";
    if (!location.trim()) errors.location = "Location is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 4 Validation (Role Profile)
  const validateStep4 = () => {
    const errors: Record<string, string> = {};
    if (role === "BUYER") {
      if (!buyerIndustry.trim()) errors.buyerIndustry = "Industry or application is required";
      if (!estimatedCo2Req.trim()) errors.estimatedCo2Req = "Estimated CO₂ requirement is required";
      if (!preferredPurity.trim()) errors.preferredPurity = "Preferred CO₂ purity is required";
      if (!preferredDeliveryLocation.trim()) errors.preferredDeliveryLocation = "Preferred delivery location is required";
    } else if (role === "DEALER") {
      if (!tradingName.trim() && !companyName.trim()) errors.tradingName = "Trading or business name is required";
      if (!businessCategory.trim()) errors.businessCategory = "Business category is required";
      if (!areasServed.trim()) errors.areasServed = "Areas served is required";
      if (!industriesServed.trim()) errors.industriesServed = "Industries served is required";
    } else if (role === "LOGISTICS") {
      if (!logisticsCompanyName.trim() && !companyName.trim()) errors.logisticsCompanyName = "Logistics company name is required";
      if (!serviceRegions.trim()) errors.serviceRegions = "Service regions are required";
      if (!co2TransportCapability.trim()) errors.co2TransportCapability = "CO₂ transport capability is required";
      if (!approxCapacity.trim()) errors.approxCapacity = "Approximate capacity is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setServerError("");

    try {
      let buyerProfilePayload;
      let dealerProfilePayload;
      let logisticsProfilePayload;

      if (role === "BUYER") {
        buyerProfilePayload = {
          industry: buyerIndustry.trim(),
          primaryApplication: buyerIndustry.trim(),
          estimatedCo2Req: estimatedCo2Req.trim(),
          monthlyRequirement: estimatedCo2Req.trim(),
          preferredPurity: preferredPurity.trim(),
          requiredPurity: preferredPurity.trim(),
          preferredDeliveryLocation: preferredDeliveryLocation.trim(),
          preferredLocation: preferredDeliveryLocation.trim(),
          usageObjective: usageObjective.trim(),
          sustainabilityGoals: sustainabilityGoals.trim() || undefined,
        };
      } else if (role === "DEALER") {
        dealerProfilePayload = {
          tradingName: (tradingName || companyName).trim(),
          businessCategory: businessCategory.trim(),
          organizationType: businessCategory.trim(),
          areasServed: areasServed.trim(),
          operatingRegion: areasServed.trim(),
          industriesServed: industriesServed.trim(),
          commercialExperience: commercialExperience.trim(),
          businessDescription: businessDescription.trim() || undefined,
        };
      } else if (role === "LOGISTICS") {
        logisticsProfilePayload = {
          logisticsCompanyName: (logisticsCompanyName || companyName).trim(),
          serviceRegions: serviceRegions.trim(),
          serviceRegion: serviceRegions.trim(),
          co2TransportCapability: co2TransportCapability.trim(),
          approxCapacity: approxCapacity.trim(),
          transportModes: transportModes.trim(),
          fleetInformation: fleetInformation.trim() || undefined,
        };
      }

      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        role: role, // Must strictly be 'BUYER', 'DEALER', or 'LOGISTICS'
        company: companyName.trim(),
        location: location.trim(),
        buyerProfile: buyerProfilePayload,
        dealerProfile: dealerProfilePayload,
        logisticsProfile: logisticsProfilePayload,
      });

      // Redirect is handled automatically by auth context after session registration
    } catch (err: any) {
      setServerError(err.message || "Registration failed due to a server error. Please try again.");
      setSubmitting(false);
    }
  };

  const getRoleTheme = () => {
    switch (role) {
      case "BUYER":
        return {
          badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          border: "border-emerald-500/40",
          buttonBg: "bg-emerald-600 hover:bg-emerald-500 text-white",
          icon: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
          label: "Buyer",
          color: "emerald",
        };
      case "DEALER":
        return {
          badgeBg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
          border: "border-purple-500/40",
          buttonBg: "bg-purple-600 hover:bg-purple-500 text-white",
          icon: <Briefcase className="w-5 h-5 text-purple-400" />,
          label: "Dealer",
          color: "purple",
        };
      case "LOGISTICS":
        return {
          badgeBg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
          border: "border-cyan-500/40",
          buttonBg: "bg-cyan-600 hover:bg-cyan-500 text-white",
          icon: <Truck className="w-5 h-5 text-cyan-400" />,
          label: "Logistics Provider",
          color: "cyan",
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center font-sans">
      <div className="max-w-2xl w-full space-y-8 bg-card/60 border border-border/80 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
        
        {/* Header & Role Badge */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <BrandLogo href="/" size="md" subtitle="CarbonX Registration" />
            <span className="text-xs font-mono text-muted-foreground font-bold">STEP {step} OF 5</span>
          </div>

          <div className="bg-muted/30 border border-border/60 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-background border border-border/60">
                {theme.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-muted-foreground block uppercase">SELECTED PERSONA</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-foreground">{theme.label}</span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40">
                    ROLE: {role}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {(["BUYER", "DEALER", "LOGISTICS"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleChange(r)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    role === r
                      ? r === "BUYER"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold"
                        : r === "DEALER"
                        ? "bg-purple-500/20 border-purple-500 text-purple-400 font-bold"
                        : "bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold"
                      : "bg-background/40 border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "LOGISTICS" ? "Logistics" : r === "DEALER" ? "Dealer" : "Buyer"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5-Step Stepper Progress Bar */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { num: 1, label: "Account" },
            { num: 2, label: "Company" },
            { num: 3, label: "Persona" },
            { num: 4, label: "Profile" },
            { num: 5, label: "Review" },
          ].map((s) => {
            const active = step >= s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="space-y-1">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    active
                      ? role === "BUYER"
                        ? "bg-emerald-500"
                        : role === "DEALER"
                        ? "bg-purple-500"
                        : "bg-cyan-500"
                      : "bg-muted/40"
                  }`}
                />
                <span
                  className={`text-[10px] font-mono block text-center truncate ${
                    isCurrent
                      ? "text-foreground font-bold"
                      : active
                      ? "text-muted-foreground font-semibold"
                      : "text-muted-foreground/50"
                  }`}
                >
                  {s.num}. {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-4 rounded-xl font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Registration Error</span>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* STEP 1: ACCOUNT */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold font-mono text-foreground">Step 1 — Account Credentials</h2>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Create your user account credentials for CarbonX</p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
                  }}
                  className={`w-full bg-muted/20 border ${
                    fieldErrors.name ? "border-red-500 focus:border-red-500" : "border-border/80 focus:border-emerald-500"
                  } rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none`}
                />
                {fieldErrors.name && (
                  <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.name}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Work Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                  }}
                  className={`w-full bg-muted/20 border ${
                    fieldErrors.email ? "border-red-500 focus:border-red-500" : "border-border/80 focus:border-emerald-500"
                  } rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none`}
                />
                {fieldErrors.email && (
                  <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
                  }}
                  className={`w-full bg-muted/20 border ${
                    fieldErrors.password ? "border-red-500 focus:border-red-500" : "border-border/80 focus:border-emerald-500"
                  } rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none`}
                />
                {fieldErrors.password && (
                  <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.password}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
              className={`w-full py-3 rounded-xl ${theme.buttonBg} font-mono text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-md`}
            >
              Continue to Company Info →
            </button>

            <p className="text-center text-xs font-mono text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-400 underline hover:text-emerald-300">
                Sign in
              </Link>
            </p>
          </div>
        )}

        {/* STEP 2: COMPANY */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold font-mono text-foreground">Step 2 — Company Information</h2>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Specify your organization details</p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GreenFuel Technologies India"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (fieldErrors.companyName) setFieldErrors({ ...fieldErrors, companyName: "" });
                  }}
                  className={`w-full bg-muted/20 border ${
                    fieldErrors.companyName ? "border-red-500 focus:border-red-500" : "border-border/80 focus:border-emerald-500"
                  } rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none`}
                />
                {fieldErrors.companyName && (
                  <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.companyName}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1">
                  Primary Location / Headquarters <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (fieldErrors.location) setFieldErrors({ ...fieldErrors, location: "" });
                  }}
                  className={`w-full bg-muted/20 border ${
                    fieldErrors.location ? "border-red-500 focus:border-red-500" : "border-border/80 focus:border-emerald-500"
                  } rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none`}
                />
                {fieldErrors.location && (
                  <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.location}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl border border-border font-mono text-xs font-semibold text-foreground hover:bg-card transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3);
                }}
                className={`w-2/3 py-3 rounded-xl ${theme.buttonBg} font-mono text-sm font-semibold transition-colors shadow-md`}
              >
                Select Persona →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SELECT PERSONA */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-mono text-foreground">Step 3 — Select Persona Role</h2>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Choose your role within the CarbonX ecosystem. Your profile step will adjust dynamically.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 font-mono">
              {/* BUYER Option */}
              <div
                onClick={() => handleRoleChange("BUYER")}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                  role === "BUYER"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50"
                    : "bg-muted/10 border-border/60 text-muted-foreground hover:border-emerald-500/30 hover:bg-card"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">BUYER</h3>
                    {role === "BUYER" && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Source captured CO₂ for industrial applications, e-fuels, chemical synthesis, or mineralization.
                  </p>
                </div>
              </div>

              {/* DEALER Option */}
              <div
                onClick={() => handleRoleChange("DEALER")}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                  role === "DEALER"
                    ? "bg-purple-500/10 border-purple-500 text-purple-400 ring-1 ring-purple-500/50"
                    : "bg-muted/10 border-border/60 text-muted-foreground hover:border-purple-500/30 hover:bg-card"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 border border-purple-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">DEALER</h3>
                    {role === "DEALER" && <Check className="w-4 h-4 text-purple-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Brokering carbon supply with industrial demand, managing off-take deals, and earning commissions.
                  </p>
                </div>
              </div>

              {/* LOGISTICS Option */}
              <div
                onClick={() => handleRoleChange("LOGISTICS")}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                  role === "LOGISTICS"
                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 ring-1 ring-cyan-500/50"
                    : "bg-muted/10 border-border/60 text-muted-foreground hover:border-cyan-500/30 hover:bg-card"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 border border-cyan-500/30">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">LOGISTICS PROVIDER</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">LOGISTICS</span>
                    </div>
                    {role === "LOGISTICS" && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Transport compressed liquid and supercritical CO₂ via cryogenic road tankers and specialized ISO tanks.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-3 rounded-xl border border-border font-mono text-xs font-semibold text-foreground hover:bg-card transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className={`w-2/3 py-3 rounded-xl ${theme.buttonBg} font-mono text-sm font-semibold transition-colors shadow-md`}
              >
                Configure {theme.label} Profile →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ROLE PROFILE */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded ${theme.badgeBg}`}>
                  {role} PROFILE
                </span>
              </div>
              <h2 className="text-xl font-bold font-mono text-foreground mt-1">
                Step 4 — {theme.label} Specifications
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                Only fields relevant to {theme.label} are displayed below.
              </p>
            </div>

            {/* --- BUYER PROFILE FIELDS --- */}
            {role === "BUYER" && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">
                    Industry or Application <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Synthetic Fuel Synthesis / Chemicals"
                    value={buyerIndustry}
                    onChange={(e) => setBuyerIndustry(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                  {fieldErrors.buyerIndustry && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.buyerIndustry}</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Estimated CO₂ Requirement <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 300 tonnes/month"
                      value={estimatedCo2Req}
                      onChange={(e) => setEstimatedCo2Req(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                    {fieldErrors.estimatedCo2Req && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.estimatedCo2Req}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Preferred CO₂ Purity or Quality <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 99.5% Industrial Grade"
                      value={preferredPurity}
                      onChange={(e) => setPreferredPurity(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                    />
                    {fieldErrors.preferredPurity && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.preferredPurity}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">
                    Preferred Delivery Location <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune / Western India"
                    value={preferredDeliveryLocation}
                    onChange={(e) => setPreferredDeliveryLocation(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                  {fieldErrors.preferredDeliveryLocation && (
                    <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.preferredDeliveryLocation}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">CO₂ Usage Objective</label>
                  <input
                    type="text"
                    placeholder="e.g. Feedstock for e-methanol production"
                    value={usageObjective}
                    onChange={(e) => setUsageObjective(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Optional Sustainability Goals</label>
                  <input
                    type="text"
                    placeholder="e.g. Net-zero carbon targets by 2030"
                    value={sustainabilityGoals}
                    onChange={(e) => setSustainabilityGoals(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* --- DEALER PROFILE FIELDS --- */}
            {role === "DEALER" && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Trading or Business Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CarbonBridge Commodities"
                      value={tradingName || companyName}
                      onChange={(e) => setTradingName(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500"
                    />
                    {fieldErrors.tradingName && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.tradingName}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Business Category <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Commodity Brokerage"
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500"
                    />
                    {fieldErrors.businessCategory && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.businessCategory}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Areas Served <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pan-India / West"
                      value={areasServed}
                      onChange={(e) => setAreasServed(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500"
                    />
                    {fieldErrors.areasServed && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.areasServed}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Industries Served <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chemicals, F&B, Steel"
                      value={industriesServed}
                      onChange={(e) => setIndustriesServed(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500"
                    />
                    {fieldErrors.industriesServed && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.industriesServed}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Commercial Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 5+ years in gas trading"
                    value={commercialExperience}
                    onChange={(e) => setCommercialExperience(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Optional Business Description</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe your brokerage scope or market coverage..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* --- LOGISTICS PROFILE FIELDS --- */}
            {role === "LOGISTICS" && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Logistics Company Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EcoTransit Logistics"
                      value={logisticsCompanyName || companyName}
                      onChange={(e) => setLogisticsCompanyName(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-500"
                    />
                    {fieldErrors.logisticsCompanyName && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.logisticsCompanyName}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Service Regions <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Western & Central India"
                      value={serviceRegions}
                      onChange={(e) => setServiceRegions(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-500"
                    />
                    {fieldErrors.serviceRegions && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.serviceRegions}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      CO₂ Transportation Capability <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Liquid & Supercritical CO₂"
                      value={co2TransportCapability}
                      onChange={(e) => setCo2TransportCapability(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-500"
                    />
                    {fieldErrors.co2TransportCapability && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.co2TransportCapability}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground mb-1">
                      Approximate Capacity <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1,500 tonnes/month"
                      value={approxCapacity}
                      onChange={(e) => setApproxCapacity(e.target.value)}
                      className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-500"
                    />
                    {fieldErrors.approxCapacity && (
                      <span className="text-[11px] font-mono text-red-400 mt-1 block">{fieldErrors.approxCapacity}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Transport Modes</label>
                  <input
                    type="text"
                    placeholder="e.g. Cryogenic Tanker Fleet & ISO Containers"
                    value={transportModes}
                    onChange={(e) => setTransportModes(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1">Optional Fleet Information</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 15 Dedicated Cryogenic ISO Tankers with telematics"
                    value={fleetInformation}
                    onChange={(e) => setFleetInformation(e.target.value)}
                    className="w-full bg-muted/20 border border-border/80 rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 py-3 rounded-xl border border-border font-mono text-xs font-semibold text-foreground hover:bg-card transition-colors"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (validateStep4()) setStep(5);
                }}
                className={`w-2/3 py-3 rounded-xl ${theme.buttonBg} font-mono text-sm font-semibold transition-colors shadow-md`}
              >
                Review Registration →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & COMPLETE */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-mono text-foreground">Step 5 — Confirm Registration Summary</h2>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Verify your details before completing registration.
              </p>
            </div>

            <div className="bg-muted/20 border border-border/80 rounded-xl p-5 space-y-4 font-mono text-xs">
              {/* Account Info */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-muted-foreground">ACCOUNT</span>
                <span className="text-foreground font-semibold">{name} ({email})</span>
              </div>

              {/* Company Info */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-muted-foreground">COMPANY</span>
                <span className="text-foreground font-semibold">{companyName} — {location}</span>
              </div>

              {/* Persona Role */}
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <span className="text-muted-foreground">PERSONA ROLE</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-bold">{theme.label}</span>
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${theme.badgeBg}`}>
                    INTERNAL: {role}
                  </span>
                </div>
              </div>

              {/* Role-Specific Profile Summary (Only Selected Role Fields) */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {theme.label.toUpperCase()} PROFILE DATA
                </span>

                {role === "BUYER" && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/40 text-muted-foreground">
                    <div>Industry / Application: <span className="text-foreground font-semibold">{buyerIndustry}</span></div>
                    <div>Estimated Requirement: <span className="text-foreground font-semibold">{estimatedCo2Req}</span></div>
                    <div>Required Purity: <span className="text-foreground font-semibold">{preferredPurity}</span></div>
                    <div>Preferred Location: <span className="text-foreground font-semibold">{preferredDeliveryLocation}</span></div>
                    {usageObjective && <div>Objective: <span className="text-foreground">{usageObjective}</span></div>}
                    {sustainabilityGoals && <div>Goals: <span className="text-foreground">{sustainabilityGoals}</span></div>}
                  </div>
                )}

                {role === "DEALER" && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-purple-500/40 text-muted-foreground">
                    <div>Trading Name: <span className="text-foreground font-semibold">{tradingName || companyName}</span></div>
                    <div>Business Category: <span className="text-foreground font-semibold">{businessCategory}</span></div>
                    <div>Areas Served: <span className="text-foreground font-semibold">{areasServed}</span></div>
                    <div>Industries Served: <span className="text-foreground font-semibold">{industriesServed}</span></div>
                    {commercialExperience && <div>Experience: <span className="text-foreground">{commercialExperience}</span></div>}
                    {businessDescription && <div>Description: <span className="text-foreground">{businessDescription}</span></div>}
                  </div>
                )}

                {role === "LOGISTICS" && (
                  <div className="space-y-1.5 pl-2 border-l-2 border-cyan-500/40 text-muted-foreground">
                    <div>Logistics Company: <span className="text-foreground font-semibold">{logisticsCompanyName || companyName}</span></div>
                    <div>Service Regions: <span className="text-foreground font-semibold">{serviceRegions}</span></div>
                    <div>Transport Capability: <span className="text-foreground font-semibold">{co2TransportCapability}</span></div>
                    <div>Approximate Capacity: <span className="text-foreground font-semibold">{approxCapacity}</span></div>
                    {transportModes && <div>Transport Modes: <span className="text-foreground">{transportModes}</span></div>}
                    {fleetInformation && <div>Fleet Info: <span className="text-foreground">{fleetInformation}</span></div>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={submitting}
                className="w-1/3 py-3.5 rounded-xl border border-border font-mono text-xs font-semibold text-foreground hover:bg-card transition-colors disabled:opacity-50"
              >
                ← Edit Profile
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-2/3 py-3.5 rounded-xl ${theme.buttonBg} font-mono text-sm font-bold transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {submitting ? "Entering Ecosystem..." : `Complete Registration as ${role} →`}
              </button>
            </div>
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
