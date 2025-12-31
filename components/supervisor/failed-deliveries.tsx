"use client"

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";

interface FailedDelivery {
    id: string;
    invType: string;
    invNo: string;
    customerName: string;
    updatedAt: string;
}

const dummyFailedDeliveries: FailedDelivery[] = Array.from({ length: 20 }, (_, i) => ({
    id: String(i + 1),
    invType: 'RX',
    invNo: String(1001 + i),
    customerName: `John Doe ${i + 1}`,
    updatedAt: '2024-06-20T10:15:00Z',
}));


function FailedDeliveriesSection() {

    const [deliveries, setDeliveries] = useState<FailedDelivery[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const pathname = usePathname();

    async function fetchFailedDeliveries() {
        try {
            const response = await fetch('/api/deliveries/failed');
            const data = await response.json();
            setDeliveries(data.data || []);
        } catch (error) {
            console.error("Error fetching failed deliveries:", error);
        }
    }

    useEffect(() => {
        fetchFailedDeliveries();
    }, []);


    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Failed Deliveries</h2>
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                    {deliveries.length} Issues
                </span>
            </div>

            {deliveries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deliveries.map((delivery) => (
                        <Link href={`${pathname}/invoice/${delivery.invType}${delivery.invNo}`} key={delivery.id}>
                            <div key={delivery.id} className="flex items-start gap-4 p-4 bg-white border-l-4 border-l-red-500 border border-slate-200 rounded-xl shadow-sm">
                                <div className="p-2 bg-red-50 rounded-full">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="font-mono font-bold text-slate-900">{delivery.invType}{delivery.invNo}</p>
                                        <span className="text-[10px] font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                                            {delivery.customerName}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tighter">
                                        Attempted: {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white border border-dashed rounded-xl">
                    <CheckCircle2 className="h-12 w-12 text-green-200 mx-auto mb-3" />
                    <p className="text-slate-500">All deliveries are on track today.</p>
                </div>
            )}
        </section>
    );
}

export default FailedDeliveriesSection;