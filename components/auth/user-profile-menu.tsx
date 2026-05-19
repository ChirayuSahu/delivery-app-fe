"use client"

import React from "react"
import { PinSettingsDialog } from "./pin-settings-dialog"
import { LogoutButton } from "./logout-button"

export function UserProfileMenu() {
  return (
    <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
      <PinSettingsDialog />
      <LogoutButton />
    </div>
  )
}
