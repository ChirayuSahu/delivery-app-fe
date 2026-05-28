'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import InvoiceCard from '@/components/supervisor/invoice-card';
import FailedInvoiceCard from '@/components/supervisor/failed-invoice-card';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CircleX, Loader2, Package, Timer, CheckCircle2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import DeliveryMap from '@/components/supervisor/delivery-map';
import DeliveryStats from '@/components/supervisor/delivery-stats';
import DeliveryExpense from '@/components/admin/delivery-expense';

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
        deliveryMan: string;
        createdAt: Date;
        updatedAt: Date;
        startedAt: string | null;
        endedAt: string | null;
        invoices: Invoice[];
        failedDeliveries: string[];
        failedInvoices: Invoice[];
    };
};

export default function ParticularDeliveryPage() {
    const { deliveryId } = useParams<{ deliveryId: string }>();

    const [isValidDelivery, setIsValidDelivery] = useState<boolean | null>(true);
    const [delivery, setDelivery] = useState<DeliveryResponse['data'] | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [failedInvoices, setFailedInvoices] = useState<Invoice[]>([]);
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
            setFailedInvoices(json.data.failedInvoices);
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
            <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm max-w-2xl mx-auto mt-20">
                <Loader2 className="w-6 h-6 text-slate-400 animate-spin mb-2" />
                <h3 className="text-slate-900 font-semibold text-sm">Loading Delivery...</h3>
                <p className="text-slate-400 text-xs mt-1">Fetching running data...</p>
            </div>
        )
    }

    if (!isValidDelivery) {
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100 shadow-sm max-w-2xl mx-auto mt-20 p-6 text-center">
                <div className="p-3 bg-red-50 rounded-xl mb-4 text-red-500 border border-red-100">
                    <CircleX className="w-6 h-6" />
                </div>
                <h3 className="text-slate-900 font-semibold text-sm">Failed to Load Delivery</h3>
                <p className="text-slate-400 text-xs mt-1">Delivery details could not be found.</p>
                <Button asChild variant="outline" className="mt-6 text-xs h-9 rounded-lg">
                    <Link href="/dashboard">Return Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            <main className="max-w-7xl mx-auto p-6 lg:p-10">
                {/* Quiet inline nav */}
                <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
                            Delivery #{delivery ? delivery.deliveryNo : 'Loading...'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200/25 text-xs font-semibold">
                        <Package className="w-3.5 h-3.5" />
                        <span>{invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Actions & Info */}
                    {delivery && (
                        <aside className="lg:col-span-4 space-y-6">
                            
                            {/* Assigned Man */}
                            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                    Assigned Delivery Man
                                </span>
                                <h3 className="text-sm font-semibold text-slate-900">
                                    {delivery.deliveryMan || "Unassigned"}
                                </h3>
                            </div>

                            {/* Completed Status */}
                            {delivery.endedAt && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm flex gap-3">
                                    <div className="shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center border border-green-200/40 mt-0.5">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-xs font-semibold text-slate-900">Shipment Completed</h3>
                                            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[9px] font-semibold uppercase">
                                                Archived
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-normal">
                                            This run was finalized on {new Date(delivery.endedAt).toLocaleString('en-GB', { minute: '2-digit', hour: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Returns Box */}
                            {delivery.failedDeliveries && delivery.failedDeliveries.length > 0 && (
                                <div className="p-4 bg-red-50/30 border border-red-200/25 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-1.5 text-red-700 mb-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Returns & Failed</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {delivery.failedDeliveries.map((inv: string) => (
                                            <span key={inv} className="px-1.5 py-0.5 bg-white border border-red-200/30 rounded text-red-600 font-mono text-[10px] font-semibold">
                                                {inv}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Live/Completed Timer */}
                            {delivery.startedAt && (
                                <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "p-1.5 rounded-md border",
                                                delivery.endedAt ? "bg-slate-50 border-slate-200/40 text-slate-500" : "bg-green-50 border-green-200/40 text-green-600"
                                            )}>
                                                <Timer className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-semibold text-slate-900 leading-none">
                                                    {delivery.endedAt ? "Duration" : "Time Elapsed"}
                                                </h3>
                                                <p className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                                                    {delivery.endedAt ? "Completed" : "In Progress"}
                                                </p>
                                            </div>
                                        </div>

                                        {!delivery.endedAt && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded text-[9px] font-semibold text-green-700 border border-green-200/40">
                                                <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
                                                Live
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                        <div className="pl-3 border-l border-slate-100">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">Started At</span>
                                            <p className="text-xs font-semibold text-slate-700 mt-0.5">
                                                {new Date(delivery.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="pl-3 border-l border-slate-100">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                {delivery.endedAt ? "Finished" : "Status"}
                                            </span>
                                            <p className={cn(
                                                "text-xs font-semibold mt-0.5",
                                                delivery.endedAt ? "text-slate-700" : "text-slate-400 italic"
                                            )}>
                                                {delivery.endedAt
                                                    ? new Date(delivery.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : 'In Progress'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Big minute display */}
                                    <div className="flex items-baseline gap-1.5 pt-2">
                                        <span className="text-3xl font-extrabold text-slate-900 leading-none">
                                            {delivery.endedAt
                                                ? Math.ceil((new Date(delivery.endedAt).getTime() - new Date(delivery.startedAt).getTime()) / 60000)
                                                : Math.ceil((Date.now() - new Date(delivery.startedAt).getTime()) / 60000)
                                            }
                                        </span>
                                        <span className="text-slate-400 font-semibold text-xs uppercase tracking-wider">Minutes</span>
                                    </div>

                                    {/* Progress line */}
                                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                delivery.endedAt ? "bg-slate-400 w-full" : "bg-green-600 animate-pulse w-2/3"
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            <DeliveryStats delivery={delivery} />
                            
                            {/* Delivery Expense Manager */}
                            <DeliveryExpense delivery={delivery} onExpenseUpdated={fetchDelivery} />

                        </aside>
                    )}

                    {/* RIGHT COLUMN: Route & Invoices */}
                    <section className="lg:col-span-8 space-y-6">
                        {invoices.length > 0 && delivery?.startedAt && (
                            <div className="space-y-3">
                                <h2 className="text-xs font-semibold text-slate-900">
                                    Delivery Route
                                </h2>
                                <DeliveryMap invoices={invoices} />
                            </div>
                        )}

                        <div className="space-y-3">
                            <h2 className="text-xs font-semibold text-slate-900">Added Invoices</h2>
                            
                            {invoices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-xl text-center shadow-sm">
                                    <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-slate-900 font-semibold text-xs">
                                        No Invoices Assigned
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Start by assigning invoices.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {invoices.slice().reverse().map((inv) => (
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
                                    {failedInvoices.slice().map((inv) => (
                                        <div key={`${inv.invType}-${inv.invNo}`} className="transition-transform active:scale-[0.98]">
                                            <FailedInvoiceCard
                                                invoice={inv}
                                                showDeleteInvoice={!delivery?.startedAt}
                                                started={!!delivery?.startedAt}
                                                ended={!!delivery?.endedAt}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
