"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export type UserRole = "ADMIN" | "SUPERVISOR" | "DELIVERY_MAN"

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  esId?: string
  role: UserRole
  wallet: number | null
  permissions?: string[]
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: UserProfile | null
  userRole: UserRole | null
  profileLoading: boolean
  refreshProfile: () => Promise<void>
  clearAuth: () => void
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/users/me")
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setUser(json.data)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error("Failed to load user profile in AuthProvider:", err)
      setUser(null)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const clearAuth = useCallback(() => {
    setUser(null)
  }, [])

  const hasPermission = useCallback((permission: string) => {
    if (!user || !user.permissions) return false
    return user.permissions.includes(permission)
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole: user ? user.role : null,
        profileLoading,
        refreshProfile: fetchProfile,
        clearAuth,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
