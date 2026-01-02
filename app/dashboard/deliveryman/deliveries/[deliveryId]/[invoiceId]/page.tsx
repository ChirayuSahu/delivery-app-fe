"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Receipt, User, Calendar, Truck, ArrowLeft, ExternalLink,
    Clock, IndianRupee, MapPin, CircleX, Loader2, Box, ShoppingBag, Snowflake, Archive
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
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
};

type Packaging = {
    boxes: number;
    bags: number;
    icePacks: number;
    cases: number;
};

const InvoicePage = () => {
    const params = useParams();
    const { deliveryId, invoiceId } = params;

    const [data, setData] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [packaging, setPackaging] = useState<{
        boxes: number;
        bags: number;
        icePacks: number;
        cases: number;
    } | null>(null);

    const router = useRouter();

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}/invoices/${invoiceId}`);
            const json = await res.json();

            if (!res.ok) throw new Error(json.message || 'Failed to fetch invoice');

            if (json.success) {
                setData(json.data);
                setPackaging({
                    boxes: json.data.boxes,
                    bags: json.data.bags,
                    icePacks: json.data.icePacks,
                    cases: json.data.cases,
                });
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
            <div className="min-h-screen flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                <div className="p-4 bg-green-50 rounded-full mb-4">
                    <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                </div>
                <h3 className="text-slate-900 font-medium">Loading Invoice...</h3>
                <p className="text-slate-500 text-sm">Please wait while the invoice details are being loaded.</p>
                <Button onClick={() => router.back()} className="mt-6">
                    Back
                </Button>
            </div>
        )
    }
    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                <div className="p-4 bg-red-50 rounded-full mb-4">
                    <CircleX className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-slate-900 font-medium">Failed to Load Invoice</h3>
                <p className="text-slate-500 text-sm">Invoice not found or an error occurred.</p>
                <Button onClick={() => router.back()} className="mt-6">
                    Back
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard/deliveryman/deliveries/${deliveryId}`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Invoice Details</h1>
                            <p className="text-xs text-slate-500 font-mono uppercase">{data.invType}/{data.invNo}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border rounded-2xl shadow-sm text-green-600">
                            <Image alt={`${process.env.NEXT_PUBLIC_COMPANY_NAME} Logo`} src='https://rajeshpharma.com/img/rp.svg' className='w-8 h-8' width={100} height={100} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-tight">
                                {data.invType}/{data.invNo}
                            </h1>
                            <p className="text-sm font-medium text-slate-500 italic">Invoice Tracking Record</p>
                        </div>
                    </div>
                    <Badge className={cn(
                        "w-fit px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
                        data.status === 'DELIVERED' ? "bg-emerald-500 hover:bg-emerald-500" : "bg-green-600 hover:bg-green-600"
                    )}>
                        {data.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 overflow-hidden space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Customer</p>
                                        <p className="font-bold text-slate-900">{data.customerName}</p>
                                    </div>
                                    {data.customerPhone && (
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Phone</p>
                                            <p className="font-bold text-slate-900 truncate">{data.customerPhone}</p>
                                        </div>
                                    )}
                                    {data.customerAddress && (
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Address</p>
                                            <p className="text-xs font-bold text-slate-900">{data.customerAddress}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Total Amount</p>
                                <p className="text-2xl font-black text-slate-900 flex items-center">
                                    <IndianRupee className="w-5 h-5 mr-0.5 text-green-600" />
                                    {data.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="space-y-4">
                            <DetailRow icon={<Truck className="w-4 h-4" />} label="Run ID" value={data.delivery.deliveryNo} />
                            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date" value={new Date(data.createdAt).toLocaleDateString('en-GB')} />
                            <DetailRow icon={<MapPin className="w-4 h-4" />} label="Delivery Location" value={data.location} isLocation />
                        </CardContent>
                    </Card>
                </div>


                <PackagingSection packaging={packaging} />

                <div>
                    <DeliverInvoiceButton onSuccess={fetchInvoice} delivered={!!data.deliveredAt} invoiceId={String(invoiceId)} deliveryId={String(deliveryId)} />
                </div>

                <div>
                    {data.deliveryRemark && (
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b">
                                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Delivery Remarks</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <p className="text-sm text-slate-700">{data.deliveryRemark}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b">
                        <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shipment Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="relative">
                            <TimelineNode
                                icon={<Truck />}
                                title="Out for Delivery"
                                desc="Shipment left the facility"
                                time={data.delivery.startedAt ? new Date(data.delivery.startedAt).toLocaleString('en-GB') : "Awaiting Dispatch"}
                                isDone={!!data.delivery.startedAt}
                            />
                            <TimelineNode
                                icon={<Clock />}
                                title="Customer Delivery"
                                desc="Handed over to customer"
                                time={data.deliveredAt ? new Date(data.deliveredAt).toLocaleString('en-GB') : "Pending Completion"}
                                isDone={!!data.deliveredAt}
                                isLast
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
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
                    className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-bold transition-colors group"
                >
                    <span>View on Map</span>
                    <ExternalLink className="w-3 h-3 transition-transform" />
                </button>
            ) : (
                <span className="font-bold text-slate-900">
                    {hasValue ? value : "Not Available"}
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
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b px-4">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">
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
                                "p-2 rounded-full mb-2",
                                item.value > 0 ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                            )}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
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

const TimelineNode = ({ icon, title, desc, time, isDone, isLast }: any) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={cn(
                "z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                isDone ? "bg-green-600 border-green-600 text-white shadow-lg shadow-green-100" : "bg-white border-slate-200 text-slate-300"
            )}>
                {icon}
            </div>
            {!isLast && <div className={cn("w-0.5 h-12 -my-1", isDone ? "bg-green-600" : "bg-slate-100")} />}
        </div>
        <div className="pb-6">
            <p className={cn("text-sm font-bold leading-none", isDone ? "text-slate-900" : "text-slate-400")}>{title}</p>
            <p className="text-[11px] text-slate-500 mt-1">{desc}</p>
            <p className="text-[10px] font-mono font-bold text-green-500 mt-2 uppercase tracking-tighter">{time}</p>
        </div>
    </div>
)

export default InvoicePage