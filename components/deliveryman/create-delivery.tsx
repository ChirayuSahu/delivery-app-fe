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

export default function CreateDeliveryButton() {
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const router = useRouter();

    const handleCreateDelivery = async () => {
        setIsCreating(true);
        try {
            const response = await fetch('/api/deliveries/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const json = await response.json();

            if (!response.ok) throw new Error(json.message || 'Failed to create delivery');

            toast.success(json.message || 'Delivery created successfully');
            router.push(`deliveryman/deliveries/${json.data.id}`);
            setOpen(false); // Close dialog on success
        } catch (error) {
            toast.error("Error creating delivery");
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* The Main Trigger Button */}
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <PlusCircle className="w-4 h-4" />
                    New Delivery
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <Truck className="w-6 h-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-center text-xl">Create New Delivery</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure you want to initialize a new delivery session? This will assign a new batch to your profile.
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
                        onClick={handleCreateDelivery} 
                        disabled={isCreating}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Confirm Create"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}