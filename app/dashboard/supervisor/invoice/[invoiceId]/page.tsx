"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    Calendar, ArrowLeft, IndianRupee,
    CircleX, Loader2, Truck, Phone, Fingerprint,
    CheckCircle2, Package, User, Clock, Printer,
    Search, ClipboardCheck, ShoppingCart, Tag
} from "lucide-react"
import Image from "next/image"
import { motion, Variants, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import ReturnInvoice from "@/components/supervisor/return-invoice"

// Types strictly following your provided InvoiceData
type Track = {
    name: string
    scanDate: string
    scanTime: string
    stage: string
}

type Item = {
    name: string
    quantity: number
    batch: string
}

type InvoiceData = {
    name: string
    email: string
    amount: number
    invoice: string
    date: string
    trackingDetails: Track[]
    status: 'PENDING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'ASSIGNED'
    deliveryMan?: string
    deliveredAt?: string
    items: Item[]
    failedDeliveryId?: string
    failedBy?: string
    customerAddress: string
    customerPhone: string
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

const InvoicePage = () => {
    const params = useParams();
    const { invoiceId } = params;
    const router = useRouter();

    const [data, setData] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/orders/invoice/${invoiceId}`);
                const json = await res.json();
                if (json.success) setData(json.data);
            } catch (error) {
                console.error("Failed to fetch invoice", error);
            } finally {
                setLoading(false);
            }
        };
        if (invoiceId) fetchInvoice();
    }, [invoiceId]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading Invoice Details...</p>
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
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Invoice Details</h1>
                            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-widest">#{data.invoice}</p>
                        </div>
                    </div>
                    <Badge className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-bold uppercase border shadow-xs",
                        data.status === 'DELIVERED' ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                        {data.status.replace(/_/g, ' ')}
                    </Badge>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-4xl mx-auto space-y-6 p-4 md:p-8"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white border rounded-[22px] shadow-xs">
                            <Image alt='Logo' src='https://rajeshpharma.com/img/rp.svg' className='w-10 h-10' width={40} height={40} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.invoice}</h1>
                            <div className="flex items-center gap-2 text-slate-500 mt-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">{new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-green-100 p-4 rounded-xl shadow-xs flex items-center gap-3">
                        <div className="bg-green-50 p-2 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Invoice Amount</p>
                            <p className="text-2xl font-black text-slate-900 leading-none">{data.amount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <motion.div variants={itemVariants} className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Customer Information</p>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{data.name}</h3>
                                <p className="text-sm font-medium text-slate-500">{data.email}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{data.customerAddress}</h3>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">{data.customerPhone}</h3>
                            </div>
                        </div>
                    </motion.div>

                    {/* Delivery Stats */}
                    <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Delivery Status</p>

                            {/* Main Status Badge */}
                            <Link href={!!data.failedDeliveryId && data.status === 'FAILED' ? `/dashboard/supervisor/deliveries/${data.failedDeliveryId}` : ''} className="block">
                                <div className={cn(
                                    "mb-6 p-4 rounded-2xl border flex items-center gap-3",
                                    data.status === 'DELIVERED' ? "bg-green-50 border-green-100" :
                                        data.status === 'FAILED' ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
                                )}>
                                    <div className={cn(
                                        "h-2 w-2 rounded-full animate-pulse",
                                        data.status === 'DELIVERED' ? "bg-green-600" :
                                            data.status === 'FAILED' ? "bg-red-600" : "bg-blue-600"
                                    )} />
                                    <span className={cn(
                                        "text-sm font-black uppercase tracking-tight",
                                        data.status === 'DELIVERED' ? "text-green-700" :
                                            data.status === 'FAILED' ? "text-red-700" : "text-blue-700"
                                    )}>
                                        {data.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </Link>

                            <div className="space-y-5">
                                {data.status === 'FAILED' && (
                                    <ReturnInvoice invoiceId={String(invoiceId)} />
                                )}
                                {data.status !== 'FAILED' && (
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                            <Truck className="w-5 h-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Assigned Executive</p>
                                            <p className="text-sm font-bold text-slate-900">{data.deliveryMan || "Awaiting Assignment"}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Time Info */}
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">
                                            {data.status === 'DELIVERED' ? "Delivered At" : "Last Update"}
                                        </p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {data.deliveredAt
                                                ? new Date(data.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                : new Date(data.date).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call Action - only shows if delivery man is assigned */}
                        {data.deliveryMan && data.status !== 'DELIVERED' && (
                            <Button variant="outline" className="mt-6 w-full py-6 rounded-xl border-green-200 text-green-700 hover:bg-green-50 hover:text-green-700 font-bold gap-2">
                                <Phone className="w-4 h-4" />
                                Contact Executive
                            </Button>
                        )}
                    </motion.div>
                </div>

                {/* Combined Tracking Journey */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-xs">
                    <div className="bg-slate-50/50 px-8 py-4 border-b">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            Activity Log
                        </p>
                    </div>
                    <div className="p-8 relative">
                        {/* Line */}
                        <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-slate-100" />

                        <div className="space-y-10">
                            {data.trackingDetails.map((step, idx) => (
                                <TimelineStep
                                    key={idx}
                                    title={step.stage}
                                    time={step.scanTime}
                                    date={step.scanDate}
                                    desc={step.name}
                                    isDone={true}
                                />
                            ))}
                            {/* Auto-append final status if not in tracking list */}
                            {data.status === 'DELIVERED' && (
                                <TimelineStep
                                    title="Delivered Successfully"
                                    time={data.deliveredAt ? new Date(data.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Completed"}
                                    date={data.deliveredAt}
                                    desc="Handed over to customer"
                                    isDone={true}
                                    isLast
                                    icon={<CheckCircle2 className="w-5 h-5" />}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Items Section */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <div className="bg-slate-50/50 px-8 py-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Order Summary</span>
                        </div>
                        <Badge variant="outline" className="bg-white text-[10px] font-bold">{data.items.length} Items</Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter border-b">
                                    <th className="px-8 py-4">Item Name</th>
                                    <th className="px-4 py-4 text-center">Batch</th>
                                    <th className="px-4 py-4 text-center">Qty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.items.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4">
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-green-700">{item.name}</p>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <Badge variant="secondary" className="text-[9px] font-mono font-bold bg-slate-100">{item.batch}</Badge>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="text-sm font-black text-slate-700">{item.quantity}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

const TimelineStep = ({ title, time, desc, isDone, isLast, icon, date }: any) => (
    <div className="relative flex gap-8 group">
        <div className={cn(
            "relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-xs transition-all",
            isDone ? "bg-green-600 text-white" : "bg-slate-100 text-slate-400"
        )}>
            {icon || <GetStageIcon stage={title} />}
        </div>
        <div className="flex-1 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{title}</h4>
                <Badge variant="outline" className="text-[10px] font-mono bg-slate-50 text-green-600 border-green-100 w-fit">
                    {new Date(date).toLocaleDateString('en-GB')} - {time}
                </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Processed by: <span className="text-slate-700 font-bold">{desc}</span></p>
        </div>
    </div>
);

const GetStageIcon = ({ stage }: { stage: string }) => {
    const s = stage.toLowerCase();
    if (s.includes('print')) return <Printer className="w-5 h-5" />;
    if (s.includes('processing')) return <Clock className="w-5 h-5" />;
    if (s.includes('checking')) return <Search className="w-5 h-5" />;
    if (s.includes('dispatched') || s.includes('delivery')) return <Truck className="w-5 h-5" />;
    return <ClipboardCheck className="w-5 h-5" />;
};

export default InvoicePage;