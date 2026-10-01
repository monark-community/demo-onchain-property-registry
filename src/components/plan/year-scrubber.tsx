"use client"

import { Slider } from "@/components/ui/slider"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { FIRST_YEAR, LAST_YEAR } from "@/lib/demo/registry"
import { cn } from "@/lib/utils"

/** Marks drawn under the track: the years when something happened. */
const MARKS = [1931, 1951, 1962, 1974, 1988, 2016, 2019, 2022, 2024]

/**
 * `year === null` means "today" (the slider's last notch), so pending entries
 * anchored this year show up.
 */
export function YearScrubber({
  year,
  onChange,
  marks = MARKS,
  className,
}: {
  year: number | null
  onChange: (year: number | null) => void
  marks?: number[]
  className?: string
}) {
  const { dict } = useI18n()
  const max = LAST_YEAR + 1
  const value = year ?? max
  const label = year === null ? dict.plan.today : t(dict.plan.asOf, { year })
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="min-w-24 shrink-0">
        <span className="eyebrow block text-muted-foreground">{dict.plan.year}</span>
        <output className="font-mono text-lg font-medium tabular-nums" aria-live="polite">
          {label}
        </output>
      </div>
      <div className="relative flex-1 pb-4">
        <Slider
          min={FIRST_YEAR}
          max={max}
          step={1}
          value={[value]}
          onValueChange={([v]) => onChange(v === undefined || v >= max ? null : v)}
          thumbLabel={dict.plan.yearLabel}
          thumbValueText={label}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-2.5 top-4 h-3">
          {marks.map((m) => (
            <span
              key={m}
              className="absolute top-0 h-1.5 w-px bg-muted-foreground/60"
              style={{ left: `${((m - FIRST_YEAR) / (max - FIRST_YEAR)) * 100}%` }}
            />
          ))}
          <span className="absolute top-2 left-0 -translate-x-1/2 font-mono text-[10px] text-muted-foreground">{FIRST_YEAR}</span>
          <span className="absolute top-2 right-0 translate-x-1/2 font-mono text-[10px] text-muted-foreground">{dict.plan.today}</span>
        </div>
      </div>
    </div>
  )
}
