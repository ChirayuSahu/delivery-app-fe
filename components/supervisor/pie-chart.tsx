'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { User2, Loader2, TrendingUp, PieChart as PieIcon, CalendarIcon } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from '@/lib/utils';

interface Delivery {
  id: string;
  deliveryManName: string;
  invoicesDelivered: number;
}

// Strictly Blue and Green palette
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
      <div className="w-full h-120 bg-white border border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Generating Insights...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="w-full h-120 bg-white border border-gray-200 rounded-[24px] overflow-hidden flex flex-col shadow-sm"
    >
      {/* Header Section */}
      <div className="bg-gray-50 p-6 flex flex-col gap-4">
        <div className='flex items-center justify-between'>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <PieIcon className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Distribution</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Today's Performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-400/20 px-3 py-1 rounded-full border border-green-400/30 shadow-sm">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-bold text-xs rounded-xl h-10 border-gray-200 hover:bg-white hover:border-green-500",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className="rounded-2xl border-none"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-6 relative h-100">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: '#111827' }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={85}
              outerRadius={110}
              paddingAngle={6}
              stroke="none"
              animationBegin={200}
              animationDuration={1200}
              isAnimationActive={!loading}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity outline-none"
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="rect"
              formatter={(value) => (
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mr-2">
                  {value}
                </span>
              )}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Stats */}
        <div className="absolute top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-black text-gray-900 leading-none tracking-tighter"
          >
            {totalDelivered}
          </motion.p>
          <p className="text-[10px] uppercase font-black text-green-600 mt-2 tracking-widest">
            Delivered
          </p>
          <div className="mt-1 h-1 w-8 bg-blue-600 mx-auto rounded-full" />
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 border-t border-gray-100 p-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <User2 className="h-4 w-4 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {chartData.length} Personnel Active
          </span>
        </div>
        <button onClick={() => window.open('/dashboard/supervisor/reports/daily', '_blank')} className="text-[10px] font-black text-blue-600 uppercase hover:underline">
          Full Report
        </button>
      </div>
    </motion.div>
  );
}

export default DeliveryPersonnelChart;