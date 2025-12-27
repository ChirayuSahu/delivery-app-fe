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
import { PackagePlus, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StartDeliveryProps {
  deliveryId: string;
  onStarted: () => void;
  disabled?: boolean;
}

export default function StartDeliveryButton({ deliveryId, onStarted, disabled }: StartDeliveryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to start delivery');

      toast.success('Delivery started successfully');
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
        <Button disabled={disabled} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm shadow-blue-100 w-full">
          <PackagePlus className="w-4 h-4" />
          Start Delivery
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">Start this delivery?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You are about to start this delivery. <br/>
            Once started, <span className="text-red-600 font-semibold">you cannot add or remove any more invoices</span> from this run.
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Start"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}