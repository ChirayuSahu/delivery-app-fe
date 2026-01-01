'use client';

import { CheckCircle2 } from "lucide-react";
import DeliveryPersonnelChart from "@/components/supervisor/pie-chart";
import FailedDeliveriesSection from "@/components/supervisor/failed-deliveries";
import UsersCard from "@/components/supervisor/users";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import InvoiceSearchBar from "@/components/supervisor/invoice-search-bar";

export default function DashboardPage() {

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Delivery Dashboard</h1>
                        <p className="text-slate-500 text-sm">Supervisor</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                            <Link href="/dashboard/supervisor/deliveries" className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs font-bold">All Deliveries</span>
                            </Link>
                        </Button>
                        {/* <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                            <User className="h-4 w-4 mr-2" />
                            <span className="text-xs font-bold">Active Personnel</span>
                        </Button> */}
                    </div>
                </div>
            </header>
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