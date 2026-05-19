'use client'

import React from 'react';
import UserInfoCard from '@/components/admin/user-card';
import UserDeliveriesCard from '@/components/admin/deliveries';
import { useParams } from 'next/navigation';

export default function CombinedDeliveryDashboard() {
  const params = useParams();
  const userId = params.userId as string;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="max-w-7xl mx-auto space-y-6 p-6 md:p-8">
        {/* Quiet inline nav */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
              User Profile Details
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
          <div className="col-span-1">
            <UserInfoCard userId={userId} />
          </div>
          <div className="lg:col-span-2">
            <UserDeliveriesCard userId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}