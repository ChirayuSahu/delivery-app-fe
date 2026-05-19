"use client"

import React from "react"
import { SidebarLayout } from "@/components/navigation/sidebar-layout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarLayout>{children}</SidebarLayout>
}
