'use client';

import { Button } from '@/components/ui/button';
import { Trash2, User, Package, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { start } from 'repl';

type Invoice = {
  invType: string;
  invNo: string;
  customerName: string;
  status: string;
};

export default function InvoiceCard({
  invoice,
  onDelete,
  showDeleteInvoice = true,
  started,
  ended,
}: {
  invoice: Invoice;
  onDelete: (invType: string, invNo: string) => void;
  showDeleteInvoice?: boolean;
  started?: boolean;
  ended?: boolean;
}) {

  const pathname = usePathname();

  const getStatusColor = (status: string) => {
    if (status === 'ASSIGNED') return 'bg-yellow-50 text-yellow-800 border border-yellow-200';
    else if (status === 'OUT_FOR_DELIVERY') return 'bg-cyan-50 text-cyan-800 border border-cyan-200';
    else if (status === 'DELIVERED') return 'bg-green-50 text-green-800 border border-green-200';
    else if (status === 'FAILED') return 'bg-red-50 text-red-800 border border-red-200';
    return 'bg-slate-400';
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${invoice.status === 'DELIVERED' && !ended ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-slate-900">
            {invoice.invType}/{invoice.invNo}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-slate-600">
          <User className="h-3.5 w-3.5 opacity-70" />
          <p className="text-sm font-medium leading-none truncate">
            {invoice.customerName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Package className="h-3.5 w-3.5 opacity-70" />
          <Badge className={cn("text-xs uppercase tracking-wide font-semibold", getStatusColor(invoice.status))}>
            {invoice.status}
          </Badge>
        </div>
        {started && (
          <Link href={`${pathname}/${invoice.invType}${invoice.invNo}`} className="block w-full">
            <Button
              className="mt-2 h-12 w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100 transition-all gap-2 font-semibold shadow-sm group"
            >
              <FileText className="w-4 h-4 transition-transform group-hover:scale-110" />
              View Details
              <ArrowRight className="w-4 h-4 ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        )}
        {showDeleteInvoice && (
          <Button
            variant="ghost"
            className="mt-2 h-12 w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 transition-colors gap-2 font-semibold"
            onClick={() => onDelete(invoice.invType, invoice.invNo)}
          >
            <Trash2 className="w-4 h-4" />
            Remove Invoice
          </Button>
        )}
      </div>
    </div>
  );
}