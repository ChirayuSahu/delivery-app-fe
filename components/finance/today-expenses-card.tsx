"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { IndianRupee, Loader2, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"

interface TodayExpensesCardProps {
  dateRange?: DateRange
}

export function TodayExpensesCard({ dateRange }: TodayExpensesCardProps) {
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const fetchTodayExpenses = async () => {
      setLoading(true)
      try {
        const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
        const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange?.from || new Date(), 'yyyy-MM-dd')
        
        const url = `/api/expenses?from=${fromDate}&to=${toDate}`
        
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
  }, [dateRange])

  const downloadPdfReport = async () => {
    setDownloading(true)
    const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange?.from || new Date(), 'yyyy-MM-dd')
    
    const url = `/api/reports/expenses-pdf?from=${fromDate}&to=${toDate}`

    try {
      const res = await fetch(url)
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to download PDF report")
      }

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      const displayDate = fromDate === toDate ? fromDate : `${fromDate}-to-${toDate}`
      a.download = `expense-report-${displayDate}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
      
      toast.success('PDF Report downloaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to download PDF report')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
          {dateRange?.from ? 'Selected Expenses' : "Today's Expenses"}
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
      <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
        <Button
          onClick={downloadPdfReport}
          disabled={downloading || loading}
          variant="outline"
          className="w-full md:w-auto h-12 flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          Download Report
        </Button>
        <div className="h-12 w-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100 shrink-0 hidden md:flex">
          <IndianRupee className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
