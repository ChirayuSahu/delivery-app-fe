"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  IndianRupee,
  Truck,
  ArrowRightLeft,
  KeyRound,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  ArrowLeft
} from "lucide-react"

import { PinSettingsDialog } from "@/components/auth/pin-settings-dialog"
import { LogoutButton } from "@/components/auth/logout-button"
import CreateUserButton from "@/components/dashboard/create-user"
import { UserPlus, Home, ScanFace } from "lucide-react"
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog"


interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()


  // Navigation Collapse State
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { user, userRole, profileLoading } = useAuth()
  const userName = user?.name || "User Profile"
  const wallet = user?.wallet ?? null

  // Get active menu list
  const getNavItems = () => {
    switch (userRole) {
      case "ADMIN":
        return [
          {
            name: "Home",
            href: "/dashboard",
            icon: Home,
          },
          {
            name: "Deliveries",
            href: "/dashboard/admin/deliveries",
            icon: Truck,
          },
          {
            name: "Finance",
            href: "/dashboard/admin/transactions",
            icon: ArrowRightLeft,
          },
          {
            name: "Attendance",
            href: "/dashboard/admin/attendance",
            icon: ScanFace,
          },
          {
            name: "Banking Services",
            href: "/dashboard/admin/banking",
            icon: IndianRupee,
          },
        ]
      case "SUPERVISOR":
        return [
          {
            name: "Home",
            href: "/dashboard",
            icon: Home,
          },
          {
            name: "Deliveries",
            href: "/dashboard/supervisor/deliveries",
            icon: Truck,
          },
          {
            name: "Finance",
            href: "/dashboard/supervisor/transactions",
            icon: ArrowRightLeft,
          },
        ]
      case "DELIVERY_MAN":
        return [
          {
            name: "My Session",
            href: "/dashboard",
            icon: Truck,
          },
          {
            name: "Transactions",
            href: "/dashboard/deliveryman/transactions",
            icon: ArrowRightLeft,
          },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const getPageTitle = () => {
    const sortedItems = [...(navItems || [])].sort((a, b) => b.href.length - a.href.length)
    const activeItem = sortedItems.find(item => pathname === item.href || pathname.startsWith(item.href + "/"))
    return activeItem ? activeItem.name : "Deliveries"
  }

  const AddUserButton = ({ isMobile = false }: { isMobile?: boolean }) => {
    const triggerContent = (
      <button
        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 group relative cursor-pointer"
      >
        <UserPlus className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-slate-600" />
        {(!collapsed || isMobile) && <span className="animate-in fade-in duration-200">Add User</span>}
        {collapsed && !isMobile && (
          <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-md">
            Add User
          </div>
        )}
      </button>
    )

    if (userRole === "ADMIN" || userRole === "SUPERVISOR") {
      return (
        <CreateUserButton>
          {triggerContent}
        </CreateUserButton>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-300 bg-white border-r border-slate-100 shadow-sm z-50 relative ${collapsed ? "w-20" : "w-64"
          }`}
      >
        {/* Floating collapse toggle, anchored to the sidebar edge so it never crowds the logo */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 z-10 w-6 h-6 flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Header/Brand */}
        <div className={`h-20 flex items-center border-b border-slate-50 ${collapsed ? "justify-center px-2" : "justify-between px-6"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-white border border-slate-100 rounded-lg flex items-center justify-center p-1.5 shadow-sm flex-shrink-0">
              <Image src="https://rajeshpharma.com/img/rp.svg" alt="Rajesh Pharma" width={28} height={28} unoptimized className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-lg text-slate-800 tracking-tight whitespace-nowrap animate-in fade-in duration-200">
                {getPageTitle()}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {profileLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg">
                <div className="w-5 h-5 rounded bg-slate-200 animate-pulse flex-shrink-0" />
                {!collapsed && (
                  <div className="h-4 bg-slate-200 rounded animate-pulse flex-1" />
                )}
              </div>
            ))
          ) : (
            <>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                const linkClassName = `flex items-center gap-3 py-3 rounded-lg font-bold text-sm transition-all duration-200 group relative ${collapsed
                  ? "justify-center px-3"
                  : `px-3 border-l-2 ${isActive ? "border-l-primary" : "border-l-transparent"}`
                  } ${isActive
                    ? "bg-primary-tint text-primary-tint-foreground"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={linkClassName}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                      }`} />
                    {!collapsed && (
                      <span className="animate-in fade-in duration-200">{item.name}</span>
                    )}

                    {/* Tooltip on Collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs font-medium rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-md">
                        {item.name}
                      </div>
                    )}
                  </Link>
                )
              })}

              {(userRole === "ADMIN" || userRole === "SUPERVISOR") && (
                <>
                  <div className="border-t border-slate-100 my-2" />
                  <AddUserButton />
                </>
              )}
            </>
          )}
        </nav>

        {/* Footer Area with Profile, PIN Settings & Logout */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-lg bg-primary-tint flex items-center justify-center text-primary-tint-foreground font-extrabold flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                {profileLoading ? (
                  <div className="space-y-2 py-0.5">
                    <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                    <div className="h-2 w-20 bg-slate-150 rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{userRole}</span>
                      {wallet !== null && (
                        <>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <span className="text-[10px] font-extrabold text-primary bg-primary-tint px-1.5 py-0.5 rounded font-mono">₹{wallet.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className={`mt-4 flex gap-2 border-t border-slate-100/80 pt-3 ${collapsed ? "flex-col items-center" : "justify-between"}`}>
            {userRole === "ADMIN" && (
              <PinSettingsDialog>
                <button
                  title="PIN Settings"
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200/40 bg-white flex items-center justify-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {!collapsed && <span className="text-xs font-bold">PIN</span>}
                </button>
              </PinSettingsDialog>
            )}

            <LogoutButton collapsed={collapsed} />
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE HEADER & DRAWER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            {pathname.split("/").length > 4 && (
              <button
                onClick={() => router.back()}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-850 active:scale-95 transition-all shadow-sm mr-1 cursor-pointer"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center p-1.5 shadow-sm">
              <Image src="https://rajeshpharma.com/img/rp.svg" alt="Rajesh Pharma" width={24} height={24} unoptimized className="w-full h-full object-contain" />
            </div>
            <span className="font-extrabold text-md text-slate-800 tracking-tight mr-auto pl-2">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[9999] lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Body */}
            <div className="relative flex flex-col w-4/5 max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300">
              {/* Close Button Row */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                <span className="font-extrabold text-lg text-slate-800 tracking-tight">Navigation</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {profileLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg">
                      <div className="w-5 h-5 rounded bg-slate-200 animate-pulse flex-shrink-0" />
                      <div className="h-4 bg-slate-200 rounded animate-pulse flex-1" />
                    </div>
                  ))
                ) : (
                  <>
                    {navItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                      const Icon = item.icon

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm transition-all duration-200 border-l-2 ${isActive
                            ? "bg-primary-tint text-primary-tint-foreground border-l-primary"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-transparent"
                            }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-slate-400"}`} />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}

                    {(userRole === "ADMIN" || userRole === "SUPERVISOR") && (
                      <>
                        <div className="border-t border-slate-100 my-2" />
                        <div onClick={() => setMobileOpen(false)}>
                          <AddUserButton isMobile={true} />
                        </div>
                      </>
                    )}
                  </>
                )}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-tint flex items-center justify-center text-primary-tint-foreground font-extrabold">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {profileLoading ? (
                      <div className="space-y-2 py-0.5">
                        <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
                        <div className="h-2 w-20 bg-slate-150 rounded animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{userRole}</span>
                          {wallet !== null && (
                            <>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-[10px] font-extrabold text-primary bg-primary-tint px-1.5 py-0.5 rounded font-mono">₹{wallet.toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3 justify-between">
                  <PinSettingsDialog>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 bg-white flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span className="text-xs font-bold">PIN Settings</span>
                    </button>
                  </PinSettingsDialog>

                  <LogoutButton />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Wrapper */}
        <main className="flex-grow min-w-0 relative pb-24 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}
