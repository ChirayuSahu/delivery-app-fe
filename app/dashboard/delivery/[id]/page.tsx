'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import AddInvoice from './add-invoice';
import InvoiceCard from './invoice-card';
import Link from 'next/link';
import { ArrowLeft, CircleX, Info, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Invoice = {
    invType: string;
    invNo: string;
    customerName: string;
    status: string;
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
        startedAt: Date | null;
        endedAt: Date | null;
        invoices: Invoice[];
    };
};

export default function ParticularDeliveryPage() {
    const { id } = useParams<{ id: string }>();

    const [isValidDelivery, setIsValidDelivery] = useState<boolean | null>(true);
    const [delivery, setDelivery] = useState<DeliveryResponse['data'] | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchDelivery() {
        setLoading(true);
        try {
            const res = await fetch(`/api/delivery/get?id=${id}`,
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
            const res = await fetch(
                `/api/delivery/remove?id=${id}&invId=${invType}${invNo}`,
                { method: 'DELETE', credentials: 'include' }
            );

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
    }, [id]);

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
                        <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Delivery Details</h1>
                            <p className="text-xs text-slate-500 font-mono uppercase">No: {delivery ? delivery.deliveryNo : 'Loading...'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                        <Package className="w-4 h-4" />
                        <span className="text-sm font-medium">{invoices.length} <span className='hidden sm:inline'>{invoices.length === 1 ? 'Invoice' : 'Invoices'}</span></span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* 2. LEFT SIDEBAR: Actions (Fixed width on desktop) */}
                    <aside className="w-full lg:w-87.5 space-y-6">
                        <div className="">
                            <AddInvoice deliveryId={id} onAdded={fetchDelivery} />
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm">
                                Add invoices to this delivery run. Ensure the status is set correctly for tracking.
                            </p>
                        </div>
                    </aside>

                    {/* 3. RIGHT CONTENT: Invoice Grid */}
                    <section className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-800">Added Invoices</h2>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <Loader2 className="w-10 h-10 text-slate-300" />
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
                                            onDelete={removeInvoice}
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
