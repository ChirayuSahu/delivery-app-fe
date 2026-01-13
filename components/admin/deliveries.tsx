'use client';

import React, { useEffect, useState } from 'react';
import {
  Loader2,
  Package,
  Clock,
  History,
  CircleDollarSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { format } from "date-fns";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Delivery {
  id: string;
  deliveryNo: string;
  failedDeliveries: string[];
  startedAt: string | null;
  endedAt: string | null;
  isPaid: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

export function UserDeliveriesCard({ userId }: { userId: string }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    async function fetchDeliveriesData() {
      if (!date) return;
      
      setLoading(true);
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const response = await fetch(`/api/users/${userId}/deliveries?date=${formattedDate}`);
        const json = await response.json();
        setDeliveries(json.data || []);
      } catch (error) {
        console.error("Error fetching user deliveries:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDeliveriesData();
  }, [userId, date]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-[24px] overflow-hidden flex flex-col shadow-sm h-full">
      {/* Header Section */}
      <div className="bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-xl shadow-lg shadow-green-100">
              <History className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Trip Logistics</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Activity History</p>
            </div>
          </div>
          <div className="flex items-center justify-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <span className="text-[10px] font-black text-green-600">{deliveries.length} Trips</span>
          </div>
        </div>

        {/* Shadcn Calendar Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-bold text-xs rounded-xl h-10 border-gray-200 hover:bg-white hover:border-green-500",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className="rounded-2xl border-none"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto h-full min-h-75">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filtering Records...</p>
          </div>
        ) : deliveries.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-50"
          >
            {deliveries.map((delivery) => {
              const isActive = !delivery.endedAt;
              const isFailed = delivery.failedDeliveries.length > 0;
              const isCompleted = delivery.endedAt && !isFailed;

              return (
                <Link href={`/dashboard/admin/deliveries/${delivery.id}`} key={delivery.id}>
                  <motion.div
                    variants={itemVariants}
                    className="p-5 hover:bg-gray-50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-blue-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-gray-900 tracking-tighter bg-gray-100 px-2 py-0.5 rounded">
                            #{delivery.deliveryNo}
                          </span>
                          {delivery.isPaid && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 rounded text-[9px] font-black text-green-600 border border-green-100 uppercase">
                              <CircleDollarSign className="h-3 w-3" /> Paid
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="h-3 w-3" />
                          <p className="text-[10px] font-bold uppercase">
                            {delivery.startedAt ? format(new Date(delivery.startedAt), "hh:mm a") : 'Not Started'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isActive && (
                          <div className="flex items-center gap-1 text-blue-600 animate-pulse">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">In Transit</span>
                          </div>
                        )}
                        {isCompleted && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Success</span>
                          </div>
                        )}
                        {isFailed && (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Issue</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden mr-6">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: isCompleted || isFailed ? '100%' : '60%' }}
                        />
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="p-6 bg-gray-50 rounded-full mb-4 border border-dashed border-gray-200">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h4 className="text-gray-900 font-bold text-sm uppercase">No Records</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Try another date</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDeliveriesCard;