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

export function PinSettingsDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Stage controls
  const [dialogStage, setDialogStage] = useState<"none" | "set-new" | "confirm-new" | "confirm-reset">("none")
  const [tempPin, setTempPin] = useState("")

  const handleOpenSetPin = () => {
    setOpen(false) // Close main settings modal
    setTempPin("")
    setDialogStage("set-new")
  }

  const handleOpenResetPin = () => {
    setOpen(false)
    setDialogStage("confirm-reset")
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
      const res = await fetch("/api/users/me/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || "Failed to set PIN")
      }

      toast.success(json.message || "PIN updated successfully")
      setDialogStage("none")
      setOpen(false)
      setTempPin("")
    } catch (error: any) {
      toast.error(error.message || "Failed to set PIN")
      setDialogStage("set-new") // Go back to first step
      setTempPin("")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPinSubmit = async (pin: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/users/me/pin", {
        method: "DELETE",
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.message || "Failed to reset PIN")
      }

      toast.success(json.message || "PIN reset successfully")
      setDialogStage("none")
    } catch (error: any) {
      toast.error(error.message || "Failed to reset PIN")
      setDialogStage("none")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children ? (
            children
          ) : (
            <Button variant="outline" className="gap-2">
              <KeyRound className="h-4 w-4" />
              <span className="text-xs font-bold">PIN Settings</span>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] rounded-lg p-6 border-slate-200">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">PIN Settings</DialogTitle>
            <DialogDescription className="text-center">
              Choose an action to configure your secure transaction authorization PIN.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleOpenSetPin}
              className="w-full py-6 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              Set / Update PIN
            </Button>
            
            <Button
              variant="outline"
              onClick={handleOpenResetPin}
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
        title="Set Transaction PIN"
        enterPinText="ENTER NEW PIN"
        submitText="NEXT"
        onBack={() => { setDialogStage("none"); setOpen(true); }}
      />

      <UpiPinDialog
        open={dialogStage === "confirm-new"}
        onOpenChange={(isOpen) => !isOpen && setDialogStage("none")}
        onSubmit={handleConfirmPinSubmit}
        loading={loading}
        title="Confirm Transaction PIN"
        enterPinText="RE-ENTER NEW PIN"
        submitText="CONFIRM"
        loadingText="Saving PIN..."
        onBack={() => setDialogStage("set-new")}
      />

      <UpiPinDialog
        open={dialogStage === "confirm-reset"}
        onOpenChange={(isOpen) => !isOpen && setDialogStage("none")}
        onSubmit={handleResetPinSubmit}
        loading={loading}
        title="Reset Transaction PIN"
        enterPinText="ENTER CURRENT PIN TO RESET"
        submitText="AUTHORIZE RESET"
        loadingText="Resetting PIN..."
        onBack={() => { setDialogStage("none"); setOpen(true); }}
      />
    </>
  )
}
