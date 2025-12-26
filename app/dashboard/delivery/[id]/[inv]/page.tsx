"use client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Receipt, User, Calendar, Truck,
    Clock, IndianRupee, MapPin, ChevronLeft, CircleX, Loader
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import DeliverInvoiceButton from "./deliver"

// Defining the types based on your JSON structure
type InvoiceData = {
    id: string;
    invType: string;
    invNo: string;
    amount: number;
    customerName: string;
    status: string;
    createdAt: string;
    deliveredAt: string | null;
    deliveryRemark: string | null;
    delivery: {
        deliveryNo: string;
        startedAt: string | null;
        endedAt: string | null;
    };
};

const InvoicePage = () => {
    const params = useParams();
    const { id, inv } = params; // delivery ID and invoice ID/No

    const [data, setData] = useState<InvoiceData | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await fetch(`/api/delivery/invoice?id=${inv}`);
                const json = await res.json();
                if (json.success) setData(json.data);
            } catch (error) {
                console.error("Failed to fetch invoice", error);
            } finally {
                setLoading(false);
            }
        };

        if (inv) fetchInvoice();
    }, [inv]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                <div className="p-4 bg-blue-50 rounded-full mb-4">
                    <Loader className="w-10 h-10 text-blue-500" />
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
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Back Link */}
                <Link href={`/dashboard/delivery/${id}`}>
                    <Button
                        variant={"default"}
                        className="inline-flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors mb-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Delivery Run
                    </Button>
                </Link>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white border rounded-2xl shadow-sm text-blue-600">
                            <Receipt className="w-8 h-8" />
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
                        data.status === 'DELIVERED' ? "bg-emerald-500 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-600"
                    )}>
                        {data.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Customer</p>
                                    <p className="font-bold text-slate-900 truncate">{data.customerName}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Total Amount</p>
                                <p className="text-2xl font-black text-slate-900 flex items-center">
                                    <IndianRupee className="w-5 h-5 mr-0.5 text-blue-600" />
                                    {data.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardContent className="space-y-4">
                            <DetailRow icon={<Truck className="w-4 h-4" />} label="Run ID" value={data.delivery.deliveryNo} />
                            <DetailRow icon={<Calendar className="w-4 h-4" />} label="Date" value={new Date(data.createdAt).toLocaleDateString()} />
                            <DetailRow icon={<MapPin className="w-4 h-4" />} label="Location" value="Not Available" />
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <DeliverInvoiceButton delivered={!!data.deliveredAt} invoiceId={String(inv)} />
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

                {/* Timeline Section */}
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
                                time={data.delivery.startedAt ? new Date(data.delivery.startedAt).toLocaleString() : "Awaiting Dispatch"}
                                isDone={!!data.delivery.startedAt}
                            />
                            <TimelineNode
                                icon={<Clock />}
                                title="Customer Delivery"
                                desc="Handed over to customer"
                                time={data.deliveredAt ? new Date(data.deliveredAt).toLocaleString() : "Pending Completion"}
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

// Small helper for Data Rows
const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-500">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        <span className="font-bold text-slate-900">{value}</span>
    </div>
)

// Small helper for Timeline Nodes
const TimelineNode = ({ icon, title, desc, time, isDone, isLast }: any) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={cn(
                "z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                isDone ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-200 text-slate-300"
            )}>
                {icon}
            </div>
            {!isLast && <div className={cn("w-0.5 h-12 -my-1", isDone ? "bg-blue-600" : "bg-slate-100")} />}
        </div>
        <div className="pb-6">
            <p className={cn("text-sm font-bold leading-none", isDone ? "text-slate-900" : "text-slate-400")}>{title}</p>
            <p className="text-[11px] text-slate-500 mt-1">{desc}</p>
            <p className="text-[10px] font-mono font-bold text-blue-500 mt-2 uppercase tracking-tighter">{time}</p>
        </div>
    </div>
)

export default InvoicePage