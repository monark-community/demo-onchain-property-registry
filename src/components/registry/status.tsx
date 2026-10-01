import { CircleAlertIcon, CircleCheckIcon, ClockIcon, ScaleIcon } from "lucide-react"

import type { LotStatus } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

const STYLE: Record<LotStatus, { cls: string; Icon: typeof CircleCheckIcon }> = {
  compliant: { cls: "bg-ok-surface text-primary border-transparent", Icon: CircleCheckIcon },
  variance: { cls: "bg-ok-surface text-primary border-primary/60 border-dashed", Icon: ScaleIcon },
  review: { cls: "bg-warning-surface text-warning border-warning/60 border-dashed", Icon: ClockIcon },
  violation: { cls: "bg-danger-surface text-destructive border-transparent", Icon: CircleAlertIcon },
}

export function StatusBadge({ status, label, size = "sm", className }: { status: LotStatus; label: string; size?: "sm" | "lg"; className?: string }) {
  const { cls, Icon } = STYLE[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border font-semibold whitespace-nowrap",
        size === "lg" ? "px-2.5 py-1 text-sm" : "px-1.5 py-0.5 text-xs",
        cls,
        className
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} aria-hidden="true" />
      {label}
    </span>
  )
}

/** Small swatch that mirrors how the plan draws each status. */
export function StatusSwatch({ status, className }: { status: LotStatus; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-3.5 shrink-0 rounded-[2px] border",
        status === "compliant" && "border-foreground/45 bg-card",
        status === "variance" && "border-foreground/45 bg-ok-surface",
        status === "review" && "border-dashed border-warning bg-warning-surface",
        status === "violation" &&
          "border-foreground/45 bg-[repeating-linear-gradient(45deg,var(--destructive)_0_1px,var(--danger-surface)_1px_4px)]",
        className
      )}
    />
  )
}
