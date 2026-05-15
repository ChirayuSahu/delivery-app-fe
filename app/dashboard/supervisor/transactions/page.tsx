"use client"

import React, { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/finance/date-range-picker"
import { TransactionsTable } from "@/components/finance/transactions-table"
import { ExpensesTable } from "@/components/finance/expenses-table"
import { TransferFundsDialog } from "@/components/finance/transfer-funds-dialog"
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog"

export default function SupervisorFinancePage() {
  const [date, setDate] = useState<DateRange | undefined>()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/supervisor">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
              <p className="text-slate-500 text-sm">Manage transactions and expenses</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DatePickerWithRange date={date} setDate={setDate} />
            <AddExpenseDialog />
            <TransferFundsDialog />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="bg-white border rounded-lg p-1 space-x-1">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-100">Transactions</TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-slate-100">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-0">
            <TransactionsTable dateRange={date} />
          </TabsContent>

          <TabsContent value="expenses" className="mt-0">
            <ExpensesTable dateRange={date} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
