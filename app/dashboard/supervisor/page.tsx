'use client';

import React, { useEffect, useState, useMemo } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DeliveryPersonnelChart } from "@/components/supervisor/pie-chart";
import { FailedDeliveriesSection } from "@/components/supervisor/failed-deliveries";

export default function DashboardPage() {

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b px-8 py-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Deliveries</h1>
                        <p className="text-slate-500 text-sm">Manage and track your pharmaceutical shipments</p>
                    </div>
                    <div className="flex items-center gap-3">

                    </div>
                </div>
            </header>
            <div className="max-w-7xl mx-auto space-y-10 p-6 lg:p-10">
                <DeliveryPersonnelChart />

                <FailedDeliveriesSection />
            </div>
        </div>
    );
}