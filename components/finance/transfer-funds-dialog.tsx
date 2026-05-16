"use client"

import React, { useState, useEffect } from "react"
import { Loader2, ArrowRightLeft } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TransferFundsDialogProps {
  children?: React.ReactNode
}

export function TransferFundsDialog({ children }: TransferFundsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [fetchingUsers, setFetchingUsers] = useState(false)

  // Form State
  const [amount, setAmount] = useState("")
  const [remark, setRemark] = useState("")
  const [type, setType] = useState("")
  const [toUser, setToUser] = useState("")

  useEffect(() => {
    if (open && users.length === 0) {
      const fetchUsers = async () => {
        setFetchingUsers(true)
        try {
          const res = await fetch("/api/users")
          const json = await res.json()
          if (res.ok) {
            setUsers(json.data || [])
          }
        } catch (error) {
          console.error("Failed to fetch users", error)
        } finally {
          setFetchingUsers(false)
        }
      }
      fetchUsers()
    }
  }, [open, users.length])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!toUser || !type) {
      toast.error("Please fill in all required fields.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          remark,
          type,
          toUser,
        }),
        credentials: 'include'
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || "Failed to transfer funds")
      }

      toast.success("Funds transferred successfully")
      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to transfer funds")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : (
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800">
            <ArrowRightLeft className="h-4 w-4" />
            Transfer Funds
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Transfer Funds</DialogTitle>
            <DialogDescription>
              Create a new transaction to transfer funds to another user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="toUser">Recipient</Label>
              <Select value={toUser} onValueChange={setToUser} required>
                <SelectTrigger id="toUser">
                  <SelectValue placeholder={fetchingUsers ? "Loading users..." : "Select recipient"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVOICE_PAYMENT">Invoice Payment</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  <SelectItem value="PARTNER_PAYOUT">Partner Payout</SelectItem>
                  <SelectItem value="REFUND">Refund</SelectItem>
                  <SelectItem value="DELIVERY_ASSIGNMENT">Delivery Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                placeholder="e.g. 500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="remark">Remark</Label>
              <Textarea
                id="remark"
                required
                placeholder="Describe the reason for transfer..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
