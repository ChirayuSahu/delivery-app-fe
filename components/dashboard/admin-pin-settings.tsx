"use client"

import React, { useState } from "react"
import { KeyRound, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UpiPinDialog } from "@/components/finance/upi-pin-dialog"

interface AdminPinSettingsProps {
  userId: string
  userName: string
}

export function AdminPinSettings({ userId, userName }: AdminPinSettingsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Stage controls
  const [dialogStage, setDialogStage] = useState<"none" | "set-new" | "confirm-new">("none")
  const [tempPin, setTempPin] = useState("")

  const handleOpenSetPin = () => {
    setOpen(false) // Close main settings modal
    setTempPin("")
    setDialogStage("set-new")
  }

  const handleOpenResetPin = () => {
    setOpen(false)
    setShowResetConfirm(true)
  }

  const handleNewPinSubmit = async (pin: string) => {
    setTempPin(pin)
    setDialogStage("confirm-new")
  }

  const handleConfirmPinSubmit = async (pin: string) => {
    if (pin !== tempPin) {
      toast.error("PINs do not match. Please try again.")
      setDialogStage("set-new")
      setTempPin("")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || "Failed to set PIN")
      }

      toast.success(json.message || `PIN updated successfully for ${userName}`)
      setDialogStage("none")
      setOpen(false)
      setTempPin("")
    } catch (error: any) {
      toast.error(error.message || "Failed to set PIN")
      setDialogStage("set-new")
      setTempPin("")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPinSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}/pin`, {
        method: "DELETE",
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || "Failed to reset PIN")
      }

      toast.success(json.message || `PIN reset successfully for ${userName}`)
      setShowResetConfirm(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to reset PIN")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="w-full bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-800 hover:bg-slate-100 px-3 cursor-pointer">
            <KeyRound className="w-4 h-4" />
            Manage User PIN
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] rounded-lg p-6 border-slate-200">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">Manage {userName}'s PIN</DialogTitle>
            <DialogDescription className="text-center">
              Choose an administrative action to configure or clear this user's PIN.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleOpenSetPin}
              className="w-full py-6 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              Assign / Set PIN
            </Button>
            
            <Button
              variant="outline"
              onClick={handleOpenResetPin}
              disabled={loading}
              className="w-full py-6 rounded-lg border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
            >
              Reset PIN
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-[400px] rounded-lg p-6 border-slate-200">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-2 border border-red-100">
              <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">Reset User PIN?</DialogTitle>
            <DialogDescription className="text-center text-slate-500 mt-2">
              Are you sure you want to reset the secure authorization PIN for <strong className="text-slate-800">{userName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
              disabled={loading}
              className="flex-1 py-5 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleResetPinSubmit}
              disabled={loading}
              className="flex-1 py-5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
            >
              {loading ? "RESETTING..." : "YES, RESET PIN"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <UpiPinDialog
        open={dialogStage === "set-new"}
        onOpenChange={(isOpen) => !isOpen && setDialogStage("none")}
        onSubmit={handleNewPinSubmit}
        loading={loading}
        title={`Set PIN for ${userName}`}
        enterPinText="ENTER ASSIGNED PIN"
        submitText="NEXT"
        onBack={() => { setDialogStage("none"); setOpen(true); }}
      />

      <UpiPinDialog
        open={dialogStage === "confirm-new"}
        onOpenChange={(isOpen) => !isOpen && setDialogStage("none")}
        onSubmit={handleConfirmPinSubmit}
        loading={loading}
        title="Confirm User PIN"
        enterPinText="RE-ENTER PIN"
        submitText="SAVE PIN"
        loadingText="Saving PIN..."
        onBack={() => setDialogStage("set-new")}
      />
    </>
  )
}
