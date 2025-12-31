'use client';

import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScanLine, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AddInvoice({ deliveryId, onAdded }: { deliveryId: string; onAdded: () => void }) {
  const [invoice, setInvoice] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  async function submitInvoice(invoiceId: string) {
    if (!invoiceId.trim()) return toast.error('Enter an invoice number');
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/invoices/${invoiceId}`, { 
        method: 'POST', credentials: 'include' 
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || 'Failed to add invoice');
      toast.success(json.message || 'Invoice added successfully');
      setInvoice('');
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5Qrcode('scanner-area');
    scanner.start({ facingMode: 'environment' }, { fps: 12, qrbox: { width: 300, height: 120 }, disableFlip: true }, 
      (text) => { submitInvoice(text); setScanning(false); }, 
      () => {}
    ).then(() => { scannerRef.current = scanner; });

    return () => { scanner.stop().catch(() => {}); };
  }, [scanning]);

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Plus className="w-4 h-4 text-green-600" /> Add New Invoice
      </h3>
      
      <div className="flex gap-2">
        <Input 
          placeholder="Invoice #" 
          value={invoice} 
          onChange={(e) => setInvoice(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && submitInvoice(invoice)}
        />
        <Button variant="outline" onClick={() => setScanning(true)}>
          <ScanLine className="w-4 h-4" />
        </Button>
      </div>

      <Button className="w-full mt-2 bg-green-600" disabled={invoice.trim().length < 7} onClick={() => submitInvoice(invoice)}>
        Add Invoice
      </Button>

      {scanning && (
        <div className="fixed inset-0 bg-white z-50 p-4 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <span className="font-bold">Scan Barcode</span>
            <Button variant="ghost" onClick={() => setScanning(false)}><X /></Button>
          </div>
          <div id="scanner-area" className="w-full max-w-sm aspect-square bg-slate-100 rounded-lg overflow-hidden" />
          <p className="mt-4 text-sm text-slate-500">Align barcode within the square</p>
        </div>
      )}
    </div>
  );
}