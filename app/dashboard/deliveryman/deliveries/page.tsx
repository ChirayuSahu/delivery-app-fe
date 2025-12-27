'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, PackagePlus, ArrowRight, Truck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DeliveryPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function createDelivery() {
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery/create`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create delivery');
      }

      const deliveryId = data.data.delivery.id;

      toast.success('New delivery run initialized');
      router.push(`/dashboard/deliveryman/delivery/${deliveryId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <Card className="w-full max-w-md border-slate-200 shadow-sm overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="h-1.5 bg-green-600 w-full" />

        <CardHeader className="text-center pt-8">
          <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">Start New Run</CardTitle>
          <CardDescription className="text-slate-500">
            Create a unique delivery ID to begin scanning and assigning invoices.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8 px-8 flex flex-col gap-4">
          <Button
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold transition-all active:scale-[0.98] flex gap-2"
            onClick={createDelivery}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <PackagePlus className="h-4 w-4" />
                Create Delivery
                <ArrowRight className="h-4 w-4 ml-1 opacity-50" />
              </>
            )}
          </Button>
          <Link href="/dashboard">
            <Button
              className="w-full h-12 font-semibold transition-all active:scale-[0.98] flex gap-2"
              disabled={loading}
            >
              Back
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}