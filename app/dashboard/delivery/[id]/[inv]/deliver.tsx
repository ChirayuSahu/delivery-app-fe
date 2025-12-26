'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, MessageSquare, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface DeliverInvoiceProps {
    invoiceId: string;
    onSuccess?: () => void;
    delivered?: boolean;
}

export default function DeliverInvoiceButton({ invoiceId, onSuccess, delivered }: DeliverInvoiceProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remark, setRemark] = useState('');

    // Helper to get coordinates
    const getCoordinates = (): Promise<{ lat: number; lng: number } | null> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser");
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Location error:", error);
                    toast.error("Could not get location. Ensure GPS is on.");
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    async function handleDeliver() {
        setLoading(true);
        
        // 1. Fetch location first
        const location = await getCoordinates();
        
        if (!location) {
            setLoading(false);
            return; // Stop if location is mandatory and failed
        }

        try {
            const res = await fetch(`/api/delivery/invoice/deliver`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: invoiceId,
                    remarks: remark.trim(),
                    location: location
                }),
                credentials: 'include',
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.message || 'Failed to deliver');

            toast.success(json.message || 'Invoice marked as delivered');
            setOpen(false);
            setRemark(''); // Reset remark
            if (onSuccess) onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={delivered} size={"lg"} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shadow-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    { delivered ? "Delivered" : "Mark as Delivered" }
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Confirm Delivery</DialogTitle>
                    <DialogDescription className="text-center">
                        Location will be captured automatically to complete the delivery for <strong>{invoiceId}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                        <MessageSquare className="w-3 h-3" />
                        Delivery Remark
                    </div>
                    <Textarea
                        placeholder="Recipient name, shop closed, or any other notes..."
                        className="resize-none border-slate-200 focus:ring-emerald-500 min-h-25"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                    />
                    <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg">
                        <MapPin className="w-3 h-3" />
                        GPS coordinates will be attached to this remark
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeliver}
                        disabled={loading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Capturing GPS...
                            </span>
                        ) : "Complete Delivery"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}