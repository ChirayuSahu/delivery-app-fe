'use client';

import { CheckCircle2, Wallet } from "lucide-react";
import DeliveryPersonnelChart from "@/components/admin/pie-chart";
import FailedDeliveriesSection from "@/components/admin/failed-deliveries";
import UsersCard from "@/components/admin/users";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CreateUserButton from "@/components/admin/create-user";
import InvoiceSearchBar from "@/components/admin/invoice-search-bar";

export default function DashboardPage() {

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Delivery Dashboard</h1>
                        <p className="text-slate-500 text-sm">Admin</p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <Button variant="outline" className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                            <Link href="/dashboard/admin/deliveries" className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-xs font-bold">All Deliveries</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="hidden md:flex bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100">
                            <Link href="/dashboard/admin/transactions" className="flex gap-2">
                                <span className="text-xs font-bold">Finance</span>
                            </Link>
                        </Button>
                        <CreateUserButton />
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

            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-6 right-6 z-50 md:hidden">
                <Link href="/dashboard/admin/transactions">
                    <Button className="h-10 px-4 rounded-md shadow-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2">
                        <Wallet className="h-4 w-4 text-white" />
                        <span className="text-white font-bold text-xs uppercase tracking-wide">Finance</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}