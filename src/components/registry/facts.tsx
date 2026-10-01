"use client"

import type { Metrics } from "@/lib/demo/registry"
import type { Rule, Structure } from "@/lib/demo/types"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { fmtMetres, fmtNumber, fmtPct } from "@/lib/format"
import { cn } from "@/lib/utils"

/** A bar with the zone's limit drawn as a line; turns brick past it. */
export function Meter({ value, max, scale, label, valueText, limitText, excused }: { value: number; max: number; scale: number; label: string; valueText: string; limitText: string; excused?: boolean }) {
  const over = value > max + 1e-6
  const pct = Math.min(100, (value / scale) * 100)
  const limit = Math.min(100, (max / scale) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("font-mono tabular-nums", over && !excused ? "font-semibold text-destructive" : over ? "text-primary" : "")}>
          {valueText} <span className="text-muted-foreground">/ {limitText}</span>
        </span>
      </div>
      <div
        className="relative mt-1.5 h-2.5 rounded-sm bg-muted"
        role="meter"
        aria-label={label}
        aria-valuenow={Number(value.toFixed(3))}
        aria-valuemin={0}
        aria-valuemax={scale}
        aria-valuetext={`${valueText} / ${limitText}`}
      >
        <div
          className={cn("h-full rounded-sm transition-[width] duration-300", over && !excused ? "bg-destructive" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
        <div className="absolute -top-1 -bottom-1 w-0.5 bg-foreground" style={{ left: `calc(${limit}% - 1px)` }} />
      </div>
    </div>
  )
}

/** Coverage, height, units and the tightest setback, measured against the zone. */
export function ZoneFacts({ metrics, structures, excused = [], compact }: { metrics: Metrics; structures: Structure[]; excused?: Rule[]; compact?: boolean }) {
  const { dict, locale } = useI18n()
  const z = metrics.zone
  const sb = metrics.setback
  const sbStruct = sb ? structures.find((s) => s.id === sb.structureId) : undefined
  const sbOver = metrics.breaches.includes("setback")
  return (
    <div className={cn("grid", compact ? "gap-3" : "gap-4")}>
      <Meter
        label={dict.rules.coverage}
        value={metrics.coverage}
        max={z.maxCoverage}
        scale={Math.max(z.maxCoverage * 1.5, metrics.coverage * 1.05)}
        valueText={fmtPct(metrics.coverage, locale)}
        limitText={t(dict.rules.max, { value: fmtPct(z.maxCoverage, locale, 0) })}
        excused={excused.includes("coverage")}
      />
      <Meter
        label={dict.rules.height}
        value={metrics.height}
        max={z.maxHeight}
        scale={Math.max(z.maxHeight * 1.4, metrics.height * 1.05)}
        valueText={fmtMetres(metrics.height, locale)}
        limitText={t(dict.rules.max, { value: fmtMetres(z.maxHeight, locale, 0) })}
        excused={excused.includes("height")}
      />
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{dict.rules.units}</span>
        <span className={cn("font-mono tabular-nums", metrics.breaches.includes("units") && !excused.includes("units") && "font-semibold text-destructive")}>
          {fmtNumber(metrics.units, locale)} <span className="text-muted-foreground">/ {t(dict.rules.max, { value: z.maxUnits })}</span>
        </span>
      </div>
      <div className="text-sm">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium">{dict.rules.setback}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {fmtMetres(z.setbacks.front, locale)} / {fmtMetres(z.setbacks.side, locale)} / {fmtMetres(z.setbacks.rear, locale)}
          </span>
        </div>
        {sb && sbStruct ? (
          <p className={cn("mt-1 text-xs", sbOver && !excused.includes("setback") ? "font-semibold text-destructive" : sbOver ? "text-primary" : "text-muted-foreground")}>
            {t(dict.rules.setbackDetail, {
              kind: dict.kind[sbStruct.kind],
              line: dict.rules.line[sb.line],
              distance: fmtMetres(sb.distance, locale),
              required: fmtMetres(sb.required, locale),
            })}
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{dict.rules.none}</p>
        )}
      </div>
    </div>
  )
}
