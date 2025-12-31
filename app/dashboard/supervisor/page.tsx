'use client';

import React, { useEffect, useState, useMemo } from "react";
import { Loader2, CheckCircle2, AlertCircle, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import DeliveryPersonnelChart from "@/components/supervisor/pie-chart";
import FailedDeliveriesSection from "@/components/supervisor/failed-deliveries";
import UsersCard from "@/components/supervisor/users";

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
                        <span className="text-sm text-slate-600">Welcome back, Supervisor!</span>
                    </div>
                </div>
            </header>
            <div className="max-w-7xl mx-auto space-y-10 p-6 lg:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-full">
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