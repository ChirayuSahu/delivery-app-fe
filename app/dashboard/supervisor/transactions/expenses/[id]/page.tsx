"use client"

import React from "react"
import { useParams, useRouter } from "next/navigation"
import { ExpenseDetail } from "@/components/finance/expense-detail"
import { ArrowLeft, Home } from "lucide-react"

export default function SupervisorExpenseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Home className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Expense Details</h1>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl w-full mx-auto p-6 flex-1">
        <ExpenseDetail expenseId={id} backPath="/dashboard/supervisor/transactions" />
      </main>
    </div>
  )
}
