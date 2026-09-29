"use client"

import { ArrowRightIcon, SearchIcon, SearchXIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

import { PlanLegend } from "@/components/plan/legend"
import { Plan } from "@/components/plan/plan"
import { YearScrubber } from "@/components/plan/year-scrubber"
import { EntryLine } from "@/components/registry/entry-line"
import { StatusBadge, StatusSwatch } from "@/components/registry/status"
import { pendingStructures, planLabels, useSnapshots } from "@/components/registry/use-registry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { STATUS_ORDER, endOfYear, lotEntries } from "@/lib/demo/registry"
import { useDemoState } from "@/lib/demo/store"
import type { LotStatus } from "@/lib/demo/types"
import { formatLotNumber, lotAddress, lotArea } from "@/lib/demo/world"
import { fmtArea, fmtDate, lt } from "@/lib/format"
import { cn } from "@/lib/utils"

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[,.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

export function Explorer() {
  const { dict, locale } = useI18n()
  const router = useRouter()
  const state = useDemoState()
  const [year, setYear] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<LotStatus | "all">("all")
  const [selected, setSelected] = useState<string | null>(null)
  const snaps = useSnapshots(year)
  const pending = useMemo(() => pendingStructures(snaps), [snaps])
  const asOf = endOfYear(year)

  const matches = useMemo(() => {
    const q = norm(query)
    const digits = q.replace(/\s/g, "")
    return snaps.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false
      if (!q) return true
      const addr = norm(lotAddress(s.lot))
      return addr.includes(q) || (/^\d{3,}$/.test(digits) && s.lot.id.includes(digits)) || norm(s.lot.civic) === q
    })
  }, [snaps, query, filter])
  const matchIds = new Set(matches.map((m) => m.lot.id))
  const dim = new Set(snaps.filter((s) => !matchIds.has(s.lot.id)).map((s) => s.lot.id))
  const sel = selected ? snaps.find((s) => s.lot.id === selected) : undefined

  const recent = useMemo(
    () => [...state.entries].sort((a, b) => b.anchor.at.localeCompare(a.anchor.at)).slice(0, 5),
    [state.entries]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: snaps.length }
    for (const s of snaps) c[s.status] = (c[s.status] ?? 0) + 1
    return c
  }, [snaps])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-primary">{dict.explorer.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{dict.explorer.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{dict.explorer.sub}</p>
        </div>
        <form
          role="search"
          className="lg:col-span-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (matches.length === 1) router.push(href(locale, `/app/lots/${matches[0]!.lot.id}`))
            else if (matches.length > 1) setSelected(matches[0]!.lot.id)
          }}
        >
          <label htmlFor="registry-search" className="mb-1.5 block text-sm font-medium">
            {dict.explorer.searchLabel}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="registry-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={dict.explorer.searchPlaceholder}
              className="h-11 bg-card pl-9"
              autoComplete="off"
            />
          </div>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label={dict.explorer.filterLabel}>
        {(["all", ...[...STATUS_ORDER].reverse()] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-sm border px-2.5 text-sm transition-colors",
              filter === f ? "border-foreground bg-foreground text-background" : "bg-card hover:bg-accent"
            )}
          >
            {f !== "all" ? <StatusSwatch status={f} /> : null}
            {f === "all" ? dict.explorer.filterAll : dict.status[f]}
            <span className="font-mono text-xs opacity-70">{counts[f] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-12">
        <div className="grid gap-3 lg:col-span-8">
          <Plan
            snapshots={snaps}
            labels={planLabels(dict)}
            idPrefix="explorer"
            selectedId={selected}
            onSelect={setSelected}
            pendingStructureIds={pending}
            dimLots={dim}
          />
          <YearScrubber year={year} onChange={setYear} />
          <PlanLegend dict={dict} className="text-muted-foreground" />
        </div>

        <aside className="grid content-start gap-4 lg:col-span-4" aria-live="polite">
          {sel ? (
            <div className="rounded-md border bg-card p-4">
              <p className="eyebrow text-muted-foreground">
                {dict.common.lot} {formatLotNumber(sel.lot.id)} · {dict.lot.zone} {sel.zone}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{lotAddress(sel.lot)}</h2>
              <div className="mt-2">
                <StatusBadge status={sel.status} label={dict.status[sel.status]} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{dict.statusHelp[sel.status]}</p>
              <div className="mt-3 grid gap-2.5 border-t pt-3">
                {lotEntries(state, sel.lot.id)
                  .filter((e) => asOf === null || `${e.effective}T00:00:00Z` <= asOf)
                  .slice(-3)
                  .reverse()
                  .map((e) => (
                    <EntryLine key={e.id} entry={e} dict={dict} locale={locale} asOf={asOf} />
                  ))}
              </div>
              <Button asChild className="mt-4 w-full">
                <Link href={href(locale, `/app/lots/${sel.lot.id}`)}>
                  {dict.explorer.openRecord}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{dict.explorer.selectPrompt}</div>
          )}

          <div className="rounded-md border bg-card">
            <h2 className="border-b px-4 py-3 font-semibold">{dict.explorer.recentTitle}</h2>
            {recent.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{dict.explorer.recentEmpty}</p>
            ) : (
              <ul className="divide-y">
                {recent.map((e) => {
                  const lot = snaps.find((s) => s.lot.id === e.lotId)!.lot
                  return (
                    <li key={e.id}>
                      <Link href={href(locale, `/app/lots/${e.lotId}`)} className="block px-4 py-3 transition-colors hover:bg-accent">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-medium">{lt(e.title, locale)}</span>
                          <span className="shrink-0 font-mono text-xs text-muted-foreground">{fmtDate(e.anchor.at, locale)}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{lotAddress(lot)}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <section className="mt-10" aria-labelledby="lot-list">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="lot-list" className="text-xl font-semibold">
            {dict.explorer.listTitle}
          </h2>
          <span className="font-mono text-xs text-muted-foreground">{t(dict.explorer.count, { n: matches.length })}</span>
        </div>
        {matches.length === 0 ? (
          <div className="mt-3 flex items-start gap-3 rounded-md border border-dashed p-5">
            <SearchXIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-semibold">{t(dict.explorer.noMatch, { q: query })}</p>
              <p className="mt-1 text-sm text-muted-foreground">{dict.explorer.noMatchHint}</p>
            </div>
          </div>
        ) : (
          <ul className="mt-3 grid overflow-hidden rounded-md border-t border-l sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((s) => {
              const n = lotEntries(state, s.lot.id).length
              return (
                <li key={s.lot.id} className="border-r border-b bg-card">
                  <Link
                    href={href(locale, `/app/lots/${s.lot.id}`)}
                    className="flex h-full items-start justify-between gap-3 p-3.5 transition-colors hover:bg-accent"
                  >
                    <span className="grid gap-0.5">
                      <span className="font-medium">{lotAddress(s.lot)}</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {formatLotNumber(s.lot.id)} · {s.zone} · {fmtArea(lotArea(s.lot), locale)} · {n === 1 ? dict.explorer.entryOne : t(dict.explorer.entries, { n })}
                      </span>
                    </span>
                    <StatusBadge status={s.status} label={dict.status[s.status]} />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
