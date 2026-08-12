"use client"

import React, { useState, Suspense } from "react"
import { ArrowLeft, FileText, ArrowRightLeft, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DatePickerWithRange } from "@/components/finance/date-range-picker"
import { TransactionsTable } from "@/components/finance/transactions-table"
import { ExpensesTable } from "@/components/finance/expenses-table"
import { TodayExpensesCard } from "@/components/finance/today-expenses-card"
import { TransferFundsDialog } from "@/components/finance/transfer-funds-dialog"
import { PinSettingsDialog } from "@/components/auth/pin-settings-dialog"
import { toast } from "sonner"

function FinanceContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [date, setDate] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (from) {
      return {
        from: new Date(from),
        to: to ? new Date(to) : new Date(from)
      }
    }
    return undefined
  })

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (date?.from) {
      params.set('from', format(date.from, 'yyyy-MM-dd'))
    } else {
      params.delete('from')
    }
    if (date?.to) {
      params.set('to', format(date.to, 'yyyy-MM-dd'))
    } else {
      params.delete('to')
    }
    
    if (params.toString() !== searchParams.toString()) {
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [date, searchParams, router])
  
  const currentTab = searchParams.get('tab') || 'transactions'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const [loadingReport, setLoadingReport] = useState(false)

  const downloadReport = async (type: 'pdf' | 'excel') => {
    setLoadingReport(true)
    try {
      let url = type === 'pdf' ? '/api/reports/expenses-pdf' : '/api/reports/expenses'
      const params = new URLSearchParams()
      if (date?.from) params.append('from', format(date.from, 'yyyy-MM-dd'))
      if (date?.to) params.append('to', format(date.to, 'yyyy-MM-dd'))
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to generate report")

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      
      const ext = type === 'pdf' ? 'pdf' : 'xlsx'
      let filename = `expenses-report.${ext}`
      const disposition = res.headers.get('content-disposition')
      if (disposition && disposition.indexOf('filename=') !== -1) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition)
          if (matches != null && matches[1]) { 
              filename = matches[1].replace(/['"]/g, '')
          }
      }
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
      
      toast.success("Report generated successfully")
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to generate report")
    } finally {
      setLoadingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
        <div className="flex flex-row items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-100 shadow-sm overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Popover>
                <PopoverTrigger asChild>
                    <Button disabled={loadingReport} variant="outline" className="gap-2 border-slate-200">
                        {loadingReport ? (
                            <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        ) : (
                            <FileText className="h-4 w-4 text-green-600" />
                        )}
                        <span>Reports</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={() => downloadReport('pdf')}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-md transition-colors flex items-center gap-2 text-slate-700 font-medium"
                        >
                            <FileText className="w-4 h-4 text-red-500" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => downloadReport('excel')}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 rounded-md transition-colors flex items-center gap-2 text-slate-700 font-medium"
                        >
                            <Download className="w-4 h-4 text-green-600" />
                            Download Excel
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
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
            <TodayExpensesCard dateRange={date} />
            <ExpensesTable dateRange={date} role="ADMIN" />
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

export default function AdminFinancePage() {
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
