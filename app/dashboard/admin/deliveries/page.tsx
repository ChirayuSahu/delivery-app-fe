'use client'

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import AllDeliveriesCard from '@/components/dashboard/all-deliveries';

import { BackButton } from '@/components/navigation/back-button';
import { HomeButton } from '@/components/navigation/home-button';

const AllDeliveries = () => {

    const router = useRouter();
    

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">

      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
        <AllDeliveriesCard />
      </main>
        </div>
    )
}

export default AllDeliveries