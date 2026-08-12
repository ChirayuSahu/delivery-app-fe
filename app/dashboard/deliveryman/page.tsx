'use client';

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, PackageCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CreateDeliveryButton from "@/components/deliveryman/create-delivery";
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";



type Delivery = {
  id: string;
  startedAt: string | null;
  endedAt: string | null;
  invoiceCount: number;
  deliveryNo: string;
}

type DeliverymanProfile = {
  name: string;
  wallet: number | null;
}

export default function DashboardPage() {

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<DeliverymanProfile | null>(null);

  const pathname = usePathname();

  useEffect(() => {

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/users/me", {
          method: "GET",
          credentials: "include",
        })

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch user profile");
        }

        setProfile({
          name: json.data?.name || "Delivery Executive",
          wallet: typeof json.data?.wallet === "number" ? json.data.wallet : null,
        })
      } catch (error) {
        console.error("Failed to fetch deliveryman profile:", error);
      }
    }

    fetchProfile();

  }, []);

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
        <Loader2 className="h-8 w-8 text-dispatch-ink animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        {/* 1. Header Section */}
        <header className="bg-card border-b border-border px-8 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Deliveries</h1>
              <p className="text-muted-foreground text-sm">
                {profile?.name || "Delivery Executive"} • Balance{" "}
                <span className="font-mono text-foreground">
                  ₹{(profile?.wallet ?? 0).toFixed(2)}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
              <Link href="/dashboard/deliveryman/transactions">
                <Button variant="outline" className="gap-2">
                  <ArrowDownUp className="h-4 w-4" />
                  <span>Transactions</span>
                </Button>
              </Link>
              <CreateDeliveryButton />
              <div className="w-px h-8 bg-border mx-1 hidden md:block"></div>
              <LogoutButton />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-8 space-y-6">
          {/* 2. Filters & Stats Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <span>Showing {deliveries.length} active {deliveries.length === 1 ? 'delivery' : 'deliveries'}</span>
            </div>
          </div>

          {/* 3. Manifest ticket grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveries.map((delivery) => (
              <Link
                key={delivery.id}
                href={`/dashboard/deliveryman/deliveries/${delivery.id}`}
                className="group block bg-card border border-border rounded-lg shadow-sm hover:border-dispatch-ink hover:shadow-md transition-all active:scale-[0.98] overflow-hidden"
              >
                <div className="flex justify-between items-start p-5">
                  <div className="flex gap-4 items-center">
                    {delivery.endedAt && (
                      <PackageCheck className="w-6 h-6 text-dispatch-ink" />
                    )}
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Delivery No</p>
                      <p className="text-lg font-mono font-bold text-foreground group-hover:text-dispatch-ink transition-colors">
                        {delivery.deliveryNo}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-muted rounded-md group-hover:bg-success transition-colors">
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-dispatch-ink" />
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-dashed border-rule flex items-center justify-between text-xs text-muted-foreground">
                  <span>{delivery.invoiceCount} Invoices</span>
                  {delivery.endedAt ? (
                    <Badge variant="stamp-success">Delivered</Badge>
                  ) : delivery.startedAt ? (
                    <Badge variant="stamp-warning">In Transit</Badge>
                  ) : (
                    <Badge variant="stamp-neutral">Pending</Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    );
}