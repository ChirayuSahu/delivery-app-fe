'use client'

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import AllDeliveriesCard from '@/components/supervisor/all-deliveries';

import { BackButton } from '@/components/navigation/back-button';
import { HomeButton } from '@/components/navigation/home-button';

const AllDeliveries = () => {

    const router = useRouter();
    

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <BackButton />
                            <HomeButton />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">All Deliveries</h1>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-6 py-10">
                <AllDeliveriesCard />
            </main>
        </div>
    )
}

export default AllDeliveries