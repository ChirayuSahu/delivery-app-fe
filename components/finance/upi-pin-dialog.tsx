"use client"

import React, { useState, useEffect } from "react"
import { Eye, EyeOff, Delete, Loader2, Landmark, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UpiPinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (pin: string) => Promise<void>
  loading: boolean
  title?: string
  enterPinText?: string
  submitText?: string
  loadingText?: string
  onBack?: () => void
}

export function UpiPinDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
  title = "Transaction Security",
  enterPinText = "ENTER UPI PIN",
  submitText = "SUBMIT",
  loadingText = "Verifying Authorization...",
  onBack,
}: UpiPinDialogProps) {
  const [pin, setPin] = useState<string>("")
  const [showPin, setShowPin] = useState<boolean>(false)

  // Clear PIN on open/close change
  useEffect(() => {
    if (!open) {
      setPin("")
    }
  }, [open])

  // Auto-submit when exactly 4 digits are entered
  useEffect(() => {
    if (open && pin.length === 4 && !loading) {
      onSubmit(pin)
      setPin("")
    }
  }, [open, pin, loading, onSubmit])

  const handleKeyPress = (val: string) => {
    if (loading) return
    if (pin.length < 4) {
      setPin((prev) => prev + val)
    }
  }

  const handleBackspace = () => {
    if (loading) return
    setPin((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (loading) return
    setPin("")
  }

  const handleSubmit = () => {
    if (loading) return
    if (pin.length < 4) {
      return // PIN too short (allows 4 to 6 digits, but let's encourage at least 4)
    }
    onSubmit(pin)
  }

  // Handle physical keyboard inputs too for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || loading) return
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key)
      } else if (e.key === "Backspace") {
        handleBackspace()
      } else if (e.key === "Enter") {
        handleSubmit()
      } else if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, pin, loading])

  const pinDigits = Array.from({ length: 4 })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden border border-slate-200 bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header Bar mimicking Axis Bank / UPI */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center">
          <div className="flex items-center gap-2 text-slate-800">
            {onBack ? (
              <button 
                type="button" 
                onClick={onBack} 
                className="p-1 hover:bg-slate-200/80 rounded-full transition-colors mr-1 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-slate-700" />
              </button>
            ) : (
              <Landmark className="h-5 w-5 text-green-700" />
            )}
            <span className="font-bold tracking-tight text-sm uppercase">{title}</span>
          </div>
        </div>

        {/* Top brand-accent line */}
        <div className="h-1 bg-green-700 w-full" />

        {/* PIN Entry Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              {enterPinText}
            </span>
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-green-600 hover:text-green-800 text-xs font-extrabold flex items-center gap-1 uppercase transition-colors"
            >
              {showPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPin ? "HIDE" : "SHOW"}
            </button>
          </div>

          {/* Dots/Dashes displays */}
          <div className="flex gap-4 mb-8">
            {pinDigits.map((_, index) => {
              const digit = pin[index]
              const isActive = index === pin.length

              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-12 w-10 flex items-center justify-center text-2xl font-black text-slate-800 relative">
                    {digit ? (
                      showPin ? (
                        digit
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full bg-slate-900 animate-in fade-in zoom-in-50 duration-150" />
                      )
                    ) : (
                      isActive && (
                        <div className="h-6 w-0.5 bg-green-600 animate-pulse" />
                      )
                    )}
                  </div>
                  <div
                    className={`h-[3px] w-8 rounded-full transition-all duration-200 ${
                      digit
                        ? "bg-slate-900"
                        : isActive
                        ? "bg-green-600 w-9"
                        : "bg-slate-200"
                    }`}
                  />
                </div>
              )
            })}
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs font-bold text-green-600 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText}
            </div>
          )}
        </div>

        {/* Custom Numeric Keypad */}
        <div className="bg-slate-50 border-t border-slate-100 grid grid-cols-3 divide-x divide-y divide-slate-100 select-none">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              disabled={loading}
              onClick={() => handleKeyPress(num)}
              className="py-4 text-xl font-bold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={loading || pin.length === 0}
            onClick={handleBackspace}
            className="py-4 flex items-center justify-center text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <Delete className="h-5 w-5" />
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleKeyPress("0")}
            className="py-4 text-xl font-bold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            disabled={loading || pin.length < 4}
            onClick={handleSubmit}
            className="py-4 text-xs font-black uppercase text-green-600 bg-white hover:bg-slate-50 active:bg-green-50 transition-colors disabled:opacity-40"
          >
            {submitText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
