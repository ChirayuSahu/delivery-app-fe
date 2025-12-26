'use client';

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Search, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

type Delivery = {
  id: string;
  startedAt: string | null;
  endedAt: string | null;
  invoiceCount: number;
}

export default function DashboardPage() {

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/delivery`, {
          method: 'GET',
          credentials: 'include',
        })

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || 'Failed to fetch deliveries');
        }

        setDeliveries(json.data);

      } catch (error) {
        console.error("Failed to fetch deliveries:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDeliveries();

  }, []);

  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* 1. Header Section */}
      <header className="bg-white border-b px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Deliveries</h1>
            <p className="text-slate-500 text-sm">Manage and track your pharmaceutical shipments</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={'/dashboard/status'}>
              <Button variant="outline" className="gap-2 bg-white">
                <ArrowDownUp className="h-4 w-4" />
                Order Status
              </Button>
            </Link>
            <Link href={'/dashboard/delivery'}>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
              <Plus className="h-4 w-4" />
              Create Delivery
            </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 space-y-6">
        {/* 2. Filters & Stats Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Showing {deliveries.length} active {deliveries.length === 1 ? 'delivery' : 'deliveries'}</span>
          </div>
        </div>

        {/* 3. Refined Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveries.map((delivery) => (
            <Link
              key={delivery.id}
              href={`/dashboard/delivery/${delivery.id}`}
              className="group block p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery ID</p>
                  <p className="text-lg font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {delivery.id}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {delivery.invoiceCount} Invoices
                </div>
                <span>{delivery.startedAt ? new Date(delivery.startedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

// Helper for row styles
const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  if (s === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "dispatched") return "bg-blue-50 text-blue-700 border-blue-100";
  if (s === "processing") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-slate-50 text-slate-700 border-slate-100";
};

const data = [
  { id: "ORD-21085", customer: "Rajesh Pharma", status: "Dispatched", date: "25 Dec 2025", amount: "₹12,430" },
  { id: "ORD-21086", customer: "Apollo Medicals", status: "Processing", date: "25 Dec 2025", amount: "₹8,210" },
  { id: "ORD-21087", customer: "City Care", status: "Delivered", date: "24 Dec 2025", amount: "₹15,900" },
];