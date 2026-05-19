'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { User2, Loader2, TrendingUp, PieChart as PieIcon, CalendarIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { useGetSuccessDeliveries } from '@/hooks/useGetSuccessDeliveries';
import Link from 'next/link';
import { toast } from 'sonner';

interface Delivery {
  id: string;
  deliveryManName: string;
  invoicesDelivered: number;
}

const COLORS = [
  '#f59e0b', // Amber/Yellow
  '#ef4444', // Red
  '#3b82f6', // Bright Blue
  '#10b981', // Emerald Green
  '#8b5cf6', // Violet/Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316'  // Orange
];

function DeliveryPersonnelChart() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  async function fetchDeliveries() {
    if (!date) return;
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await fetch(`/api/deliveries/success?date=${formattedDate}`);
      const json = await response.json();
      setDeliveries(json.data || []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  }

  useGetSuccessDeliveries<Delivery[]>(date, (data) => {
    toast.success('Delivery Chart updated');
    setDeliveries(data);
  });

  useEffect(() => {
    fetchDeliveries();
  }, [date]);

  const chartData = useMemo(() => {
    return deliveries.map(d => ({
      name: d.deliveryManName || 'Unassigned',
      value: d.invoicesDelivered,
    }));
  }, [deliveries]);

  const totalDelivered = useMemo(() => {
    return deliveries.reduce((sum, d) => sum + d.invoicesDelivered, 0);
  }, [deliveries]);

  if (loading) {
    return (
      <div className="w-full bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center shadow-sm">
        <Loader2 className="animate-spin h-5 w-5 text-slate-400 mb-2" />
        <span className="text-xs text-slate-400 font-medium">Generating distribution...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="border-b border-slate-100 bg-slate-50/50 py-3 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-900">Distribution</span>
        </div>
        <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-[10px] font-semibold text-green-700 border border-green-200/40">
          <span className="h-1 w-1 bg-green-500 rounded-full animate-pulse" />
          Live Insights
        </div>
      </div>

      {/* Date Picker Row */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-semibold text-xs rounded-lg h-9 border-slate-200 hover:bg-slate-50 hover:border-slate-300 bg-white shadow-none",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl overflow-hidden shadow-lg border border-slate-100" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d > new Date()}
              initialFocus
              className="rounded-xl border-none"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Chart Section */}
      <div className="flex-1 min-h-0 relative p-5 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #f1f5f9',
                fontSize: '11px',
                fontWeight: '600',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
              }}
              itemStyle={{ color: '#0f172a' }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={4}
              stroke="none"
              animationBegin={100}
              animationDuration={800}
              isAnimationActive={!loading}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-85 transition-opacity outline-none"
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              iconSize={6}
              formatter={(value) => (
                <span className="text-[10px] font-semibold text-slate-500 mr-1.5 uppercase">
                  {value}
                </span>
              )}
              wrapperStyle={{ paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Stats */}
        <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">
            {totalDelivered}
          </p>
          <p className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
            Delivered
          </p>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-slate-50/50 border-t border-slate-100 p-3 px-5 flex justify-between items-center text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <User2 className="h-4 w-4 text-slate-400" />
          <span>
            {chartData.length} active {chartData.length === 1 ? 'member' : 'members'}
          </span>
        </div>
        <Link href="/dashboard/admin/reports" className="inline-flex items-center gap-0.5 text-slate-500 hover:text-slate-900 font-semibold transition-colors">
          <span>Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default DeliveryPersonnelChart;