"use client"

import { useRouter } from "next/navigation"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface HomeButtonProps {
  className?: string
  variant?: "ghost" | "outline" | "default" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  href?: string
}

export function HomeButton({ 
  className, 
  variant = "ghost", 
  size = "icon",
  href = "/dashboard"
}: HomeButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.push(href)}
      className={cn("rounded-full", className)}
      aria-label="Go home"
      haptic="medium"
    >
      <Home className="w-5 h-5 text-slate-600" />
    </Button>
  )
}
