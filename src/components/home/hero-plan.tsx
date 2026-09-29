"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { PlanLegend } from "@/components/plan/legend"
import { Plan } from "@/components/plan/plan"
import { YearScrubber } from "@/components/plan/year-scrubber"
import { EntryLine } from "@/components/registry/entry-line"
import { StatusBadge } from "@/components/registry/status"
import { pendingStructures, planLabels, useSnapshots } from "@/components/registry/use-registry"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { endOfYear, lotEntries } from "@/lib/demo/registry"
import { useDemoState } from "@/lib/demo/store"
import { formatLotNumber, lotAddress } from "@/lib/demo/world"

/** Hero visual: the real plan, a year scrubber, and the selected lot's latest entries. */
export function HeroPlan() {
  const { dict, locale } = useI18n()
  const [year, setYear] = useState<number | null>(null)
  const [selected, setSelected] = useState("2418305")
  const state = useDemoState()
  const snaps = useSnapshots(year)
  const pending = useMemo(() => pendingStructures(snaps), [snaps])
  const snap = snaps.find((s) => s.lot.id === selected) ?? snaps[0]!
  const asOf = endOfYear(year)
  const entries = lotEntries(state, snap.lot.id)
    .filter((e) => (asOf === null ? true : `${e.effective}T00:00:00Z` <= asOf))
    .slice(-3)
    .reverse()

  return (
    <div className="grid gap-4">
      <figure className="grid gap-3">
        <Plan
          snapshots={snaps}
          labels={planLabels(dict)}
          idPrefix="hero"
          selectedId={selected}
          onSelect={setSelected}
          pendingStructureIds={pending}
        />
        <YearScrubber year={year} onChange={setYear} />
        <figcaption className="text-xs text-muted-foreground">{dict.home.hero.planCaption}</figcaption>
      </figure>
      <div className="rounded-md border bg-card p-4" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="eyebrow text-muted-foreground">
              {dict.common.lot} {formatLotNumber(snap.lot.id)}
            </p>
            <p className="text-lg font-semibold">{lotAddress(snap.lot)}</p>
          </div>
          <StatusBadge status={snap.status} label={dict.status[snap.status]} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{dict.statusHelp[snap.status]}</p>
        <div className="mt-3 grid gap-2.5 border-t pt-3">
          {entries.map((e) => (
            <EntryLine key={e.id} entry={e} dict={dict} locale={locale} asOf={asOf} />
          ))}
        </div>
        <Link
          href={href(locale, `/app/lots/${snap.lot.id}`)}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          {dict.home.hero.openRecord}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <PlanLegend dict={dict} className="text-muted-foreground" />
    </div>
  )
}
