"use client"

import { InfoIcon } from "lucide-react"

import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"

/** Guidelines §11: shown next to every signing action. */
export function Disclaimer({ className, fee = true }: { className?: string; fee?: boolean }) {
  const { dict } = useI18n()
  return (
    <p className={cn("flex items-start gap-1.5 text-xs text-muted-foreground", className)}>
      <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
      <span>
        {dict.common.signingNotice}
        {fee ? ` · ${dict.common.feeSponsored}` : null}
      </span>
    </p>
  )
}
