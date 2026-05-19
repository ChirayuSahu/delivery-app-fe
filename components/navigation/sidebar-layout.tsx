"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Truck, 
  ArrowRightLeft, 
  KeyRound, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  User,
  Activity
} from "lucide-react"

import { PinSettingsDialog } from "@/components/auth/pin-settings-dialog"
import { LogoutButton } from "@/components/auth/logout-button"
import AdminCreateUserButton from "@/components/admin/create-user"
import SupervisorCreateUserButton from "@/components/supervisor/create-user"
import { UserPlus, Home } from "lucide-react"


interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname()

  
  // Navigation Collapse State
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  
  // User profile information loaded from current pathname / context
  const [userRole, setUserRole] = useState<"ADMIN" | "SUPERVISOR" | "DELIVERY_MAN">("ADMIN")
  const [userName, setUserName] = useState("User Profile")

  useEffect(() => {
    if (pathname.includes("/dashboard/admin")) {
      setUserRole("ADMIN")
      setUserName("System Admin")
    } else if (pathname.includes("/dashboard/supervisor")) {
      setUserRole("SUPERVISOR")
      setUserName("Supervisor")
    } else if (pathname.includes("/dashboard/deliveryman")) {
      setUserRole("DELIVERY_MAN")
      setUserName("Delivery Executive")
    }
  }, [pathname])

  // Get active menu list
  const getNavItems = () => {
    switch (userRole) {
      case "ADMIN":
        return [
          {
            name: "Home",
            href: "/dashboard/admin",
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
        ]
      case "SUPERVISOR":
        return [
          {
            name: "Home",
            href: "/dashboard/supervisor",
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
            href: "/dashboard/deliveryman",
            icon: Truck,
          },
          {
            name: "Expenses",
            href: "/dashboard/deliveryman/expenses",
            icon: ArrowRightLeft,
          },
        ]
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

    if (userRole === "ADMIN") {
      return (
        <AdminCreateUserButton>
          {triggerContent}
        </AdminCreateUserButton>
      )
    }
    if (userRole === "SUPERVISOR") {
      return (
        <SupervisorCreateUserButton>
          {triggerContent}
        </SupervisorCreateUserButton>
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
        className={`hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300 bg-white border-r border-slate-100 shadow-sm z-30 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header/Brand */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center text-white font-black flex-shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-lg text-slate-800 tracking-tight whitespace-nowrap animate-in fade-in duration-200">
                {getPageTitle()}
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-green-50 text-green-700" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
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
        </nav>

        {/* Footer Area with Profile, PIN Settings & Logout */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-extrabold flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">{userRole}</p>
              </div>
            )}
          </div>
          
          {/* Action Row */}
          <div className={`mt-4 flex gap-2 border-t border-slate-100/80 pt-3 ${collapsed ? "flex-col items-center" : "justify-between"}`}>
            <PinSettingsDialog>
              <button 
                title="PIN Settings"
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-slate-200/40 bg-white flex items-center justify-center gap-1 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                {!collapsed && <span className="text-xs font-bold">PIN</span>}
              </button>
            </PinSettingsDialog>
            
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE HEADER & DRAWER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header Bar */}
        <header className="md:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-black">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-md text-slate-800 tracking-tight">
              {getPageTitle()}
            </span>
          </div>

          <button 
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
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
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                  const Icon = item.icon
                  
                  return (
                    <Link 
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
                        isActive 
                          ? "bg-green-50 text-green-700" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-green-600" : "text-slate-400"}`} />
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
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-extrabold">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase truncate">{userRole}</p>
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
        <main className="flex-grow min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
