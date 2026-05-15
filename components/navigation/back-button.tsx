"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackButtonProps {
  className?: string
  variant?: "ghost" | "outline" | "default" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

export function BackButton({ 
  className, 
  variant = "ghost", 
  size = "icon",
  children 
}: BackButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => router.back()}
      className={cn("rounded-full", className)}
      aria-label="Go back"
      haptic="medium"
    >
      {children || <ArrowLeft className="w-5 h-5 text-slate-600" />}
    </Button>
  )
}
