"use client"

import React, { useState, useEffect } from "react"
import { Loader2, ArrowLeft, Download, Calendar, User, IndianRupee, FileText } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface ExpenseDetailProps {
  expenseId: string
  backPath: string
}

export function ExpenseDetail({ expenseId, backPath }: ExpenseDetailProps) {
  const [expense, setExpense] = useState<Expense | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await fetch(`/api/expenses/detail/${expenseId}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch expense details")
        }

        setExpense(json.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchExpense()
  }, [expenseId])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading expense details...</p>
      </div>
    )
  }

  if (error || !expense) {
    return (
      <div className="text-center p-12 bg-white border rounded-xl shadow-sm">
        <div className="bg-red-50 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error</h2>
        <p className="text-slate-500 mb-6">{error || "Expense not found"}</p>
        <Button onClick={() => router.push(backPath)}>Go Back</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-md ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg">Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="h-3 w-3" />
                  Date Submitted
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {format(new Date(expense.createdAt), 'dd MMMM yyyy, HH:mm')}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <User className="h-3 w-3" />
                  Submitted By
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {expense.user?.name || 'Unknown'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <IndianRupee className="h-3 w-3" />
                  Amount
                </div>
                <p className="text-2xl font-black text-green-700">
                  ₹{expense.amount.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <FileText className="h-3 w-3" />
                  Notes
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {expense.notes}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full overflow-hidden border-none shadow-md ring-1 ring-slate-200 flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg">Proof Document</CardTitle>
                <CardDescription>Visual evidence submitted with the claim</CardDescription>
              </div>
              {expense.proofUrl && (
                <a href={expense.proofUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </a>
              )}
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-slate-900 flex items-center justify-center min-h-[400px]">
              {expense.proofUrl ? (
                expense.proofUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={expense.proofUrl} 
                    className="w-full h-full min-h-[600px] border-none"
                    title="Expense Proof PDF"
                  />
                ) : (
                  <img 
                    src={expense.proofUrl} 
                    alt="Expense Proof" 
                    className="max-w-full max-h-full object-contain p-4"
                  />
                )
              ) : (
                <div className="text-slate-500 text-center p-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No proof document available</p>
                </div>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
