'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useAuth } from '@/context/auth-context';
import { FacilitatedDeal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Send, CheckCircle2, XCircle, FileCheck, Truck, Clock } from 'lucide-react';

export default function SupplyRequestsPage() {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      const data = await db.getRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await db.acceptProposal(requestId, user?.id || "");
      setActionMessage(`✓ Proposal accepted! Deal confirmed & Shipment initialized.`);
      await loadRequests();
    } catch (err) {
      console.error('Error accepting request', err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await db.updateRequestStatus(requestId, 'REJECTED');
      setActionMessage('Request status updated to Rejected.');
      await loadRequests();
    } catch (err) {
      console.error('Error rejecting request', err);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'ALL') return true;
    return r.status === activeTab;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Supply Requests</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and manage CO₂ supply agreement requests.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-200">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} {tab === 'PENDING' && `(${requests.filter(r => r.status === 'PENDING').length})`}
          </button>
        ))}
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Send className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No requests in this view</h3>
            <p className="text-xs text-slate-500">
              When buyers request CO₂ supply from your listings, they will appear here for acceptance.
            </p>
          </div>
        ) : (
          filteredRequests.map((r) => (
            <div
              key={r.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SUPPLY REQUEST</span>
                  <h3 className="text-lg font-bold text-slate-900">{r.buyer_name}</h3>
                  <p className="text-xs text-slate-500">Targeting: {r.supplier_name}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Requested Quantity</span>
                  <span className="font-bold text-slate-900">{r.quantity} t/month</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Duration</span>
                  <span className="font-bold text-slate-900">{r.duration_months} Months</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Carbon Value</span>
                  <span className="font-bold text-slate-900">{formatCurrency(r.calculated_carbon_value)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold">Est. Total Agreement</span>
                  <span className="font-extrabold text-blue-700">{formatCurrency(r.calculated_total_value)}</span>
                </div>
              </div>

              {r.message && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                  "{r.message}"
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Requested on {formatDate(r.created_at)}
                </span>

                {r.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleReject(r.id)}>
                      <XCircle className="w-3.5 h-3.5 text-red-500" /> Reject
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleAccept(r.id)}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept Request & Create Deal
                    </Button>
                  </div>
                ) : r.status === 'ACCEPTED' ? (
                  <Link href="/deals">
                    <Button variant="outline" size="sm">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" /> View Deal & Shipment →
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
