'use client';

import React, { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, PackageCheck, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CreateDeliveryButton from "@/components/deliveryman/create-delivery";

type Delivery = {
  id: string;
  startedAt: string | null;
  endedAt: string | null;
  invoiceCount: number;
  deliveryNo: string;
}

export default function DashboardPage() {

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();

  useEffect(() => {

    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/deliveries`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
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
            <Link href={`${pathname}/status`}>
              <Button variant="outline" className="gap-2 bg-white">
                <ArrowDownUp className="h-4 w-4" />
                Order Status
              </Button>
            </Link>
            <CreateDeliveryButton />
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
              href={`${pathname}/deliveries/${delivery.id}`}
              className="group block p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-green-500 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  {delivery.endedAt && (
                    <PackageCheck className="w-6 h-6 text-green-500" />
                  )}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery No</p>
                    <p className="text-lg font-mono font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                      {delivery.deliveryNo}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-green-50 transition-colors">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-green-600" />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {delivery.invoiceCount} Invoices
                </div>
                {delivery.startedAt && !delivery.endedAt && (
                  <span>Started {new Date(delivery.startedAt).toLocaleString()}</span>
                )}
                {delivery.endedAt && (
                  <span>Ended {new Date(delivery.endedAt).toLocaleString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}