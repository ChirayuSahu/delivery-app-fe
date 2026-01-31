'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Loader } from 'lucide-react';

export default function AddSlip({ deliveryId, onAdded }: { deliveryId: string; onAdded: () => void }) {
    const [slipNo, setSlipNo] = useState('');
    const [loading, setLoading] = useState(false);

    async function submitSlip(slipNo: string) {
        try {
            setLoading(true);
            const res = await fetch(`/api/deliveries/${deliveryId}/slip/${slipNo}`, {
                method: 'POST', credentials: 'include'
            });

            const json = await res.json();

            if (!res.ok) throw new Error(json.message || 'Failed to add slip');
            toast.success(json.message || 'Slip added successfully');
            setSlipNo('');
            onAdded();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-green-600" /> Add Tag
            </h3>

            <div className="flex gap-2 w-full items-center justify-center">
                <Input
                    placeholder="Enter Tag No."
                    value={slipNo}
                    onChange={(e) => setSlipNo(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && submitSlip(slipNo)}
                />

                <Button className="bg-green-600" disabled={slipNo.trim().length == 0 || !slipNo.trim().match(/^\d+$/) || loading} onClick={() => submitSlip(slipNo)}>
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Add Tag'}
                </Button>
            </div>
        </div>
    );
}