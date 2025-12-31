'use client'

import React from 'react';
import UserInfoCard from '@/components/supervisor/user-card';
import UserDeliveriesCard from '@/components/supervisor/deliveries';
import {
  LayoutDashboard,
  ChevronRight,
  Users,
  Calendar,
  Filter,
  ArrowLeft
} from "lucide-react";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CombinedDeliveryDashboard() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/supervisor/`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">User Details</h1>
            </div>
          </div>
        </div>
      </header>
      <div className='max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6 mx-auto flex-1'>
          <div className="col-span-1 p-6 lg:border-r overflow-y-auto">
            <UserInfoCard userId={userId} />
          </div>
          <div className="col-span-2 overflow-y-auto p-6">
            <UserDeliveriesCard userId={userId} />
          </div>
      </div>
    </div>
  );
}