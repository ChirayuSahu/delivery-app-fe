"use client"

import React, { useState } from "react"
import { Loader2, Plus, Upload } from "lucide-react"
import { toast } from "sonner"
import CameraCapture from "@/components/deliveryman/capture-pod"
import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function AddExpenseDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")

  const PRESET_NOTES = ["Fuel", "Stationary", "Food", "Maintenance"]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    if (file) {
      formData.set('expense', file)
    }

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        body: formData, // passing FormData directly
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || "Failed to create expense")
      }

      toast.success("Expense created successfully")
      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to create expense")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`gap-2 bg-slate-900 hover:bg-slate-800 ${className || ''}`}>
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Expense</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Create a new expense entry. Please attach a proof image or document (Optional).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="e.g. 500.00"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Notes / Description</Label>
              </div>
              <Textarea
                id="notes"
                name="notes"
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe this expense..."
              />
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESET_NOTES.map((preset) => (
                  <Badge
                    key={preset}
                    variant="secondary"
                    className="cursor-pointer hover:bg-slate-200"
                    onClick={() => setNotes(preset)}
                  >
                    {preset}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Proof Document/Image (Optional)</Label>
              <CameraCapture onCapture={setFile} for="Expense Proof" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
