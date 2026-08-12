import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold w-fit whitespace-nowrap border",
  {
    variants: {
      tone: {
        success: "bg-primary-tint text-primary-tint-foreground border-primary/20",
        warning: "bg-amber-50 text-amber-700 border-amber-100",
        danger: "bg-red-50 text-red-700 border-red-100",
        neutral: "bg-slate-100 text-slate-600 border-slate-200",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

const dotVariants = cva("h-1 w-1 rounded-full flex-shrink-0", {
  variants: {
    tone: {
      success: "bg-primary",
      warning: "bg-amber-500",
      danger: "bg-red-500",
      neutral: "bg-slate-400",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
})

function StatusPill({
  className,
  tone,
  pulse = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusPillVariants> & { pulse?: boolean }) {
  return (
    <span
      data-slot="status-pill"
      className={cn(statusPillVariants({ tone }), className)}
      {...props}
    >
      <span className={cn(dotVariants({ tone }), pulse && "animate-pulse")} />
      {children}
    </span>
  )
}

export { StatusPill, statusPillVariants }
