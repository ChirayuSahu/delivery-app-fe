"use client"

import React, { useState } from "react"
import { KeyRound } from "lucide-react"
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

  // Stage controls
  const [dialogStage, setDialogStage] = useState<"none" | "set-new" | "confirm-new">("none")
  const [tempPin, setTempPin] = useState("")

  const handleOpenSetPin = () => {
    setOpen(false) // Close main settings modal
    setTempPin("")
    setDialogStage("set-new")
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
      setTempPin("")
    } catch (error: any) {
      toast.error(error.message || "Failed to set PIN")
      setDialogStage("set-new")
      setTempPin("")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPin = async () => {
    if (!window.confirm(`Are you sure you want to reset the PIN for ${userName}?`)) {
      return
    }

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
      setOpen(false)
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
              onClick={handleResetPin}
              disabled={loading}
              className="w-full py-6 rounded-lg border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
            >
              Reset PIN
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
