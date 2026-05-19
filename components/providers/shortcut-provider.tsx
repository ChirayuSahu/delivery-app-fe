"use client"

import React, { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ShortcutProvider() {
  const pathname = usePathname()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/editable elements
      const activeEl = document.activeElement
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return
      }

      // Safe, non-conflicting modifiers: Alt / Option key
      const isModifier = e.altKey

      // Alt + N (KeyN)
      if (isModifier && e.code === "KeyN") {
        e.preventDefault()

        if (pathname.includes("/transactions")) {
          window.dispatchEvent(new CustomEvent("trigger-transfer-funds"))
        } else if (pathname.includes("/deliveryman")) {
          window.dispatchEvent(new CustomEvent("trigger-create-delivery"))
        } else if (pathname === "/dashboard/admin" || pathname === "/dashboard/supervisor") {
          window.dispatchEvent(new CustomEvent("trigger-create-user"))
        }
      }

      // Alt + P (KeyP)
      if (isModifier && e.code === "KeyP") {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent("trigger-pin-settings"))
      }
    };

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pathname])

  return null
}
