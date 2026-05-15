"use client"

import React, { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/finance/date-range-picker"
import { ExpensesTable } from "@/components/finance/expenses-table"
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog"
import * as jose from 'jose'

export default function DeliverymanExpensesPage() {
  const [date, setDate] = useState<DateRange | undefined>()
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    // Decode token from cookie if possible, but actually we don't strictly need 
    // to pass userId because the backend GET /expenses will default to current user
    // if userId parameter is not in the URL path.
    // Our proxy route `app/api/expenses/route.ts` hits `GET /expenses` without userId path param
    // which according to spec: "If userId is omitted, it fetches the current user's expenses".
    // So we can just leave userId undefined, and ExpensesTable will hit `/api/expenses`.
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/deliveryman">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">My Expenses</h1>
              <p className="text-slate-500 text-sm">Manage your expense claims and proofs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DatePickerWithRange date={date} setDate={setDate} />
            <AddExpenseDialog />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="space-y-6">
          <ExpensesTable dateRange={date} userId={undefined} />
        </div>
      </main>
    </div>
  )
}
