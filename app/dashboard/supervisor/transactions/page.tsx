"use client"

import React, { useState, Suspense } from "react"
import { ArrowLeft, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/finance/date-range-picker"
import { TransactionsTable } from "@/components/finance/transactions-table"
import { ExpensesTable } from "@/components/finance/expenses-table"
import { TransferFundsDialog } from "@/components/finance/transfer-funds-dialog"
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog"
import { PinSettingsDialog } from "@/components/auth/pin-settings-dialog"

function FinanceContent() {
  const [date, setDate] = useState<DateRange | undefined>()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const currentTab = searchParams.get('tab') || 'transactions'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

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
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <DatePickerWithRange date={date} setDate={setDate} />
            <AddExpenseDialog />
            <TransferFundsDialog>
              <Button variant="outline" className="hidden md:flex gap-2 border-slate-200">
                <ArrowRightLeft className="h-4 w-4" />
                Transfer
              </Button>
            </TransferFundsDialog>
            <PinSettingsDialog />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-white border rounded-lg p-1 space-x-1 w-full justify-start overflow-x-auto flex-nowrap scrollbar-hide">
            <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-100">Transactions</TabsTrigger>
            <TabsTrigger value="expenses" className="data-[state=active]:bg-slate-100">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-0">
            <TransactionsTable dateRange={date} />
          </TabsContent>

          <TabsContent value="expenses" className="mt-0">
            <ExpensesTable dateRange={date} role="SUPERVISOR" />
          </TabsContent>
        </Tabs>

        {/* Sticky Full-Width Mobile Transfer Button */}
        <div className="h-20 md:hidden" />
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 z-50 md:hidden">
          <TransferFundsDialog>
            <Button className="w-full h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold flex items-center justify-center gap-2 shadow-md">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Transfer Funds</span>
            </Button>
          </TransferFundsDialog>
        </div>
      </main>
    </div>
  )
}

export default function SupervisorFinancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    }>
      <FinanceContent />
    </Suspense>
  )
}
