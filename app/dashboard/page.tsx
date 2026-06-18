"use client"

import React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Loader2 } from "lucide-react"

// Import existing dashboards as components
import AdminDashboard from "./admin/page"
import SupervisorDashboard from "./supervisor/page"
import DeliverymanDashboard from "./deliveryman/page"

export default function UnifiedDashboard() {
  const { userRole, profileLoading } = useAuth()

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading your dashboard view...</p>
      </div>
    )
  }

  // Render dashboard based on active role
  switch (userRole) {
    case "ADMIN":
      return <AdminDashboard />
    case "SUPERVISOR":
      return <SupervisorDashboard />
    case "DELIVERY_MAN":
      return <DeliverymanDashboard />
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50">
          <p className="text-sm font-bold text-red-650">Access Denied: Unrecognized role.</p>
        </div>
      )
  }
}
