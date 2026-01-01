"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    ArrowLeft, Loader2, CircleX, Package, 
    User, Calendar, CheckCircle2, Clock, Printer, 
    Settings, Search, ClipboardCheck, Truck
} from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Types strictly following your JSON
type TrackingDetail = {
    name: string;
    scanDate: string;
    scanTime: string;
    stage: string;
};

type TrackingData = {
    invoice: string;
    date: string;
    trackingDetails: TrackingDetail[];
};

const InvoiceTrackingPage = () => {
    const params = useParams();
    const invoiceId = params.invoiceId; // Assuming your route is [invoiceId]
    const router = useRouter();

    const [data, setData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const res = await fetch(`/api/orders/track/${invoiceId}`);
                const json = await res.json();
                if (json.success) setData(json.data);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        if (invoiceId) fetchTracking();
    }, [invoiceId]);

    // Helper to get icons based on stage name
    const getStageIcon = (stage: string) => {
        const s = stage.toLowerCase();
        if (s.includes('print')) return <Printer className="w-5 h-5" />;
        if (s.includes('processing')) return <Settings className="w-5 h-5" />;
        if (s.includes('processed')) return <ClipboardCheck className="w-5 h-5" />;
        if (s.includes('checking')) return <Search className="w-5 h-5" />;
        if (s.includes('dispatched')) return <Truck className="w-5 h-5" />;
        return <CheckCircle2 className="w-5 h-5" />;
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading tracking status...</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <CircleX className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-xl font-bold">Invoice Not Found</h1>
            <Button onClick={() => router.back()} className="mt-4" variant="outline">Go Back</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Tracking Details</h1>
                            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">#{data.invoice}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
                {/* Top Info Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <Package className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">{data.invoice}</h2>
                            <div className="flex items-center gap-2 text-slate-500 mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 px-4 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest">
                        Live Status
                    </Badge>
                </motion.div>

                {/* Timeline Card */}
                <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-white">
                    <CardHeader className="border-b px-8 py-6">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-slate-400">
                            <Clock className="w-4 h-4" />
                            Activity Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100" />

                            <div className="space-y-10">
                                <AnimatePresence>
                                    {data.trackingDetails.map((step, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="relative flex gap-6"
                                        >
                                            {/* Icon Node */}
                                            <div className={cn(
                                                "relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm transition-colors shrink-0",
                                                index === 0 ? "bg-green-600 text-white" : "bg-slate-100 text-slate-500"
                                            )}>
                                                {getStageIcon(step.stage)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pt-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                    <h3 className="font-bold text-slate-900">{step.stage}</h3>
                                                    <span className="text-[10px] font-mono font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md self-start sm:self-center">
                                                        {step.scanTime}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-medium">Handled by <span className="text-slate-700 font-bold">{step.name}</span></span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default InvoiceTrackingPage;