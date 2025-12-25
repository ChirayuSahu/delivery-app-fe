import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Package } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
      {/* Top Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="gap-2">
          <Package className="h-4 w-4" />
          Create Delivery
        </Button>
        <Button variant="outline" className="gap-2">
          <ArrowDownUp className="h-4 w-4" />
          View Order Status
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell className="text-right">{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const data = [
  {
    id: "ORD-21085",
    customer: "Rajesh Pharma",
    status: "Dispatched",
    date: "25 Dec 2025",
    amount: "₹12,430",
  },
  {
    id: "ORD-21086",
    customer: "Apollo Medicals",
    status: "Processing",
    date: "25 Dec 2025",
    amount: "₹8,210",
  },
  {
    id: "ORD-21087",
    customer: "City Care",
    status: "Delivered",
    date: "24 Dec 2025",
    amount: "₹15,900",
  },
];
