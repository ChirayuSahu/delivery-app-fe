'use client';

import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { 
  Clock, 
  Package, 
  Zap, 
  Timer, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

type Invoice = {
  deliveredAt: string | null;
};

type DeliveryData = {
  startedAt: string | null;
  endedAt?: string | null;
  invoices: Invoice[];
};

export default function DeliverySidebarStats({ delivery }: { delivery: DeliveryData }) {
  const stats = useMemo(() => {
    if (!delivery.startedAt) return null;

    const startTime = new Date(delivery.startedAt).getTime();
    const deliveredInvoices = delivery.invoices.filter(inv => inv.deliveredAt);
    
    if (deliveredInvoices.length === 0) return null;

    const deliveredTimes = deliveredInvoices
      .map(inv => new Date(inv.deliveredAt!).getTime())
      .sort((a, b) => a - b);

    const durations = deliveredTimes.map(t => t - startTime);
    const totalTime = durations[durations.length - 1];
    const avgTime = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const progress = Math.round((deliveredInvoices.length / delivery.invoices.length) * 100);

    return {
      progress,
      totalCount: delivery.invoices.length,
      deliveredCount: deliveredInvoices.length,
      totalMin: Math.round(totalTime / 60000),
      avgMin: Math.round(avgTime / 60000),
      fastestMin: Math.round(durations[0] / 60000),
    };
  }, [delivery]);

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-1 w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header with Progress */}
      <div className="p-4 bg-slate-50/50 border-b border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
            <h3 className="text-sm font-bold text-slate-900">Delivery Metrics</h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {stats.progress}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      {/* Stats List */}
      <div className="p-2 flex flex-col">
        <StatRow 
          icon={<Package className="w-4 h-4" />} 
          label="Orders" 
          value={`${stats.deliveredCount} / ${stats.totalCount}`} 
          subValue="Completed"
        />
        <StatRow 
          icon={<Timer className="w-4 h-4" />} 
          label="Elapsed" 
          value={`${stats.totalMin}m`} 
          subValue="Total Time"
        />
        <StatRow 
          icon={<TrendingUp className="w-4 h-4" />} 
          label="Average" 
          value={`${stats.avgMin}m`} 
          subValue="Per Stop"
        />
        <StatRow 
          icon={<Zap className="w-4 h-4" />} 
          label="Fastest" 
          value={`${stats.fastestMin}m`} 
          subValue="Record"
          isLast
        />
      </div>
    </div>
  );
}

function StatRow({ 
  icon, 
  label, 
  value, 
  subValue, 
  isLast 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subValue: string;
  isLast?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-slate-50",
      !isLast && "mb-0.5"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400 leading-none mb-1">{label}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter opacity-60 leading-none">{subValue}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-slate-800 tabular-nums leading-none">{value}</p>
      </div>
    </div>
  );
}