'use client';

import { useState } from "react";
import DeliveryPersonnelChart from "@/components/admin/pie-chart";
import FailedDeliveriesSection from "@/components/admin/failed-deliveries";
import UsersCard from "@/components/admin/users";
import InvoiceSearchBar from "@/components/admin/invoice-search-bar";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const [loadedComponents, setLoadedComponents] = useState({
        chart: false,
        users: false,
        failed: false
    });

    const isFullyLoaded = loadedComponents.chart && loadedComponents.users && loadedComponents.failed;

    return (
        <div className="min-h-screen bg-gray-50 relative">
            {!isFullyLoaded && (
                <div className="absolute inset-0 z-50 flex flex-col items-center pt-32 bg-gray-50/80 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
                    <p className="text-sm font-semibold text-slate-600 animate-pulse">Loading dashboard modules...</p>
                </div>
            )}
            
            <div className={`max-w-7xl mx-auto space-y-10 p-6 lg:p-10 transition-opacity duration-500 ${isFullyLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <InvoiceSearchBar />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
                    <div className="col-span-1">
                        <DeliveryPersonnelChart onInitialLoad={() => setLoadedComponents(p => ({ ...p, chart: true }))} />
                    </div>
                    <div className="col-span-1">
                        <UsersCard onInitialLoad={() => setLoadedComponents(p => ({ ...p, users: true }))} />
                    </div>
                </div>
                <FailedDeliveriesSection onInitialLoad={() => setLoadedComponents(p => ({ ...p, failed: true }))} />
            </div>
        </div>
    );
}