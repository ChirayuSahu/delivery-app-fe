'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

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
        console.log('Fetch error:', json);
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
    <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check Order Status</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter invoice (e.g. SB/21200)"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchStatus()}
            />
            <Button onClick={fetchStatus} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Result */}
          {data && (
            <div className="space-y-4 border-t pt-4">
              <Info label="Invoice" value={data.invoice} />
              <Info label="Customer" value={data.name} />
              <Info
                label="Status"
                value={<Badge variant="outline">{data.status}</Badge>}
              />
              <Info label="Total Items" value={data.totalItems.toString()} />
              <Info
                label="Amount"
                value={`₹${data.amount.toLocaleString('en-IN')}`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
