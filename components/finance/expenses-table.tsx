"use client"

import React, { useState, useEffect } from "react"
import { Loader2, FileText, Download } from "lucide-react"
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
}

export function ExpensesTable({ dateRange, userId }: ExpensesTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)

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
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>Date</TableHead>
            {!userId && <TableHead>User</TableHead>}
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Proof</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(expense.createdAt), 'dd MMM yyyy, HH:mm')}
              </TableCell>
              {!userId && (
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
                {expense.proofUrl ? (
                  <a
                    href={expense.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="text-xs">View</span>
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
