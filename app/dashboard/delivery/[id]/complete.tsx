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
import { PackageCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CompleteDeliveryProps {
  deliveryId: string;
  onStarted: () => void;
  disabled?: boolean;
}

export default function CompleteDeliveryButton({ deliveryId, onStarted, disabled }: CompleteDeliveryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch(`/api/delivery/complete?id=${deliveryId}`, {
        method: 'GET',
        credentials: 'include',
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || 'Failed to complete delivery');

      toast.success(json.message || 'Delivery completed successfully');
      setOpen(false);
      onStarted(); // Refresh parent state to hide "Add Invoice" controls
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="text-white gap-2 shadow-sm shadow-blue-100 w-full">
          <PackageCheck className="w-4 h-4" />
          Complete Delivery
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">Complete this delivery?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You are about to end this delivery.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)} 
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStart} 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}