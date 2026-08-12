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
        <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border shadow-sm max-w-2xl mx-auto mt-20">
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mb-2" />
            <p className="text-muted-foreground text-xs font-medium">Loading Invoice Details...</p>
        </div>
    );

    if (!data) return (
        <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border shadow-sm max-w-2xl mx-auto mt-20 p-6 text-center">
            <CircleX className="w-6 h-6 text-destructive mb-4" />
            <h1 className="text-sm font-semibold text-foreground">Invoice Not Found</h1>
            <Button onClick={() => router.back()} className="mt-4 text-xs h-9 rounded-lg" variant="outline">Go Back</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-muted/50 pb-12">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-6 p-6 md:p-8"
            >
                {/* Quiet inline nav */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider font-mono">
                            Invoice #{data.invoice}
                        </span>
                    </div>
                    <Badge variant={data.status === 'DELIVERED' ? "stamp-success" : data.status === 'FAILED' || data.status === 'RETURNED' ? "stamp-destructive" : "stamp-warning"}>
                        {data.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* Hero Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-card border border-border rounded-xl shadow-sm">
                            <Image alt='Logo' src='https://rajeshpharma.com/img/rp.svg' className='w-8 h-8' width={32} height={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{data.invoice}</h1>
                            <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-sm shadow-sm flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-muted p-2 rounded-sm border border-border">
                            <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Invoice Amount</p>
                            <p className="text-xl font-extrabold text-foreground leading-none">{data.amount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <motion.div variants={itemVariants} className="relative md:col-span-2 bg-card border border-border rounded-sm p-5 shadow-sm">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">Customer Information</span>
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-base font-semibold text-foreground">{data.name}</h3>
                                <p className="text-xs text-muted-foreground font-medium">{data.email}</p>
                            </div>
                            <div className="pt-2 border-t border-border">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Address</span>
                                <h3 className="text-xs font-semibold text-foreground leading-normal">{data.customerAddress}</h3>
                            </div>
                            <div className="pt-2 border-t border-border">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Phone</span>
                                <h3 className="text-xs font-semibold text-foreground leading-normal">{data.customerPhone}</h3>
                            </div>
                        </div>
                    </motion.div>

                    {/* Delivery Status Card */}
                    <motion.div variants={itemVariants} className="bg-card border border-border rounded-sm p-5 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">Delivery Status</span>

                            {/* Main Status Link */}
                            <Link href={!!data.failedDeliveryId && data.status === 'FAILED' ? `/dashboard/admin/deliveries/${data.failedDeliveryId}` : `/dashboard/admin/deliveries/${data.deliveryId}`} className="block">
                                <div className={cn(
                                    "mb-4 p-3 rounded-sm border flex items-center gap-2",
                                    data.status === 'DELIVERED' ? "bg-success border-dispatch-ink/40 text-dispatch-ink" :
                                        data.status === 'FAILED' ? "bg-destructive/10 border-destructive/40 text-destructive" : "bg-muted border-border/60 text-foreground"
                                )}>
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full animate-pulse",
                                        data.status === 'DELIVERED' ? "bg-dispatch-ink" :
                                            data.status === 'FAILED' ? "bg-destructive" : "bg-muted-foreground"
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
                                        <div className="h-9 w-9 bg-muted border border-border rounded-sm flex items-center justify-center shrink-0">
                                            <Truck className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold leading-none mb-1">Executive</p>
                                            <p className="text-xs font-semibold text-foreground">{data.deliveryMan || "Awaiting Assignment"}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Time Info */}
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-muted border border-border rounded-sm flex items-center justify-center shrink-0">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-bold leading-none mb-1">
                                            {data.status === 'DELIVERED' ? "Delivered At" : "Last Update"}
                                        </p>
                                        <p className="text-xs font-semibold text-foreground">
                                            {data.deliveredAt
                                                ? new Date(data.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                : new Date(data.date).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.deliveryMan && data.status !== 'DELIVERED' && (
                            <Button variant="outline" className="mt-4 w-full py-2 text-xs rounded-sm border-border text-foreground hover:bg-muted font-semibold gap-1.5 h-9">
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
                                "bg-card border border-border rounded-sm p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden",
                                !data.podUrl && "md:col-span-2"
                            )}>
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <MessageSquareQuote className="w-32 h-32 text-foreground" />
                                </div>
                                <div className="flex items-center gap-3 mb-5 relative z-10">
                                    <div className="p-2.5 bg-muted border border-border rounded-sm text-dispatch-ink shadow-xs">
                                        <MessageSquareQuote className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Delivery Remark</h3>
                                        <p className="text-[11px] font-medium text-muted-foreground">Note from executive</p>
                                    </div>
                                </div>
                                <div className="flex-1 bg-muted border border-border rounded-sm p-5 relative z-10">
                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                                        "{data.deliveryRemark}"
                                    </p>
                                </div>
                            </div>
                        )}
                        {data.podUrl && (
                            <div className={cn(
                                "bg-card border border-border rounded-sm p-5 md:p-6 shadow-sm flex flex-col",
                                !data.deliveryRemark && "md:col-span-2"
                            )}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 bg-success border border-dispatch-ink/30 rounded-sm text-dispatch-ink shadow-xs">
                                        <FileImage className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Proof of Delivery</h3>
                                        <p className="text-[11px] font-medium text-muted-foreground">Captured at location</p>
                                    </div>
                                </div>
                                <div className="relative w-full flex items-center justify-center bg-muted/30 rounded-sm p-4 min-h-[250px] md:min-h-[300px]">
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
                    <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm p-5 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1">
                                <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                                Delivery Expense
                            </span>
                            <p className="text-xl font-extrabold text-foreground leading-none">₹{data.expenseAmount || 0}</p>
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
                <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-muted/50 px-5 py-3 border-b border-border">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            Activity Log
                        </span>
                    </div>
                    <div className="p-5 relative">
                        <div className="absolute left-[33px] top-6 bottom-6 w-0.5 bg-muted" />
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
                    <motion.div variants={itemVariants} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-muted/50 px-5 py-3 border-b border-border flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
                                Order Summary
                            </span>
                            <Badge variant="outline" className="bg-card text-[9px] font-semibold">{data.items.length} Items</Badge>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] font-bold text-muted-foreground uppercase border-b border-border bg-muted/20">
                                        <th className="px-5 py-2.5">Item Name</th>
                                        <th className="px-4 py-2.5 text-center">Batch</th>
                                        <th className="px-4 py-2.5 text-center">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-5 py-3">
                                                <p className="text-xs font-semibold text-foreground">{item.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant="secondary" className="text-[9px] font-mono bg-muted border-none shadow-none">{item.batch}</Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="text-xs font-bold text-foreground">{item.quantity}</span>
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
        <div className="relative z-10 w-7 h-7 rounded-lg flex items-center justify-center border border-border bg-card text-muted-foreground shadow-sm">
            {icon || <GetStageIcon stage={title} />}
        </div>
        <div className="flex-1 pt-0.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-xs font-semibold text-foreground">{title}</h4>
                <span className="text-[9px] font-mono text-muted-foreground">
                    {new Date(date).toLocaleDateString('en-GB')} - {time}
                </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Processed by: <span className="text-foreground font-semibold">{desc}</span></p>
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