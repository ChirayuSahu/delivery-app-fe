'use client';

import DeliveryPersonnelChart from "@/components/supervisor/pie-chart";
import FailedDeliveriesSection from "@/components/supervisor/failed-deliveries";
import UsersCard from "@/components/supervisor/users";
import InvoiceSearchBar from "@/components/supervisor/invoice-search-bar";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-10 p-6 lg:p-10">
                <InvoiceSearchBar />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
                    <div className="col-span-1">
                        <DeliveryPersonnelChart />
                    </div>
                    <div className="col-span-1">
                        <UsersCard />
                    </div>
                </div>
                <FailedDeliveriesSection />
            </div>
        </div>
    );
}