"use client"

import { CircleXIcon, Loader2Icon, RotateCcwIcon, UndoIcon } from "lucide-react"

import type { TxPhase } from "@/components/demo/demo-provider"
import { Button } from "@/components/ui/button"
import { TxStatus } from "@/components/ui/tx-status"
import { useI18n } from "@/i18n/client"
import type { Stage } from "@/lib/demo/chain"
import { cn } from "@/lib/utils"

/** Inline transaction state, placed next to the action that started it. */
export function TxFeedback({
  phase,
  stage,
  txHash,
  confirmed,
  onRetry,
  className,
}: {
  phase: TxPhase
  stage: Stage | null
  txHash?: string
  confirmed?: React.ReactNode
  onRetry?: () => void
  className?: string
}) {
  const { dict } = useI18n()
  if (phase === "idle" || phase === "signing") return null
  return (
    <div className={cn("grid gap-2", className)} role="status" aria-live="polite">
      {phase === "pending" ? (
        <div className="rounded-md border border-dashed border-warning bg-warning-surface p-3 text-sm text-warning">
          <p className="flex items-center gap-2 font-semibold">
            <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
            {dict.tx.waiting}
          </p>
          <p className="mt-1 text-xs">{stage === "included" ? dict.tx.included : dict.tx.broadcast}</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-warning/20">
            <div className="progress-slide h-full w-2/5 bg-warning" />
          </div>
        </div>
      ) : null}
      {phase === "confirmed" && txHash ? <TxStatus status="confirmed" hash={txHash} label={confirmed} className="w-full flex-wrap bg-ok-surface" /> : null}
      {phase === "failed" ? (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-destructive/40 bg-danger-surface p-3 text-sm text-destructive">
          <p className="flex items-start gap-2">
            <CircleXIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {dict.tx.failed}
          </p>
          {onRetry ? (
            <Button size="sm" variant="outline" onClick={onRetry} className="bg-card">
              <RotateCcwIcon aria-hidden="true" />
              {dict.common.retry}
            </Button>
          ) : null}
        </div>
      ) : null}
      {phase === "rejected" ? (
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border bg-muted p-3 text-sm">
          <p className="flex items-start gap-2 text-muted-foreground">
            <UndoIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {dict.tx.rejected}
          </p>
          {onRetry ? (
            <Button size="sm" variant="outline" onClick={onRetry} className="bg-card">
              {dict.common.retry}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
