'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import InvoiceCard from '@/components/supervisor/invoice-card';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CircleX, Loader2, Package, Timer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DeliveryMap from '@/components/supervisor/delivery-map';
import DeliveryStats from '@/components/supervisor/delivery-stats';

export type Invoice = {
    invType: string;
    invNo: string;
    customerName: string;
    status: string;
    location?: string;
    deliveredAt: string;
};

type DeliveryResponse = {
    success: boolean;
    message: string;
    data: {
        id: string;
        deliveryNo: string;
        deliveryManId: string;
        createdAt: Date;
        updatedAt: Date;
        startedAt: string | null;
        endedAt: string | null;
        invoices: Invoice[];
        failedDeliveries: string[];
    };
};

export default function ParticularDeliveryPage() {
    const { deliveryId } = useParams<{ deliveryId: string }>();

    const [isValidDelivery, setIsValidDelivery] = useState<boolean | null>(true);
    const [delivery, setDelivery] = useState<DeliveryResponse['data'] | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    async function fetchDelivery() {
        setLoading(true);
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}?location=true`,
                { credentials: 'include' }
            );

            const json: DeliveryResponse = await res.json();
            if (!res.ok || !json.success) throw new Error(json.message);

            setDelivery(json.data);
            setInvoices(json.data.invoices);
            setIsValidDelivery(true);
        } catch {
            setIsValidDelivery(false);
            toast.error('Failed to load delivery');
        } finally {
            setLoading(false);
        }
    }

    async function removeInvoice(invType: string, invNo: string) {
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}/invoices/${invType}${invNo}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message);

            toast.success('Invoice removed');
            fetchDelivery();
        } catch {
            toast.error('Failed to remove invoice');
        }
    }

    useEffect(() => {
        fetchDelivery();
    }, [deliveryId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                <div className="p-4 bg-green-50 rounded-full mb-4">
                    <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
                </div>
                <h3 className="text-slate-900 font-medium">Loading Delivery...</h3>
                <p className="text-slate-500 text-sm">Please wait while the delivery details are being loaded.</p>
            </div>
        )
    }

    if (!isValidDelivery) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                <div className="p-4 bg-red-50 rounded-full mb-4">
                    <CircleX className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-slate-900 font-medium">Failed to Load Delivery</h3>
                <p className="text-slate-500 text-sm">Delivery not found or an error occurred.</p>
                <Button asChild className="mt-6">
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* 1. TOP HEADER BAR */}
            <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Delivery Details</h1>
                            <p className="text-xs text-slate-500 font-mono uppercase">No: {delivery ? delivery.deliveryNo : 'Loading...'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                        <Package className="w-4 h-4" />
                        <span className="text-sm font-medium">{invoices.length} <span className='hidden sm:inline'>{invoices.length === 1 ? 'Invoice' : 'Invoices'}</span></span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 2. LEFT SIDEBAR: Actions (Fixed width on desktop) */}
                    {delivery && (
                        <aside className="w-full lg:w-87.5 space-y-6">
                            <div>
                                {delivery.endedAt && (

                                    <div className="relative overflow-hidden bg-white border border-emerald-100 rounded-xl shadow-sm">
                                        {/* Success Accent Bar */}
                                        <div className="h-1 bg-emerald-500 w-full" />

                                        <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                                            {/* Icon Section */}
                                            <div className="shrink-0 w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                            </div>

                                            {/* Content Section */}
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900">Shipment Completed</h3>
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                                                        Archived
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-500 leading-relaxed">
                                                    This run was finalized on <span className="font-semibold text-slate-700">{new Date(delivery.endedAt).toLocaleString('en-GB', { minute: '2-digit', hour: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric', hour12: true })}</span>.
                                                    All logs have been synced to the primary database.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Failed Deliveries Sub-Section */}
                                {delivery.failedDeliveries && delivery.failedDeliveries.length > 0 && (
                                    <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-lg">
                                        <div className="flex items-center gap-2 text-red-700 mb-1">
                                            <AlertCircle className="w-4 h-4" />
                                            <p className="text-xs font-bold uppercase tracking-tight">Returns/Failed</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {delivery.failedDeliveries.map((inv: string) => (
                                                <span key={inv} className="px-2 py-1 bg-white border border-red-200 rounded text-red-600 font-mono text-[11px] font-bold">
                                                    {inv}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {delivery?.startedAt && (
                                <div className="relative overflow-hidden bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                    {/* Decorative background icon */}
                                    <Timer className="absolute -right-2 -top-2 w-24 h-24 text-slate-50 opacity-[0.03] -rotate-12" />

                                    <div className="relative flex flex-col gap-4">
                                        <div className="flex flex-col gap-4 bg-white p-4 rounded-xl border border-slate-200">
                                            {/* Header Section */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "p-2 rounded-lg",
                                                        delivery?.endedAt ? "bg-slate-100 text-slate-600" : "bg-green-50 text-green-600"
                                                    )}>
                                                        <Timer className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-sm font-bold text-slate-900 leading-none">
                                                            {delivery?.endedAt ? "Total Duration" : "Time Elapsed"}
                                                        </h2>
                                                        <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                                                            {delivery?.endedAt ? "Delivery Completed" : "Live Tracking"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {!delivery?.endedAt && (
                                                    <div className="flex items-center gap-2 px-2 py-1 bg-green-50 rounded-full">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                                                        </span>
                                                        <span className="text-[10px] font-bold text-green-700 uppercase">Live</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Time Details Section */}
                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                                <div className="relative pl-4 border-l-2 border-blue-500">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Started At</p>
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {delivery?.startedAt ? new Date(delivery.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </p>
                                                </div>

                                                <div className={cn(
                                                    "relative pl-4 border-l-2",
                                                    delivery?.endedAt ? "border-emerald-500" : "border-slate-200"
                                                )}>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                        {delivery?.endedAt ? "Finished At" : "Estimated End"}
                                                    </p>
                                                    <p className={cn(
                                                        "text-sm font-semibold",
                                                        delivery?.endedAt ? "text-slate-700" : "text-slate-400 italic"
                                                    )}>
                                                        {delivery?.endedAt
                                                            ? new Date(delivery.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : 'In Progress...'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-mono font-black text-slate-900">
                                                {delivery?.endedAt
                                                    ? Math.ceil((new Date(delivery.endedAt).getTime() - new Date(delivery.startedAt).getTime()) / 60000)
                                                    : Math.ceil((Date.now() - new Date(delivery.startedAt).getTime()) / 60000)
                                                }
                                            </span>
                                            <span className="text-slate-500 font-bold text-sm uppercase">Minutes</span>
                                        </div>

                                        {/* Progress visualizer */}
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    delivery?.endedAt ? "bg-slate-400 w-full" : "bg-green-600 animate-pulse w-2/3"
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DeliveryStats delivery={delivery} />
                        </aside>
                    )}

                    {/* 3. RIGHT CONTENT: Invoice Grid */}
                    <section className="flex-1 space-y-6">
                        {invoices.length > 0 && delivery?.startedAt && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                                    Delivery Route
                                </h2>
                                <DeliveryMap invoices={invoices} />
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Added Invoices</h2>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
                                </div>
                                <h3 className="text-slate-900 font-medium">Fetching Added Invoices</h3>
                                <p className="text-slate-500 text-sm">Please wait while we load the invoices.</p>
                            </div>
                        ) : invoices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <Package className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-slate-900 font-medium">No invoices assigned</h3>
                                <p className="text-slate-500 text-sm">Start by adding an invoice from the left panel.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                {invoices.map((inv) => (
                                    <div key={`${inv.invType}-${inv.invNo}`} className="transition-transform active:scale-[0.98]">
                                        <InvoiceCard
                                            invoice={inv}
                                            onDelete={() => removeInvoice(inv.invType, inv.invNo)}
                                            showDeleteInvoice={!delivery?.startedAt}
                                            started={!!delivery?.startedAt}
                                            ended={!!delivery?.endedAt}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
