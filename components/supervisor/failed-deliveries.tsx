'use client';

import { AlertCircle, CheckCircle2, Loader2, ArrowRight, ShieldAlert, History } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, Variants } from "motion/react";

interface FailedDelivery {
    id: string;
    invType: string;
    invNo: string;
    customerName: string;
    updatedAt: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

function FailedDeliveriesSection() {
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

    if (loading) {
        return (
            <div className="w-full h-48 bg-white border border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scanning for issues...</p>
            </div>
        );
    }

    return (
        <section className="space-y-6">
            {/* Header Area */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 text-white">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Delivery Exceptions</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Action Required Items</p>
                    </div>
                </div>
                {deliveries.length > 0 && (
                    <div className="bg-red-50 px-4 py-1.5 rounded-full border border-red-100 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                            {deliveries.length} Critical
                        </span>
                    </div>
                )}
            </div>

            {deliveries.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {deliveries.map((delivery) => (
                        <Link 
                            href={`/dashboard/supervisor/invoice/${delivery.invType}${delivery.invNo}`} 
                            key={delivery.id}
                        >
                            <motion.div 
                                variants={itemVariants}
                                className="group relative bg-white border border-gray-200 rounded-[24px] p-5 shadow-sm hover:shadow-md hover:border-blue-600 transition-all cursor-pointer overflow-hidden"
                            >
                                {/* Exception Tag */}
                                <div className="absolute top-0 right-0">
                                    <div className="bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                                        Failed
                                    </div>
                                </div>

                                <div className="flex flex-col h-full">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                            <AlertCircle className="h-5 w-5 text-red-500 group-hover:text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-900 tracking-tighter">
                                                {delivery.invType} / {delivery.invNo}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Invoice Reference</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                            <p className="text-sm font-bold text-gray-700 truncate">{delivery.customerName}</p>
                                        </div>
                                        <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <History className="h-3 w-3 text-gray-400" />
                                                <p className="text-[9px] font-bold text-gray-500 uppercase">
                                                    {new Date(delivery.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 text-blue-600">
                                                <span className="text-[10px] font-black uppercase tracking-tighter">Review</span>
                                                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 bg-green-50/30 border-2 border-dashed border-green-100 rounded-[32px] text-center"
                >
                    <div className="p-5 bg-green-100 rounded-full mb-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Operation Clear</h3>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest mt-1">
                        No delivery exceptions detected for this cycle.
                    </p>
                </motion.div>
            )}
        </section>
    );
}

export default FailedDeliveriesSection;