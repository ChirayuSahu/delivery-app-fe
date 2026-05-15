"use client"

import React, { useState, useEffect } from "react"
import { Loader2, FileText, Download } from "lucide-react"
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
  const isSelfView = !!userId || role === 'DELIVERY_MAN' || role === 'SUPERVISOR' // Supervisors might see all or just self, but user said "no need to show userId in expenses when deliveryman or supervisor is viewing"

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
    <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
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
            <TableRow key={expense.id}>
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
                  onClick={() => {
                    const dashboardPath = role?.toLowerCase().replace('_', '')
                    router.push(`/dashboard/${dashboardPath}/${role === 'DELIVERY_MAN' ? 'expenses' : 'transactions/expenses'}/${expense.id}`)
                  }}
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
  )
}
