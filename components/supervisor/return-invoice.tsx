'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function ReturnInvoice({ invoiceId }: { invoiceId: string }) {
    const [open, setOpen] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

    const router = useRouter();

    const handleReturnInvoice = async () => {
        setIsReturning(true);
        try {
            const response = await fetch(`/api/orders/invoice/${invoiceId}/return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const json = await response.json();

            if (!response.ok) throw new Error(json.message || 'Failed to return invoice');

            toast.success(json.message || 'Invoice returned successfully');
            router.push(`/dashboard/deliveryman/deliveries/${json.data.id}`);
        } catch (error) {
            toast.error("Error returning invoice");
            console.error(error);
        } finally {
            setIsReturning(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* The Main Trigger Button */}
            <DialogTrigger asChild>
                <Button className="gap-2 text-red-700 bg-red-50 border border-red-100 hover:bg-red-50 w-full cursor-pointer rounded-xl">
                    Return Invoice
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-6 h-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Return Invoice</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to return this invoice with invoice ID <span className='font-bold'>{invoiceId}</span>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-row gap-3 sm:justify-center mt-4">
                    <Button 
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleReturnInvoice} 
                        disabled={isReturning}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        {isReturning ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Returning...
                            </>
                        ) : (
                            "Confirm Return"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}