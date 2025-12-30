'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User2, Loader2 } from "lucide-react";

interface Delivery {
  deliveryMan: string;
  id: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

export function DeliveryPersonnelChart() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchDeliveries() {
    try {
      const response = await fetch('/api/deliveries');
      const data = await response.json();
      setDeliveries(data.data || []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    deliveries.forEach((d) => {
      const name = d.deliveryMan || "Unassigned";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [deliveries]);

  return (
    <Card className="flex flex-col border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-800">
            Delivery Distribution
          </CardTitle>
          <User2 className="h-4 w-4 text-slate-400" />
        </div>
      </CardHeader>
      
      {/* Set a explicit height here for ResponsiveContainer to work */}
      <CardContent className="relative h-80 w-full pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0',
                fontSize: '12px' 
              }}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={8}
              stroke="none"
              // Adding an animation duration helps smooth rendering
              animationDuration={800}
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
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Absolute Centering for the Total Count */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-3xl font-bold text-slate-900 leading-none">{ loading ? "Loading..." : deliveries.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
           {!loading && (deliveries.length === 1 ? "Delivery" : "Deliveries")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}