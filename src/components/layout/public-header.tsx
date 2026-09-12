'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Atom, Menu, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#0B1220] flex items-center justify-center text-white shadow-md group-hover:bg-blue-600 transition-colors">
            <Atom className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#0B1220] group-hover:text-blue-600 transition-colors">
              Carbon<span className="text-blue-600">X</span>
            </span>
            <span className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase -mt-1">
              Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <Link href="/marketplace" className="hover:text-blue-600 transition-colors">
            Marketplace
          </Link>
          <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">
            How It Works
          </Link>
          <Link href="#applications" className="hover:text-blue-600 transition-colors">
            Applications
          </Link>
          <Link href="#analytics" className="hover:text-blue-600 transition-colors">
            Analytics
          </Link>
        </nav>

        {/* CTA Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="md">
              Dashboard
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="primary" size="md">
              Explore Marketplace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-700 hover:text-slate-900 rounded-lg"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-semibold text-slate-700 text-sm">
            <Link
              href="/marketplace"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Marketplace
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              How It Works
            </Link>
            <Link
              href="#applications"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Applications
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Dashboard Overview
            </Link>
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">
                Enter Platform
              </Button>
            </Link>
            <Link href="/marketplace" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" className="w-full">
                Explore Marketplace →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
