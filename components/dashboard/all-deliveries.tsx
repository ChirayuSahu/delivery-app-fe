'use client';

import React, { useEffect, useState, Suspense } from 'react';
import {
    Loader2,
    Package,
    Calendar as CalendarIcon,
    ArrowRight,
    TrendingUp,
    FileText,
    Clock,
    User,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
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

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Delivery {
    id: string;
    deliveryNo: string;
    startedAt: string | null;
    endedAt: string | null;
    invoiceCount: number;
    deliveryMan: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
} as const;

function DeliveriesSkeleton() {
    return (
        <div className="w-full bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-green-600 mb-2" />
            <span className="text-xs font-medium text-slate-400">Loading trips...</span>
        </div>
    );
}

type SortField = 'deliveryNo' | 'deliveryMan' | 'startedAt' | 'invoiceCount' | 'status';
type SortOrder = 'asc' | 'desc';

function AllDeliveriesCardInner() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const sortedDeliveries = React.useMemo(() => {
        if (!sortField) return deliveries;

        return [...deliveries].sort((a, b) => {
            let valA: any;
            let valB: any;

            switch (sortField) {
                case 'deliveryNo': {
                    const numA = parseInt(a.deliveryNo, 10);
                    const numB = parseInt(b.deliveryNo, 10);
                    if (isNaN(numA) || isNaN(numB)) {
                        valA = a.deliveryNo.toLowerCase();
                        valB = b.deliveryNo.toLowerCase();
                    } else {
                        valA = numA;
                        valB = numB;
                    }
                    break;
                }
                case 'deliveryMan':
                    valA = a.deliveryMan.toLowerCase();
                    valB = b.deliveryMan.toLowerCase();
                    break;
                case 'startedAt':
                    valA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
                    valB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
                    break;
                case 'invoiceCount':
                    valA = a.invoiceCount;
                    valB = b.invoiceCount;
                    break;
                case 'status': {
                    const getStatusVal = (d: Delivery) => {
                        if (d.endedAt) return 2; // Completed
                        if (d.startedAt) return 1; // Active
                        return 0; // Pending
                    };
                    valA = getStatusVal(a);
                    valB = getStatusVal(b);
                    break;
                }
                default:
                    return 0;
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [deliveries, sortField, sortOrder]);

    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

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
        <div className="w-full space-y-4">
            {/* Minimal Toolbar */}
            <div className="flex flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 shrink-0">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "justify-start text-left font-semibold text-xs rounded-lg h-9 border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-white min-w-[160px] sm:min-w-[200px] shadow-none",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                                {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-lg border border-slate-100" align="start">
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
                                disabled={(d) => d > new Date()}
                                initialFocus
                                className="rounded-xl border-none"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    <span className="text-[11px] font-semibold text-slate-600">
                        {deliveries.length} active {deliveries.length === 1 ? 'trip' : 'trips'}
                    </span>
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-2">
                        <Loader2 className="animate-spin h-5 w-5 text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">Filtering trips...</span>
                    </div>
                ) : deliveries.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                                    <th 
                                        onClick={() => handleSort('deliveryNo')}
                                        className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Trip No
                                            {sortField === 'deliveryNo' ? (
                                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('deliveryMan')}
                                        className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Delivery Executive
                                            {sortField === 'deliveryMan' ? (
                                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('startedAt')}
                                        className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Started At
                                            {sortField === 'startedAt' ? (
                                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('invoiceCount')}
                                        className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Invoices
                                            {sortField === 'invoiceCount' ? (
                                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('status')}
                                        className="py-3 px-5 font-semibold cursor-pointer hover:bg-slate-100/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            {sortField === 'status' ? (
                                                sortOrder === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-600" /> : <ArrowDown className="h-3 w-3 text-slate-600" />
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3 px-5 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="divide-y divide-slate-100 text-slate-700 text-xs"
                            >
                                {sortedDeliveries.map((delivery) => {
                                    const isCompleted = !!delivery.endedAt;
                                    const isStarted = !!delivery.startedAt;

                                    return (
                                        <motion.tr
                                            key={delivery.id}
                                            variants={itemVariants}
                                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                        >
                                            <td className="py-3.5 px-5 font-semibold text-slate-900">
                                                <Link href={`${pathname}/${delivery.id}`} className="block">
                                                    #{delivery.deliveryNo}
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-5 text-slate-600 font-medium">
                                                <Link href={`${pathname}/${delivery.id}`} className="block">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                            {delivery.deliveryMan.charAt(0)}
                                                        </div>
                                                        {delivery.deliveryMan}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-5 text-slate-500 font-medium">
                                                <Link href={`${pathname}/${delivery.id}`} className="block">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {delivery.startedAt
                                                            ? format(new Date(delivery.startedAt), "hh:mm a")
                                                            : "Not Started"}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-5 text-slate-500 font-medium">
                                                <Link href={`${pathname}/${delivery.id}`} className="block">
                                                    <div className="flex items-center gap-1">
                                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                        {delivery.invoiceCount} {delivery.invoiceCount === 1 ? 'invoice' : 'invoices'}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <Link href={`${pathname}/${delivery.id}`} className="block">
                                                    {isCompleted ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                                                            <span className="h-1 w-1 bg-green-500 rounded-full" />
                                                            Completed
                                                        </span>
                                                    ) : isStarted ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                                            <span className="h-1 w-1 bg-amber-500 rounded-full animate-pulse" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-100">
                                                            <span className="h-1 w-1 bg-slate-400 rounded-full" />
                                                            Pending
                                                        </span>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <Link href={`${pathname}/${delivery.id}`} className="inline-flex items-center gap-1 text-slate-400 group-hover:text-slate-900 font-semibold transition-colors">
                                                    <span>View</span>
                                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </motion.tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                            <Package className="h-6 w-6" />
                        </div>
                        <h4 className="text-slate-900 font-semibold text-sm">
                            No active trips
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
                            There are no recorded trips for this date.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AllDeliveriesCard() {
    return (
        <Suspense fallback={<DeliveriesSkeleton />}>
            <AllDeliveriesCardInner />
        </Suspense>
    );
}
