'use client'

import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import AllDeliveriesCard from '@/components/admin/all-deliveries';

const AllDeliveries = () => {

    const router = useRouter();
    

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-12">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <Home className="w-5 h-5 text-slate-600" />
                            </button>
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