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
import { TodayExpensesCard } from "@/components/finance/today-expenses-card"
import { TransferFundsDialog } from "@/components/finance/transfer-funds-dialog"
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
      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
        <div className="flex flex-row items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-100 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <TransferFundsDialog>
               <Button className="hidden md:flex gap-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm">
                <ArrowRightLeft className="h-4 w-4" />
                Transfer
              </Button>
            </TransferFundsDialog>
          </div>
        </div>
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex">
            <TabsList className="bg-slate-100/70 p-1 rounded-lg inline-flex gap-1 border border-slate-200/30 h-auto">
              <TabsTrigger 
                value="transactions" 
                className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="expenses" 
                className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm cursor-pointer"
              >
                Expenses
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="transactions" className="mt-0">
            <TransactionsTable dateRange={date} />
          </TabsContent>

          <TabsContent value="expenses" className="mt-0 space-y-6">
            <TodayExpensesCard />
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
