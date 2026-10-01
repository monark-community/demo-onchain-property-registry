import { StatusSwatch } from "@/components/registry/status"
import type { Dictionary } from "@/i18n"
import { STATUS_ORDER } from "@/lib/demo/registry"
import { cn } from "@/lib/utils"

export function PlanLegend({ dict, className, extra = true }: { dict: Dictionary; className?: string; extra?: boolean }) {
  return (
    <div className={cn("text-xs", className)}>
      <h3 className="sr-only">{dict.plan.legendTitle}</h3>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {[...STATUS_ORDER].reverse().map((s) => (
          <li key={s} className="inline-flex items-center gap-1.5">
            <StatusSwatch status={s} />
            {dict.status[s]}
          </li>
        ))}
        {extra ? (
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block size-3.5 rounded-[2px] border border-dashed border-warning bg-warning-surface" />
            {dict.plan.footprintPending}
          </li>
        ) : null}
      </ul>
    </div>
  )
}
