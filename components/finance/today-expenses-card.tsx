"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { IndianRupee, Loader2 } from "lucide-react"

export function TodayExpensesCard() {
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTodayExpenses = async () => {
      setLoading(true)
      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        const url = `/api/expenses?from=${today}&to=${today}`
        
        const res = await fetch(url)
        const json = await res.json()
        
        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch today's expenses")
        }
        
        const expenses = json.data || []
        const totalAmount = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
        setTotal(totalAmount)
      } catch (error) {
        console.error("Error fetching today's expenses:", error)
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayExpenses()
  }, [])

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
          Today's Expenses
        </p>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          ) : (
            <>
              <span className="text-3xl font-black text-slate-900">
                ₹{total?.toFixed(2)}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100 shrink-0">
        <IndianRupee className="h-6 w-6" />
      </div>
    </div>
  )
}
