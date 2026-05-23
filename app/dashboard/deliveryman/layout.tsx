import React from "react"
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog"

export default function DeliverymanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] animate-in slide-in-from-bottom-4 duration-500 fade-in">
        <AddExpenseDialog className="shadow-lg rounded-md h-10 px-4 font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-white hover:scale-105 transition-all active:scale-95 border border-white" />
      </div>
    </>
  )
}
