'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Receipt, User, Package, Tag, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type StatusResponse = {
  success: boolean;
  message: string;
  data: {
    invoice: string;
    name: string;
    status: string;
    amount: number;
    totalItems: number;
  };
};

export default function StatusPage() {
  const [invoice, setInvoice] = useState('');
  const [data, setData] = useState<StatusResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    if (!invoice.trim()) {
      setError('Please enter an invoice number');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(`/api/status?invoice=${encodeURIComponent(invoice.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const json: StatusResponse = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch order status');
      }

      if (!json.success) {
        throw new Error(json.message);
      }

      setData(json.data);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 flex items-center justify-center">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-xl font-bold">Track Order</CardTitle>
          <p className="text-sm text-slate-500">Enter invoice number for live status</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Group */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="e.g. SB21200"
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white"
                value={invoice}
                onChange={(e) => setInvoice(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && fetchStatus()}
              />
            </div>
            <Button onClick={fetchStatus} disabled={loading || invoice.trim().length < 7} className="h-11 px-5">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Result Section */}
          {data && (
            <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                <Info
                  icon={<Receipt className="w-3.5 h-3.5" />}
                  label="Invoice"
                  value={data.invoice}
                />
                <Info
                  icon={<User className="w-3.5 h-3.5" />}
                  label="Customer"
                  value={data.name}
                />
                <Info
                  icon={<Tag className="w-3.5 h-3.5" />}
                  label="Status"
                  value={
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100 font-bold text-[10px] uppercase">
                      {data.status}
                    </Badge>
                  }
                />
                <Info
                  icon={<Package className="w-3.5 h-3.5" />}
                  label="Total Items"
                  value={data.totalItems.toString()}
                />

                <div className="pt-3 mt-1 border-t flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Total Amount</span>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{data.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="">
          <Button asChild variant="outline" className="mx-auto">
            <Link href="/dashboard" className="text-sm">
              Back to Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Added 'icon' prop to your existing Info component
function Info({
  label,
  value,
  icon
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}