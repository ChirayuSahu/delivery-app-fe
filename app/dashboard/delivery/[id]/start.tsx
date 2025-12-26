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
import { Play, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StartDeliveryProps {
  deliveryId: string;
  onStarted: () => void;
}

export default function StartDeliveryButton({ deliveryId, onStarted }: StartDeliveryProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_URL}/delivery/${deliveryId}/start`, {
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm shadow-emerald-100">
          <Play className="w-4 h-4 fill-current" />
          Start Delivery
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">Start this delivery?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You are about to start <span className="font-mono font-bold text-slate-900">{deliveryId}</span>. 
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
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Start"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}