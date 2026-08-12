"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
    Calendar, ArrowLeft, IndianRupee,
    CircleX, Loader2, Truck, Phone,
    CheckCircle2, Clock, Printer,
    Search, ClipboardCheck, ShoppingCart, Home,
    Package, MessageSquareQuote, FileImage
} from "lucide-react"
import Image from "next/image"
import { motion, Variants } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import ReturnInvoice from "@/components/dashboard/return-invoice"
import InvoiceExpenseDialog from "@/components/dashboard/invoice-expense-dialog"

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
    status: 'PENDING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED' | 'ASSIGNED' | 'RETURNED'
    deliveryMan?: string
    deliveredAt?: string
    items?: Item[]
    failedDeliveryId?: string
    failedBy?: string
    customerAddress: string
    customerPhone: string
    deliveryId?: string
    deliveryRemark?: string
    podUrl?: string
    expenseAmount?: number
    expenses?: any[]
    cases?: number
};

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } }
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

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/orders/invoice/${invoiceId}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (error) {
            console.error("Failed to fetch invoice", error);
        }
    };

    if (loading) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm max-w-2xl mx-auto mt-20">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin mb-2" />
            <p className="text-slate-400 text-xs font-medium">Loading Invoice Details...</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm max-w-2xl mx-auto mt-20 p-6 text-center">
            <CircleX className="w-6 h-6 text-red-500 mb-4" />
            <h1 className="text-sm font-semibold text-slate-900">Invoice Not Found</h1>
            <Button onClick={() => router.back()} className="mt-4 text-xs h-9 rounded-lg" variant="outline">Go Back</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-6 p-6 md:p-8"
            >
                {/* Quiet inline nav */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                            Invoice #{data.invoice}
                        </span>
                    </div>
                    <Badge className={cn(
                        "rounded px-2 py-0.5 text-[9px] font-semibold uppercase shadow-none border",
                        data.status === 'DELIVERED' ? "bg-green-50 text-green-700 border-green-200/40" : "bg-amber-50 text-amber-700 border-amber-200/40"
                    )}>
                        {data.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* Hero Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <Image alt='Logo' src='https://rajeshpharma.com/img/rp.svg' className='w-8 h-8' width={32} height={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{data.invoice}</h1>
                            <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-slate-50 p-2 rounded-sm border border-slate-100">
                            <IndianRupee className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Invoice Amount</p>
                            <p className="text-xl font-extrabold text-slate-900 leading-none">{data.amount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <motion.div variants={itemVariants} className="relative md:col-span-2 bg-white border border-slate-100 rounded-sm p-5 shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Customer Information</span>
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">{data.name}</h3>
                                <p className="text-xs text-slate-400 font-medium">{data.email}</p>
                            </div>
                            <div className="pt-2 border-t border-slate-50">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Address</span>
                                <h3 className="text-xs font-semibold text-slate-700 leading-normal">{data.customerAddress}</h3>
                            </div>
                            <div className="pt-2 border-t border-slate-50">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Phone</span>
                                <h3 className="text-xs font-semibold text-slate-700 leading-normal">{data.customerPhone}</h3>
                            </div>
                        </div>
                    </motion.div>

                    {/* Delivery Status Card */}
                    <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-sm p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Delivery Status</span>

                            {/* Main Status Link */}
                            <Link href={!!data.failedDeliveryId && data.status === 'FAILED' ? `/dashboard/admin/deliveries/${data.failedDeliveryId}` : `/dashboard/admin/deliveries/${data.deliveryId}`} className="block">
                                <div className={cn(
                                    "mb-4 p-3 rounded-sm border flex items-center gap-2",
                                    data.status === 'DELIVERED' ? "bg-green-50 border-green-200/40 text-green-700" :
                                        data.status === 'FAILED' ? "bg-red-50 border-red-200/40 text-red-700" : "bg-slate-50 border-slate-200/40 text-slate-700"
                                )}>
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full animate-pulse",
                                        data.status === 'DELIVERED' ? "bg-green-600" :
                                            data.status === 'FAILED' ? "bg-red-600" : "bg-slate-600"
                                    )} />
                                    <span className="text-xs font-bold uppercase">
                                        {data.status.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </Link>

                            <div className="space-y-4">
                                {data.status === 'FAILED' && (
                                    <ReturnInvoice invoiceId={String(invoiceId)} />
                                )}
                                {data.status !== 'FAILED' && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
                                            <Truck className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-400 uppercase font-bold leading-none mb-1">Executive</p>
                                            <p className="text-xs font-semibold text-slate-900">{data.deliveryMan || "Awaiting Assignment"}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Time Info */}
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 uppercase font-bold leading-none mb-1">
                                            {data.status === 'DELIVERED' ? "Delivered At" : "Last Update"}
                                        </p>
                                        <p className="text-xs font-semibold text-slate-900">
                                            {data.deliveredAt
                                                ? new Date(data.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                : new Date(data.date).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.deliveryMan && data.status !== 'DELIVERED' && (
                            <Button variant="outline" className="mt-4 w-full py-2 text-xs rounded-sm border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold gap-1.5 h-9">
                                <Phone className="w-3.5 h-3.5" />
                                Contact Executive
                            </Button>
                        )}
                    </motion.div>
                </div>

                {/* Remark & POD */}
                {(data.deliveryRemark || data.podUrl) && (
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.deliveryRemark && (
                            <div className={cn(
                                "bg-white border border-slate-200 rounded-sm p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden",
                                !data.podUrl && "md:col-span-2"
                            )}>
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <MessageSquareQuote className="w-32 h-32 text-indigo-900" />
                                </div>
                                <div className="flex items-center gap-3 mb-5 relative z-10">
                                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-sm text-indigo-600 shadow-xs">
                                        <MessageSquareQuote className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Delivery Remark</h3>
                                        <p className="text-[11px] font-medium text-slate-500">Note from executive</p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 rounded-sm p-5 relative z-10">
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                        "{data.deliveryRemark}"
                                    </p>
                                </div>
                            </div>
                        )}
                        {data.podUrl && (
                            <div className={cn(
                                "bg-white border border-slate-200 rounded-sm p-5 md:p-6 shadow-sm flex flex-col",
                                !data.deliveryRemark && "md:col-span-2"
                            )}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-sm text-emerald-600 shadow-xs">
                                        <FileImage className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Proof of Delivery</h3>
                                        <p className="text-[11px] font-medium text-slate-500">Captured at location</p>
                                    </div>
                                </div>
                                <div className="relative w-full flex items-center justify-center bg-slate-50/30 rounded-sm p-4 min-h-[250px] md:min-h-[300px]">
                                    <Image 
                                        alt='Proof of Delivery' 
                                        draggable={false} 
                                        src={data.podUrl} 
                                        className='max-h-[350px] w-auto object-contain rounded-sm shadow-xs' 
                                        width={1200} 
                                        height={1200} 
                                        unoptimized 
                                    />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Delivery Expense */}
                {data.deliveryId && (
                    <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5 mb-1">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                                Delivery Expense
                            </span>
                            <p className="text-xl font-extrabold text-slate-900 leading-none">₹{data.expenseAmount || 0}</p>
                        </div>
                        <InvoiceExpenseDialog
                            deliveryId={data.deliveryId}
                            invType={String(invoiceId).slice(0, 2)}
                            invNo={String(invoiceId).slice(2)}
                            expenseAmount={data.expenseAmount || 0}
                            expenses={data.expenses}
                            endedAt={data.status === 'DELIVERED' || data.status === 'FAILED' || data.status === 'RETURNED' ? new Date().toISOString() : null}
                            defaultCases={data.cases}
                            onUpdate={handleUpdate}
                        />
                    </motion.div>
                )}

                {/* Activity Log */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Activity Log
                        </span>
                    </div>
                    <div className="p-5 relative">
                        <div className="absolute left-[33px] top-6 bottom-6 w-0.5 bg-slate-100" />
                        <div className="space-y-6">
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
                            {data.status === 'DELIVERED' && (
                                <TimelineStep
                                    title="Delivered Successfully"
                                    time={data.deliveredAt ? new Date(data.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Completed"}
                                    date={data.deliveredAt}
                                    desc="Handed over to customer"
                                    isDone={true}
                                    isLast
                                    icon={<CheckCircle2 className="w-4 h-4" />}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Summary Table */}
                {data.items && data.items.length > 0 && (
                    <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                                <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                                Order Summary
                            </span>
                            <Badge variant="outline" className="bg-white text-[9px] font-semibold">{data.items.length} Items</Badge>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] font-bold text-slate-400 uppercase border-b border-slate-100 bg-slate-50/20">
                                        <th className="px-5 py-2.5">Item Name</th>
                                        <th className="px-4 py-2.5 text-center">Batch</th>
                                        <th className="px-4 py-2.5 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                                            <td className="px-5 py-3">
                                                <p className="text-xs font-semibold text-slate-900">{item.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="secondary" className="text-[9px] font-mono bg-slate-100 border-none shadow-none">{item.batch}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-xs font-bold text-slate-700">{item.quantity}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div >
    )
}

const TimelineStep = ({ title, time, desc, icon, date }: any) => (
    <div className="relative flex gap-4 group">
        <div className="relative z-10 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-500 shadow-sm">
            {icon || <GetStageIcon stage={title} />}
        </div>
        <div className="flex-1 pt-0.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-xs font-semibold text-slate-900">{title}</h4>
                <span className="text-[9px] font-mono text-slate-400">
                    {new Date(date).toLocaleDateString('en-GB')} - {time}
                </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Processed by: <span className="text-slate-600 font-semibold">{desc}</span></p>
        </div>
    </div>
);

const GetStageIcon = ({ stage }: { stage: string }) => {
    const s = stage.toLowerCase();
    if (s.includes('print')) return <Printer className="w-3.5 h-3.5" />;
    if (s.includes('processing')) return <Clock className="w-3.5 h-3.5" />;
    if (s.includes('checking')) return <Search className="w-3.5 h-3.5" />;
    if (s.includes('dispatched') || s.includes('delivery')) return <Truck className="w-3.5 h-3.5" />;
    return <ClipboardCheck className="w-3.5 h-3.5" />;
};

export default InvoicePage;