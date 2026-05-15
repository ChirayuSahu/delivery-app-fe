"use client"

import React, { useState } from "react"
import { Loader2, Plus, Upload } from "lucide-react"
import { toast } from "sonner"

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

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      toast.error("Please select a file for proof.")
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    // The native input type="file" will be appended to formData automatically

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
        <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Create a new expense entry. Please attach a proof image or document.
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
              <Label htmlFor="notes">Notes / Description</Label>
              <Textarea
                id="notes"
                name="notes"
                required
                placeholder="Briefly describe this expense..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expense">Proof Document/Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="expense"
                  name="expense"
                  type="file"
                  required
                  accept="image/*,.pdf"
                  className="cursor-pointer file:text-slate-700"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !file} className="bg-slate-900 hover:bg-slate-800">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
