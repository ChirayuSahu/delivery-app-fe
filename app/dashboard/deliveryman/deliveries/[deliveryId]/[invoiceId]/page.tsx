"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Receipt, User, Calendar, Truck, ArrowLeft, ExternalLink,
    Clock, IndianRupee, MapPin, CircleX, Loader2, Box, ShoppingBag, Snowflake, Archive,
    MessageSquareQuote, FileImage, Phone, CheckCircle2, ClipboardCheck, Search, Printer
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion, Variants } from "framer-motion"
import DeliverInvoiceButton from "@/components/deliveryman/deliver"
import Image from "next/image"

type InvoiceData = {
    id: string;
    invType: string;
    invNo: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerEmail?: string;
    status: string;
    createdAt: string;
    deliveredAt: string | null;
    deliveryRemark: string | null;
    location: string | null;
    delivery: {
        deliveryNo: string;
        startedAt: string | null;
        endedAt: string | null;
    };
    boxes: number;
    bags: number;
    icePacks: number;
    cases: number;
    podUrl: string | null;
};

type Packaging = {
    boxes: number;
    bags: number;
    icePacks: number;
    cases: number;
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
    const { deliveryId, invoiceId } = params;

    const [data, setData] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}/invoices/${invoiceId}`);
            const json = await res.json();

            if (!res.ok) throw new Error(json.message || 'Failed to fetch invoice');

            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch invoice", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (invoiceId) fetchInvoice();
    }, [invoiceId]);

    if (loading) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-slate-100 shadow-sm max-w-2xl mx-auto mt-20">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin mb-2" />
                <p className="text-slate-400 text-xs font-medium">Loading Invoice Details...</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-white rounded-sm border border-slate-100 shadow-sm max-w-2xl mx-auto mt-20 p-6 text-center">
                <CircleX className="w-6 h-6 text-red-500 mb-4" />
                <h1 className="text-sm font-semibold text-slate-900">Invoice Not Found</h1>
                <Button onClick={() => router.back()} className="mt-4 text-xs h-9 rounded-sm" variant="outline">Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* 1. TOP HEADER BAR (hidden on mobile, shown on desktop) */}
            <header className="hidden lg:block sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/deliveryman/deliveries/${deliveryId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Invoice Details</h1>
                            <p className="text-xs text-slate-500 font-mono uppercase mt-0.5">{data.invType}/{data.invNo}</p>
                        </div>
                    </div>
                </div>
            </header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto space-y-6 p-4 md:p-8"
            >
                {/* Quiet inline nav / Mobile Back Link */}
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <Link href={`/dashboard/deliveryman/deliveries/${deliveryId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-850 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Run
                        </Link>
                    </div>
                    <Badge className={cn(
                        "rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-none border",
                        data.status === 'DELIVERED' ? "bg-green-50 text-green-700 border-green-200/40" : "bg-amber-50 text-amber-700 border-amber-200/40"
                    )}>
                        {data.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* Hero Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white border border-slate-100 rounded-sm shadow-sm">
                            <Image alt='Logo' src='https://rajeshpharma.com/img/rp.svg' className='w-8 h-8 object-contain' width={32} height={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{data.invType}/{data.invNo}</h1>
                            <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">{new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-4 rounded-sm shadow-sm flex items-center gap-3 w-full md:w-auto">
                        <div className="bg-slate-50 p-2 rounded-sm border border-slate-100">
                            <IndianRupee className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">Invoice Amount</p>
                            <p className="text-xl font-extrabold text-slate-900 leading-none">₹{data.amount.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info Card */}
                    <motion.div variants={itemVariants} className="relative md:col-span-2 bg-white border border-slate-100 rounded-sm p-5 shadow-sm space-y-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Customer Information</span>
                        <div className="space-y-3">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">{data.customerName}</h3>
                                {data.customerEmail && <p className="text-xs text-slate-400 font-medium">{data.customerEmail}</p>}
                            </div>
                            <div className="pt-2 border-t border-slate-50">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Address</span>
                                <h3 className="text-xs font-semibold text-slate-700 leading-normal">{data.customerAddress}</h3>
                            </div>
                            {data.customerPhone && (
                                <div className="pt-2 border-t border-slate-50">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Phone</span>
                                    <h3 className="text-xs font-semibold text-slate-700 leading-normal">{data.customerPhone}</h3>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Delivery Status Card */}
                    <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-sm p-5 shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Delivery Summary</span>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
                                        <Truck className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-slate-400 uppercase font-bold leading-none mb-1">Run ID</p>
                                        <p className="text-xs font-semibold text-slate-900">{data.delivery.deliveryNo}</p>
                                    </div>
                                </div>
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
                                                ? new Date(data.deliveredAt).toLocaleString('en-GB')
                                                : new Date(data.createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                </div>
                                <DetailRow icon={<MapPin className="w-4 h-4" />} label="Coordinates" value={data.location} isLocation />
                            </div>
                        </div>

                        {data.customerPhone && data.status !== 'DELIVERED' && (
                            <a href={`tel:${data.customerPhone}`} className="block w-full">
                                <Button variant="outline" className="w-full py-2 text-xs rounded-sm border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold gap-1.5 h-9 cursor-pointer">
                                    <Phone className="w-3.5 h-3.5" />
                                    Call Customer
                                </Button>
                            </a>
                        )}
                    </motion.div>
                </div>

                {/* Packaging Section */}
                <motion.div variants={itemVariants}>
                    <PackagingSection packaging={data} />
                </motion.div>

                {/* Actions Panel */}
                <motion.div variants={itemVariants} className="pt-2">
                    <DeliverInvoiceButton onSuccess={fetchInvoice} delivered={!!data.deliveredAt} invoiceId={String(invoiceId)} deliveryId={String(deliveryId)} />
                </motion.div>

                {/* Remarks & POD */}
                {(data.deliveryRemark || data.podUrl) && (
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.deliveryRemark && (
                            <div className={cn(
                                "bg-white border border-slate-100 rounded-sm p-5 md:p-6 shadow-sm flex flex-col relative overflow-hidden",
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
                                        <p className="text-[11px] font-medium text-slate-500">Note from run completion</p>
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
                                "bg-white border border-slate-100 rounded-sm p-5 md:p-6 shadow-sm flex flex-col",
                                !data.deliveryRemark && "md:col-span-2"
                            )}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-sm text-emerald-600 shadow-xs">
                                        <FileImage className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Proof of Delivery</h3>
                                        <p className="text-[11px] font-medium text-slate-500">Captured at handover</p>
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

                {/* Shipment Timeline / Activity Log */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
                    <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            Shipment Timeline
                        </span>
                    </div>
                    <div className="p-5 relative">
                        <div className="absolute left-[33px] top-6 bottom-6 w-0.5 bg-slate-100" />
                        <div className="space-y-6">
                            <TimelineStep
                                title="Out for Delivery"
                                date={data.delivery.startedAt}
                                desc="Shipment departed local facility"
                                isDone={!!data.delivery.startedAt}
                            />
                            <TimelineStep
                                title="Delivered Successfully"
                                date={data.deliveredAt}
                                desc="Handed over to customer"
                                isDone={!!data.deliveredAt}
                                isLast
                                icon={<CheckCircle2 className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

interface DetailRowProps {
    icon: React.ReactNode;
    label: string;
    value: string | null | undefined;
    isLocation?: boolean;
}

const DetailRow = ({ icon, label, value, isLocation }: DetailRowProps) => {
    const handleLocationClick = () => {
        if (!value) return;
        try {
            const coords = typeof value === 'string' ? JSON.parse(value) : value;
            if (coords.lat && coords.lng) {
                const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
                window.open(url, '_blank');
            }
        } catch (e) {
            console.error("Invalid location format", e);
        }
    };

    const hasValue = value && value !== "null";

    return (
        <div className="flex items-center justify-between text-sm py-1">
            <div className="flex items-center gap-2 text-slate-500">
                {icon}
                <span className="font-medium">{label}</span>
            </div>

            {isLocation && hasValue ? (
                <button
                    onClick={handleLocationClick}
                    className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-bold transition-colors group cursor-pointer"
                >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3 transition-transform" />
                </button>
            ) : (
                <span className="font-bold text-slate-900">
                    {hasValue ? "Available" : "Not Available"}
                </span>
            )}
        </div>
    );
};

const PackagingSection = ({ packaging }: { packaging: Packaging | null }) => {
    if (!packaging) return null;

    const items = [
        { label: "Boxes", value: packaging.boxes, icon: <Box className="w-4 h-4" /> },
        { label: "Bags", value: packaging.bags, icon: <ShoppingBag className="w-4 h-4" /> },
        { label: "Ice Packs", value: packaging.icePacks, icon: <Snowflake className="w-4 h-4" /> },
        { label: "Cases", value: packaging.cases, icon: <Archive className="w-4 h-4" /> },
    ];

    return (
        <Card className="border-slate-100 rounded-sm shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-5 py-3">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Packaging Materials
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
                    {items.map((item) => (
                        <div
                            key={item.label}
                            className={cn(
                                "flex flex-col items-center justify-center py-4 px-2 transition-colors",
                                item.value > 0 ? "bg-green-50/30" : "opacity-40"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-sm mb-2",
                                item.value > 0 ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                            )}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {item.label}
                            </span>
                            <span className={cn(
                                "text-lg font-black",
                                item.value > 0 ? "text-slate-900" : "text-slate-400"
                            )}>
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const TimelineStep = ({ title, date, desc, icon, isDone, isLast }: any) => (
    <div className="relative flex gap-4 group">
        <div className={cn(
            "relative z-10 w-7 h-7 rounded-sm flex items-center justify-center border transition-all duration-300 bg-white text-slate-500 shadow-sm",
            isDone ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-100" : "bg-white border-slate-200 text-slate-300"
        )}>
            {icon || <GetStageIcon stage={title} />}
        </div>
        <div className="flex-1 pt-0.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className={cn("text-xs font-bold", isDone ? "text-slate-900" : "text-slate-400")}>{title}</h4>
                {date && (
                    <span className="text-[9px] font-mono text-slate-400">
                        {new Date(date).toLocaleString('en-GB')}
                    </span>
                )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{desc}</p>
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