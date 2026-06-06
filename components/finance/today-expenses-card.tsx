"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { IndianRupee, Loader2, FileText, Download } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

  const downloadReport = async (type: 'pdf' | 'excel') => {
    setDownloading(true)
    const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange?.from || new Date(), 'yyyy-MM-dd')
    
    const url = type === 'pdf' 
      ? `/api/reports/expenses-pdf?from=${fromDate}&to=${toDate}`
      : `/api/reports/expenses?from=${fromDate}&to=${toDate}`

    try {
      const res = await fetch(url)
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message || "Failed to download report")
      }

      const blob = await res.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      const displayDate = fromDate === toDate ? fromDate : `${fromDate}-to-${toDate}`
      const ext = type === 'pdf' ? 'pdf' : 'xlsx'
      a.download = `expense-report-${displayDate}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
      
      toast.success('Report downloaded successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to download report')
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              disabled={downloading || loading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold h-[42px] px-4 rounded-lg shadow-sm"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Report
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
        <div className="h-[42px] w-[42px] bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-100 shrink-0 hidden md:flex shadow-sm">
          <IndianRupee className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
