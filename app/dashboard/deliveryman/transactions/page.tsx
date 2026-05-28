"use client"

import React, { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"

import { ArrowLeft, Home } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsTable } from "@/components/finance/transactions-table"
import { ExpensesTable } from "@/components/finance/expenses-table"
import { TodayExpensesCard } from "@/components/finance/today-expenses-card"
import { TransferFundsDialog } from "@/components/finance/transfer-funds-dialog"

function FinanceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const currentTab = searchParams.get('tab') || 'transactions'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <button onClick={() => router.push('/dashboard/deliveryman')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <Home className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                  <div>
                      <h1 className="text-xl font-bold text-slate-900">Transactions & Expenses</h1>
                      <p className="text-xs text-slate-500 font-mono uppercase">Manage your financials</p>
                  </div>
              </div>
              <TransferFundsDialog />
          </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-10 flex-1 space-y-6">
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
            <TransactionsTable dateRange={undefined} role="DELIVERY_MAN" />
          </TabsContent>

          <TabsContent value="expenses" className="mt-0 space-y-6">
            <TodayExpensesCard />
            <ExpensesTable dateRange={undefined} userId={undefined} role="DELIVERY_MAN" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function DeliverymanFinancePage() {
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
