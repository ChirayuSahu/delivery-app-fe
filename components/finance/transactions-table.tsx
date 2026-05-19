"use client"

import React, { useState, useEffect } from "react"
import { Loader2, ArrowRightLeft, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  fromUserId: string | null
  toUserId: string | null
  createdAt: string
  fromUser?: { name: string }
  toUser?: { name: string }
}

interface TransactionsTableProps {
  dateRange?: DateRange
  userId?: string
}

export function TransactionsTable({ dateRange, userId }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        let url = userId ? `/api/transactions/${userId}` : '/api/transactions'
        const params = new URLSearchParams()
        if (dateRange?.from) {
            params.append('from', format(dateRange.from, 'yyyy-MM-dd'))
        }
        if (dateRange?.to) {
            params.append('to', format(dateRange.to, 'yyyy-MM-dd'))
        }
        if (params.toString()) {
            url += `?${params.toString()}`
        }

        const res = await fetch(url)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.message || 'Failed to fetch transactions')
        }

        setTransactions(json.data || [])
      } catch (error) {
        console.error("Failed to fetch transactions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [dateRange, userId])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 bg-white border rounded-lg shadow-sm">
        <ArrowRightLeft className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p>No transactions found for this period.</p>
      </div>
    )
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'INVOICE_PAYMENT':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Payment</Badge>
      case 'ADJUSTMENT':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Adjustment</Badge>
      case 'REFUND':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Refund</Badge>
      case 'DELIVERY_ASSIGNMENT':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-none">Assignment</Badge>
      case 'PARTNER_PAYOUT':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">Payout</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {transactions.map((tx) => {
          const isCredit = userId ? tx.toUserId === userId : false;
          return (
            <div
              key={tx.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:bg-slate-50"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${isCredit ? 'bg-green-50' : 'bg-slate-50'}`}>
                    {isCredit ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transaction</p>
                       {getTypeBadge(tx.type)}
                    </div>
                    <p className={`text-sm font-bold ${isCredit && userId ? 'text-green-600' : 'text-slate-900'}`}>
                      {isCredit && userId ? '+' : ''}₹{tx.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-medium">
                    {format(new Date(tx.createdAt), 'dd MMM, HH:mm')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 py-2 border-y border-slate-50">
                {tx.fromUserId && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From</p>
                    <p className="text-xs font-medium text-slate-700 truncate">{tx.fromUser?.name || 'User'}</p>
                  </div>
                )}
                {tx.toUserId && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To</p>
                    <p className="text-xs font-medium text-slate-700 truncate">{tx.toUser?.name || 'User'}</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 truncate">{tx.description || '-'}</p>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto hidden md:block">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const isCredit = userId ? tx.toUserId === userId : false;
              return (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}
                  </TableCell>
                  <TableCell>{getTypeBadge(tx.type)}</TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {tx.fromUser?.name || '-'}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {tx.toUser?.name || '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={tx.description || ''}>
                    {tx.description || '-'}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${isCredit && userId ? 'text-green-600' : ''}`}>
                    {isCredit && userId ? '+' : ''}₹{tx.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
