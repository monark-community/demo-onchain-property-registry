"use client"

import { InfoIcon } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/** Context on demand: an info icon that reveals one short line (tap, click or keyboard). */
export function InfoTip({ label, children, className, align = "left" }: { label: string; children: React.ReactNode; className?: string; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", close)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", close)
    }
  }, [open])
  return (
    <span ref={ref} className={cn("relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <InfoIcon className="size-4" aria-hidden="true" />
      </button>
      {open ? (
        <span
          id={id}
          role="note"
          className={cn(
            "absolute top-8 z-30 w-64 max-w-[calc(100vw-2rem)] rounded-md border bg-popover p-3 text-left text-sm font-normal text-popover-foreground shadow-md",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          {children}
        </span>
      ) : null}
    </span>
  )
}
