'use client';

import { useMemo } from 'react';
import { cn } from "@/lib/utils";
import { 
  Package, 
  TrendingUp, 
  Activity, 
  Hourglass,
  Info
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
    const totalCount = delivery.invoices.length;
    const deliveredCount = deliveredInvoices.length;
    
    if (deliveredCount === 0) return null;

    // 1. Calculate Base Time
    const deliveredTimes = deliveredInvoices
      .map(inv => new Date(inv.deliveredAt!).getTime())
      .sort((a, b) => a - b);
    
    const lastDeliveryTime = deliveredTimes[deliveredTimes.length - 1];
    const totalElapsedMinutes = Math.max(1, Math.round((lastDeliveryTime - startTime) / 60000));

    // 2. Calculate Pace (Tempo)
    // Average minutes per stop (including drive time to get there)
    const avgMinPerStop = totalElapsedMinutes / deliveredCount;

    // 3. Calculate Velocity
    // Projected stops per hour at current speed
    const stopsPerHour = ((deliveredCount / totalElapsedMinutes) * 60).toFixed(1);

    // 4. Calculate Forecast (ETA)
    const remainingCount = totalCount - deliveredCount;
    const estimatedRemainingMinutes = Math.round(remainingCount * avgMinPerStop);
    
    // Format duration helper
    const formatDuration = (mins: number) => {
      if (mins < 1) return '< 1m';
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const progress = Math.round((deliveredCount / totalCount) * 100);

    return {
      progress,
      totalCount,
      deliveredCount,
      stopsPerHour,
      avgPerStop: `${Math.round(avgMinPerStop)}m`,
      estRemaining: formatDuration(estimatedRemainingMinutes),
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
      <div className="p-2 flex flex-col gap-1">
        <StatRow 
          icon={<Package className="w-4 h-4" />} 
          label="Progress" 
          value={`${stats.deliveredCount} / ${stats.totalCount}`} 
          subValue="Orders"
          tooltip="Total orders delivered vs. total orders assigned to this route."
        />

        <StatRow 
          icon={<Activity className="w-4 h-4" />} 
          label="Velocity" 
          value={stats.stopsPerHour} 
          subValue="Stops / Hr"
          tooltip="The current speed of delivery. Higher is better."
        />

        <StatRow 
          icon={<TrendingUp className="w-4 h-4" />} 
          label="Tempo" 
          value={stats.avgPerStop} 
          subValue="Avg / Stop"
          tooltip="Average time spent per stop (including driving time between locations)."
        />

        <StatRow 
          icon={<Hourglass className="w-4 h-4" />} 
          label="Forecast" 
          value={`+${stats.estRemaining}`} 
          subValue="To Finish"
          tooltip="Estimated time remaining to complete route based on current pace."
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
  tooltip,
  isLast 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  subValue: string;
  tooltip: string;
  isLast?: boolean;
}) {
  return (
    <div className="group relative">
      <div className={cn(
        "flex items-center justify-between p-2 rounded-xl transition-colors hover:bg-slate-50 cursor-help",
        !isLast && "mb-0.5"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm group-hover:border-slate-300 group-hover:text-slate-600 transition-colors">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[11px] font-medium text-slate-400 leading-none mb-1">{label}</p>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter opacity-60 leading-none">{subValue}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-800 tabular-nums leading-none">{value}</p>
        </div>
      </div>

      {/* Tooltip Implementation */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-slate-900 text-slate-50 text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl z-50 pointer-events-none text-center">
        {tooltip}
        {/* Tooltip Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
      </div>
    </div>
  );
}