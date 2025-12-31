'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  MapPin,
  History,
  CircleDollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface Delivery {
  id: string;
  deliveryNo: string;
  failedDeliveries: string[];
  startedAt: string | null;
  endedAt: string | null;
  isPaid: boolean;
}

export function UserDeliveriesCard({ userId }: { userId: string }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchDeliveriesData() {
      try {
        const response = await fetch(`/api/users/${userId}/deliveries`);
        const json = await response.json();
        setDeliveries(json.data || []);
      } catch (error) {
        console.error("Error fetching user deliveries:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveriesData();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-green-500" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Trips</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-xl shadow-slate-200/40 h-full flex flex-col overflow-hidden bg-white">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-600 rounded-xl shadow-lg shadow-green-200">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Trip Logistics
              </CardTitle>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Historical Performance
              </p>
            </div>
          </div>
          <Badge className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg px-3 py-1">
            {deliveries.length} Total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        {deliveries.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {deliveries.map((delivery) => {
              const isFailed = delivery.failedDeliveries.length > 0;
              const isActive = !delivery.endedAt;
              const isCompleted = delivery.endedAt && !isFailed;

              return (
                <Link href={`/dashboard/supervisor/deliveries/${delivery.id}`} key={delivery.id}>
                <div className="relative p-5 hover:bg-indigo-50/30 transition-all group cursor-pointer border-l-4 border-transparent hover:border-blue-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-slate-900 tracking-tighter bg-slate-100 px-2 py-0.5 rounded">
                          #{delivery.deliveryNo}
                        </span>
                        {delivery.isPaid && (
                          <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3 w-3" />
                        <p className="text-[11px] font-bold">
                          {delivery.startedAt ? new Date(delivery.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Pending Start'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Chips */}
                    <div className="flex flex-col items-end gap-1.5">
                      {delivery.startedAt && !delivery.endedAt && (
                        <span className="text-[9px] font-black text-blue-600 bg-blue-100/50 border border-blue-200 px-2 py-1 rounded-md uppercase tracking-tighter animate-pulse">
                          Out for Delivery
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-100/50 border border-emerald-200 px-2 py-1 rounded-md uppercase tracking-tighter">
                          Completed
                        </span>
                      )}
                      {isFailed && (
                        <span className="text-[9px] font-black text-red-600 bg-red-100/50 border border-red-200 px-2 py-1 rounded-md uppercase tracking-tighter">
                          {delivery.failedDeliveries.length} Exceptions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Line Simulation */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isFailed ? 'bg-green-500' : isCompleted ? 'bg-green-500' : 'bg-blue-500 animate-shimmer'}`} 
                        style={{ width: isCompleted || isFailed ? '100%' : '65%' }}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                       <p className={`text-[10px] font-black uppercase tracking-widest ${delivery.isPaid ? 'text-emerald-600' : 'text-slate-300'}`}>
                        {delivery.isPaid ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>
                  </div>
                </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-16 px-10 text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4 border-2 border-dashed border-slate-100">
              <Package className="h-12 w-12 opacity-20" />
            </div>
            <h4 className="text-slate-900 font-bold text-sm">No Trip History</h4>
            <p className="text-xs font-medium mt-1 leading-relaxed">
              This executive hasn't been assigned any delivery routes yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UserDeliveriesCard;