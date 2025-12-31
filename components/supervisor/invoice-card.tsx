'use client';

import { Trash2, User, Package, FileText, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

type Invoice = {
  invType: string;
  invNo: string;
  customerName: string;
  status: string;
};

function InvoiceCard({
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

  // Simple Color Logic
  const getStatusConfig = (status: string) => {
    if (status === 'DELIVERED') return { color: 'text-green-600 bg-green-50 border-green-100', icon: <CheckCircle2 className="h-3 w-3" /> };
    if (status === 'OUT_FOR_DELIVERY') return { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: <Clock className="h-3 w-3 animate-pulse" /> };
    if (status === 'FAILED') return { color: 'text-red-600 bg-red-50 border-red-100', icon: <AlertCircle className="h-3 w-3" /> };
    return { color: 'text-gray-500 bg-gray-50 border-gray-200', icon: <Package className="h-3 w-3" /> };
  };

  const config = getStatusConfig(invoice.status);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className={cn(
        "bg-white border border-gray-200 rounded-2xl p-4 transition-all group relative",
        invoice.status === 'DELIVERED' && !ended ? 'opacity-60' : 'opacity-100'
      )}>
        <Link href={`/dashboard/supervisor/invoice/${invoice.invType}${invoice.invNo}`} className="block">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-gray-900 text-sm">
                {invoice.invType}/{invoice.invNo}
              </span>
            </div>

            <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border", config.color)}>
              {config.icon}
              {invoice.status.replace(/_/g, ' ')}
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Customer</p>
            <div className="flex items-center gap-2 text-gray-700">
              <User className="h-3.5 w-3.5 text-gray-300" />
              <p className="text-sm font-bold truncate">{invoice.customerName}</p>
            </div>
          </div>
        </Link>

        {/* Footer with Delete and View Link */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <div className="flex gap-2">
            {showDeleteInvoice && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(invoice.invType, invoice.invNo);
                }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Invoice"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Link 
            href={`/dashboard/supervisor/invoice/${invoice.invType}${invoice.invNo}`}
            className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase group-hover:underline"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default InvoiceCard;