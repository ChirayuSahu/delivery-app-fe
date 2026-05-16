"use client"

import React, { useState, useEffect } from "react"
import { Loader2, FileText, Download, ChevronRight, Clock, User, Wallet } from "lucide-react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useRouter } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Expense {
  id: string
  amount: number
  notes: string
  proofUrl: string
  userId: string
  createdAt: string
  user?: {
    name: string
  }
}

interface ExpensesTableProps {
  dateRange?: DateRange
  userId?: string
  role?: 'ADMIN' | 'SUPERVISOR' | 'DELIVERY_MAN'
}

export function ExpensesTable({ dateRange, userId, role }: ExpensesTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isAdmin = role === 'ADMIN'
  const isSelfView = !!userId || role === 'DELIVERY_MAN' || role === 'SUPERVISOR'

  const handleRowClick = (expenseId: string) => {
    const dashboardPath = role?.toLowerCase().replace('_', '')
    const baseUrl = `/dashboard/${dashboardPath}/${role === 'DELIVERY_MAN' ? 'expenses' : 'transactions/expenses'}/${expenseId}`
    router.push(baseUrl)
  }

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      try {
        let url = userId ? `/api/expenses/${userId}` : '/api/expenses'
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
          throw new Error(json.message || 'Failed to fetch expenses')
        }

        setExpenses(json.data || [])
      } catch (error) {
        console.error("Failed to fetch expenses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [dateRange, userId])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 text-green-600 animate-spin" />
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500 bg-white border rounded-lg shadow-sm">
        <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p>No expenses found for this period.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            onClick={() => handleRowClick(expense.id)}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expense</p>
                  <p className="text-sm font-bold text-slate-900">₹{expense.amount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-medium">
                    {format(new Date(expense.createdAt), 'dd MMM, HH:mm')}
                  </span>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 mb-3 py-2 border-y border-slate-50">
                <div className="p-1.5 bg-slate-100 rounded-full">
                  <User className="h-3 w-3 text-slate-500" />
                </div>
                <span className="text-xs font-medium text-slate-700">{expense.user?.name || expense.userId}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500 truncate max-w-[200px]">{expense.notes}</p>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto hidden md:block">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Date</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow
                key={expense.id}
                onClick={() => handleRowClick(expense.id)}
                className="cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <TableCell className="whitespace-nowrap">
                  {format(new Date(expense.createdAt), 'dd MMM yyyy, HH:mm')}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <span className="font-medium text-slate-700">{expense.user?.name || expense.userId}</span>
                  </TableCell>
                )}
                <TableCell className="max-w-xs truncate" title={expense.notes}>
                  {expense.notes}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{expense.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
