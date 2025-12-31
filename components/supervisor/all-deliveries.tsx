'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
    Loader2,
    Package,
    Clock,
    History,
    ArrowRight,
    CheckCircle2,
    Calendar as CalendarIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Link from 'next/link';
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useSearchParams, useRouter } from 'next/navigation';

interface Delivery {
    id: string;
    deliveryNo: string;
    startedAt: string | null;
    endedAt: string | null;
    invoiceCount: number;
    deliveryMan: string;
}

/* ---------------- ANIMATION ---------------- */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};


function DeliveriesSkeleton() {
    return (
        <div className="w-full bg-white border border-gray-200 rounded-[24px] p-10 flex flex-col items-center justify-center shadow-sm max-h-full">
            <Loader2 className="h-6 w-6 animate-spin text-green-600 mb-3" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Loading Deliveries…
            </p>
        </div>
    );
}

function AllDeliveriesCardInner() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const searchParams = useSearchParams();
    const router = useRouter();

    const dateParam = searchParams.get('date');

    const [date, setDate] = useState<Date>(
        dateParam ? new Date(dateParam) : new Date()
    );

    useEffect(() => {
        async function fetchDeliveriesData() {
            if (!date) return;

            setLoading(true);
            try {
                const formattedDate = format(date, "yyyy-MM-dd");
                const response = await fetch(`/api/deliveries?date=${formattedDate}`);
                const json = await response.json();
                setDeliveries(json.data || []);
            } catch (error) {
                console.error("Error fetching deliveries:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDeliveriesData();
    }, [date]);

    return (
        <div className="w-full bg-white border border-gray-200 rounded-[24px] overflow-hidden flex flex-col shadow-sm max-h-full">
            <div className="bg-gray-50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-600 rounded-xl shadow-lg shadow-green-100">
                            <History className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                Trip Logistics
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Activity History
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
                        <span className="text-[10px] font-black text-green-600">
                            {deliveries.length} Trips
                        </span>
                    </div>
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-bold text-xs rounded-xl h-10 border-gray-200 hover:bg-white hover:border-green-500",
                                !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                            {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                                if (!selectedDate) return;

                                setDate(selectedDate);
                                router.push(`?date=${format(selectedDate, "yyyy-MM-dd")}`, {
                                    scroll: false,
                                });
                            }}
                            initialFocus
                            className="rounded-2xl border-none"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto min-h-64">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Filtering Records…
                        </p>
                    </div>
                ) : deliveries.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="divide-y divide-gray-50"
                    >
                        {deliveries.map((delivery) => {
                            const isCompleted = !!delivery.endedAt;

                            return (
                                <Link
                                    href={`/dashboard/supervisor/deliveries/${delivery.id}`}
                                    key={delivery.id}
                                >
                                    <motion.div
                                        variants={itemVariants}
                                        className="p-5 hover:bg-gray-50 transition-all group cursor-pointer border-l-4 border-transparent hover:border-blue-600"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-black bg-gray-100 px-2 py-0.5 rounded">
                                                        #{delivery.deliveryNo}
                                                    </span>
                                                    <span className="text-xs font-black bg-gray-100 px-2 py-0.5 rounded">
                                                        {delivery.deliveryMan}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <Clock className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase">
                                                        {delivery.startedAt
                                                            ? format(new Date(delivery.startedAt), "hh:mm a")
                                                            : "Not Started"}
                                                    </span>
                                                </div>
                                            </div>

                                            {isCompleted && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="text-[10px] font-black uppercase">
                                                        Success
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden mr-6">
                                                <div
                                                    className={`h-full rounded-full ${isCompleted ? "bg-green-500 w-full" : "bg-blue-500 w-3/5"
                                                        }`}
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
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Package className="h-10 w-10 text-gray-300 mb-4" />
                        <h4 className="text-gray-900 font-bold text-sm uppercase">
                            No Records
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            Try another date
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------------- DEFAULT EXPORT ---------------- */

export default function AllDeliveriesCard() {
    return (
        <Suspense fallback={<DeliveriesSkeleton />}>
            <AllDeliveriesCardInner />
        </Suspense>
    );
}
