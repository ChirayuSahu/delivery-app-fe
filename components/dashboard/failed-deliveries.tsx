'use client';

import { AlertCircle, CheckCircle2, Loader2, ArrowRight, ShieldAlert, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";

interface FailedDelivery {
    id: string;
    invType: string;
    invNo: string;
    customerName: string;
    updatedAt: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
};

export default function FailedDeliveriesSection({ onInitialLoad }: { onInitialLoad?: () => void }) {
    const { userRole } = useAuth();
    const rolePrefix = userRole?.toLowerCase() || 'admin';
    const [deliveries, setDeliveries] = useState<FailedDelivery[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const hasFetched = useRef(false);

    async function fetchFailedDeliveries() {
        try {
            const response = await fetch('/api/deliveries/failed');
            const data = await response.json();
            setDeliveries(data.data || []);
        } catch (error) {
            console.error("Error fetching failed deliveries:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        fetchFailedDeliveries();
    }, []);

    const hasReportedLoad = useRef(false);
    useEffect(() => {
        if (!loading && !hasReportedLoad.current) {
            hasReportedLoad.current = true;
            onInitialLoad?.();
        }
    }, [loading, onInitialLoad]);

    if (loading) {
        return (
            <div className="w-full bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center shadow-sm">
                <Loader2 className="animate-spin h-5 w-5 text-slate-400 mb-2" />
                <span className="text-xs text-slate-400 font-medium">Scanning exceptions...</span>
            </div>
        );
    }

    return (
        <section className="space-y-4">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-slate-500" />
                    <h2 className="text-xs font-semibold text-slate-900">Delivery Exceptions</h2>
                </div>
                {deliveries.length > 0 && (
                    <div className="bg-red-50 px-2 py-0.5 rounded text-[10px] font-semibold text-red-700 border border-red-200/40">
                        {deliveries.length} Critical
                    </div>
                )}
            </div>

            {deliveries.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {deliveries.map((delivery) => (
                        <Link 
                            href={`/dashboard/${rolePrefix}/invoice/${delivery.invType}${delivery.invNo}`} 
                            key={delivery.id}
                            className="block"
                        >
                            <motion.div 
                                variants={itemVariants}
                                className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md hover:border-red-200/50 transition-all duration-300 cursor-pointer overflow-hidden shadow-sm flex flex-col justify-between min-h-[140px]"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <span className="text-xs font-semibold text-slate-900">
                                            {delivery.invType} / {delivery.invNo}
                                        </span>
                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-50 text-red-700 border border-red-100">
                                            Failed
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                                        {delivery.customerName}
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>
                                            {new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 text-slate-400 group-hover:text-slate-900 font-semibold transition-colors text-[11px]">
                                        <span>Review</span>
                                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                    <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <h4 className="text-slate-900 font-semibold text-sm">
                        No Exceptions
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                        All operations are running smoothly.
                    </p>
                </div>
            )}
        </section>
    );
}