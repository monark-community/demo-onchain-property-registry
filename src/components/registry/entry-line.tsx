import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { entryStatus } from "@/lib/demo/registry"
import type { Entry } from "@/lib/demo/types"
import { fmtDate, lt } from "@/lib/format"
import { cn } from "@/lib/utils"

const TONE = {
  pending: "text-warning",
  attested: "text-primary",
  variance: "text-primary",
  disputed: "text-destructive",
} as const

/** One compact line of a lot's record: date, title, status. */
export function EntryLine({ entry, dict, locale, asOf = null, className }: { entry: Entry; dict: Dictionary; locale: Locale; asOf?: string | null; className?: string }) {
  const status = entryStatus(entry, asOf)
  return (
    <div className={cn("grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-0.5 text-sm", className)}>
      <span className="font-mono text-xs leading-5 text-muted-foreground tabular-nums">{fmtDate(entry.effective, locale, { year: "numeric", month: "short" })}</span>
      <span className="leading-5 font-medium">{lt(entry.title, locale)}</span>
      <span />
      <span className="text-xs text-muted-foreground">
        {dict.entryType[entry.type]} · <span className={cn("font-semibold", TONE[status])}>{dict.entryStatus[status]}</span>
      </span>
    </div>
  )
}
