'use client';

import DeliveryPersonnelChart from "@/components/admin/pie-chart";
import FailedDeliveriesSection from "@/components/admin/failed-deliveries";
import UsersCard from "@/components/admin/users";
import InvoiceSearchBar from "@/components/admin/invoice-search-bar";

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