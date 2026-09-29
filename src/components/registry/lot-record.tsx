"use client"

import { ArrowLeftIcon, CheckIcon, FileIcon, FlagIcon, LinkIcon, PencilRulerIcon, ShieldCheckIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { useDemo } from "@/components/demo/demo-provider"
import { PlanLegend } from "@/components/plan/legend"
import { Plan } from "@/components/plan/plan"
import { YearScrubber } from "@/components/plan/year-scrubber"
import { ZoneFacts } from "@/components/registry/facts"
import { InfoTip } from "@/components/registry/info-tip"
import { ReportDialog } from "@/components/registry/report-dialog"
import { Seal } from "@/components/registry/seal"
import { Signer } from "@/components/registry/signer"
import { StatusBadge } from "@/components/registry/status"
import { pendingStructures, planLabels, useSnapshots } from "@/components/registry/use-registry"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { endOfYear, entryStatus, lotEntries, lotReports } from "@/lib/demo/registry"
import { useDemoState, useHydrated } from "@/lib/demo/store"
import type { Entry, Evidence, Report } from "@/lib/demo/types"
import { formatLotNumber, getLot, lotAddress, lotArea } from "@/lib/demo/world"
import { fmtArea, fmtBlock, fmtBytes, fmtDate, fmtDateTime, lt, short } from "@/lib/format"
import { cn } from "@/lib/utils"

type Item = { kind: "entry"; at: string; entry: Entry } | { kind: "report"; at: string; report: Report }

const FRESH_MS = 15_000

export function LotRecord({ lotId }: { lotId: string }) {
  const { dict, locale } = useI18n()
  const demo = useDemo()
  const state = useDemoState()
  const hydrated = useHydrated()
  const lot = getLot(lotId)!
  const [year, setYear] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const snaps = useSnapshots(year)
  const nowSnaps = useSnapshots(null)
  const snap = snaps.find((s) => s.lot.id === lotId)!
  const current = nowSnaps.find((s) => s.lot.id === lotId)!
  const pending = useMemo(() => pendingStructures(snaps), [snaps])
  const asOf = endOfYear(year)
  const me = hydrated ? demo.identity : null
  const isOwner = me?.address.toLowerCase() === lot.owner.toLowerCase()

  const items: Item[] = useMemo(() => {
    const list: Item[] = [
      ...lotEntries(state, lotId).map((e) => ({ kind: "entry" as const, at: e.effective, entry: e })),
      ...lotReports(state, lotId).map((r) => ({ kind: "report" as const, at: r.anchor.at.slice(0, 10), report: r })),
    ]
    return list.sort((a, b) => a.at.localeCompare(b.at))
  }, [state, lotId])

  const pad = 5
  const focus = { x: lot.rect.x - pad, y: lot.rect.y - pad, w: lot.rect.w + pad * 2, h: lot.rect.h + pad * 2 }

  function copyLink() {
    try {
      void navigator.clipboard?.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard unavailable: nothing to do.
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Link href={href(locale, "/app")} className="inline-flex min-h-9 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        {dict.lot.back}
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-muted-foreground">
            {dict.lot.lotNumber} {formatLotNumber(lot.id)} · {dict.lot.zone} {current.zone} · {dict.zone[current.zone]}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{lotAddress(lot)}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={current.status} label={dict.status[current.status]} size="lg" />
            <InfoTip label={dict.status[current.status]}>{dict.statusHelp[current.status]}</InfoTip>
          </div>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>
              {dict.lot.area} <span className="font-mono text-foreground">{fmtArea(lotArea(lot), locale)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              {dict.lot.owner} <span className="font-mono text-foreground">{short(lot.owner, 6, 4)}</span>
              {isOwner ? <span className="rounded-sm bg-accent px-1 text-xs text-foreground">{dict.common.you}</span> : null}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={href(locale, `/app/declare?lot=${lot.id}`)}>
              <PencilRulerIcon aria-hidden="true" />
              {dict.lot.declare}
            </Link>
          </Button>
          <ReportDialog
            lot={lot}
            trigger={
              <Button variant="outline">
                <FlagIcon aria-hidden="true" />
                {dict.lot.report}
              </Button>
            }
          />
          <Button variant="ghost" onClick={copyLink} aria-live="polite">
            {copied ? <CheckIcon aria-hidden="true" /> : <LinkIcon aria-hidden="true" />}
            {copied ? dict.lot.linkCopied : dict.lot.copyLink}
          </Button>
        </div>
      </div>

      {/* Plan + facts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <section className="grid content-start gap-3 lg:col-span-7" aria-labelledby="lot-plan">
          <h2 id="lot-plan" className="sr-only">
            {dict.lot.planTitle}
          </h2>
          <Plan
            snapshots={snaps}
            labels={planLabels(dict)}
            idPrefix="lot"
            focus={focus}
            selectedId={lot.id}
            envelopeFor={lot.id}
            pendingStructureIds={pending}
            showStreetNames
            className="max-h-[32rem] [&>svg]:max-h-[32rem]"
          />
          <YearScrubber year={year} onChange={setYear} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-0 w-5 border-t border-dashed border-primary" />
              {dict.plan.envelope}
            </span>
            <PlanLegend dict={dict} />
          </div>
        </section>

        <section className="grid content-start gap-4 lg:col-span-5" aria-labelledby="lot-facts">
          <div className="rounded-md border bg-card p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 id="lot-facts" className="font-semibold">
                {dict.lot.factsTitle}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">{year === null ? dict.plan.today : t(dict.plan.asOf, { year })}</span>
            </div>
            <div className="mt-4">
              <ZoneFacts metrics={snap.metrics} structures={snap.structures} excused={snap.excused} />
            </div>
          </div>
          <div className="rounded-md border bg-card p-4">
            <h2 className="font-semibold">{dict.lot.structures}</h2>
            {snap.structures.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{dict.rules.none}</p>
            ) : (
              <ul className="mt-2 divide-y text-sm">
                {snap.structures.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-3 py-2">
                    <span className="font-medium">{dict.kind[s.kind]}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {s.rect.w.toLocaleString(locale)} × {s.rect.h.toLocaleString(locale)} m · {s.storeys === 1 ? dict.lot.storeyOne : t(dict.lot.storeys, { n: s.storeys })} · {s.height.toLocaleString(locale)} m
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Record */}
      <section className="mt-10" aria-labelledby="lot-record">
        <h2 id="lot-record" className="text-2xl font-bold">
          {dict.lot.timelineTitle}
        </h2>
        {items.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed p-5 text-muted-foreground">{dict.lot.noEntries}</p>
        ) : (
          <ol className="relative mt-6 grid gap-4 border-l-2 border-border pl-5 sm:pl-7">
            {items.map((item) =>
              item.kind === "entry" ? (
                <EntryCard key={item.entry.id} entry={item.entry} dim={asOf !== null && `${item.entry.effective}T00:00:00Z` > asOf} me={me?.address} />
              ) : (
                <ReportCard key={item.report.id} report={item.report} me={me?.address} />
              )
            )}
          </ol>
        )}
      </section>
    </div>
  )
}

function EvidenceList({ evidence }: { evidence: Evidence[] }) {
    const { locale } = useI18n()
    return (
      <ul className="grid gap-1">
        {evidence.map((ev) => (
          <li key={ev.cid} className="flex flex-wrap items-center gap-x-2 text-xs">
            <FileIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium">{ev.name}</span>
            <span className="font-mono text-muted-foreground">
              {fmtBytes(ev.bytes, locale)} · {short(ev.cid, 12, 6)}
            </span>
          </li>
        ))}
      </ul>
    )
  }

function EntryCard({ entry, dim, me }: { entry: Entry; dim: boolean; me?: string }) {
    const { dict, locale } = useI18n()
    const [mountedAt] = useState(() => Date.now())
    const status = entryStatus(entry)
    const d = entry.decision
    const fresh = d ? mountedAt - Date.parse(d.anchor.at) < FRESH_MS : false
    return (
      <li className={cn("relative transition-opacity", dim && "opacity-45")}>
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-5 -left-[27px] size-3 rounded-full border-2 bg-background sm:-left-[35px]",
            status === "pending" ? "border-dashed border-warning" : status === "disputed" ? "border-destructive" : "border-primary"
          )}
        />
        <article
          className={cn(
            "rounded-md border bg-card p-4",
            status === "pending" && "border-dashed border-warning",
            status === "disputed" && "border-destructive/50"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs text-muted-foreground">
                {fmtDate(entry.effective, locale, { year: "numeric", month: "long" })} · {entry.id}
              </p>
              <h3 className="mt-1 text-lg font-semibold">{lt(entry.title, locale)}</h3>
              <p className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{dict.entryType[entry.type]}</span>
                <span>· {dict.source[entry.source]}</span>
                {entry.permit ? (
                  <span>
                    · {dict.lot.permit} <span className="font-mono">{entry.permit}</span>
                  </span>
                ) : null}
              </p>
              {entry.source !== "archive" && lt(entry.description, locale) ? <p className="mt-2 max-w-2xl text-sm">{lt(entry.description, locale)}</p> : null}
              <p className="mt-3 text-xs text-muted-foreground">{dict.lot.by}</p>
              <Signer address={entry.submitter} role={entry.role} you={me === entry.submitter} />
            </div>
            {d ? (
              <Seal
                verdict={d.verdict}
                label={dict.seal[d.verdict]}
                block={fmtBlock(d.anchor.block, locale)}
                blockLabel={dict.seal.block}
                fresh={fresh}
                className="hidden sm:block"
              />
            ) : null}
          </div>

          {d && entry.source === "archive" ? null : d ? (
            <div className={cn("mt-3 flex gap-3 rounded-sm border-l-2 bg-background p-3", d.verdict === "disputed" ? "border-destructive" : "border-primary")}>
              <Seal
                verdict={d.verdict}
                label={dict.seal[d.verdict]}
                block={fmtBlock(d.anchor.block, locale)}
                blockLabel={dict.seal.block}
                fresh={fresh}
                className="size-16 sm:hidden"
              />
              <div className="min-w-0">
                <p className={cn("text-sm font-semibold", d.verdict === "disputed" ? "text-destructive" : "text-primary")}>
                  {dict.entryStatus[d.verdict]} · {fmtDate(d.anchor.at, locale)}
                </p>
                <p className="mt-1 text-sm">{lt(d.note, locale)}</p>
                <div className="mt-2">
                  <Signer address={d.by} role={d.role} />
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-warning-surface px-2 py-1 text-xs font-semibold text-warning">
              {dict.entryStatus.pending}
            </p>
          )}

          <details className="group mt-3 border-t pt-2">
            <summary className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 text-sm font-medium text-primary">
              <ShieldCheckIcon className="size-4" aria-hidden="true" />
              {dict.lot.showDetails}
            </summary>
            <dl className="mt-2 grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-[9rem_1fr]">
              <dt className="text-muted-foreground">{dict.lot.recorded}</dt>
              <dd>{fmtDateTime(entry.anchor.at, locale)}</dd>
              <dt className="text-muted-foreground">{dict.lot.block}</dt>
              <dd className="font-mono">#{fmtBlock(entry.anchor.block, locale)}</dd>
              <dt className="text-muted-foreground">{dict.lot.tx}</dt>
              <dd className="font-mono break-all">{entry.anchor.txHash}</dd>
              <dt className="text-muted-foreground">{dict.lot.contentHash}</dt>
              <dd className="font-mono break-all">{entry.anchor.contentHash}</dd>
              {entry.evidence.length > 0 ? (
                <>
                  <dt className="text-muted-foreground">{dict.lot.evidence}</dt>
                  <dd>
                    <EvidenceList evidence={entry.evidence} />
                  </dd>
                </>
              ) : null}
            </dl>
            <Link
              href={href(locale, `/app/verify?q=${entry.id}`)}
              className="mt-2 inline-flex min-h-9 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {dict.lot.verifyThis} {entry.id}
            </Link>
          </details>
        </article>
      </li>
    )
  }

function ReportCard({ report, me }: { report: Report; me?: string }) {
    const { dict, locale } = useI18n()
    const res = report.resolution
    const state = res ? res.outcome : "open"
    return (
      <li className="relative">
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-5 -left-[27px] size-3 rotate-45 border-2 bg-background sm:-left-[35px]",
            state === "confirmed" ? "border-destructive" : state === "open" ? "border-dashed border-warning" : "border-muted-foreground"
          )}
        />
        <article className={cn("rounded-md border bg-background p-4", state === "open" && "border-dashed border-warning")}>
          <p className="font-mono text-xs text-muted-foreground">
            {fmtDate(report.anchor.at, locale)} · {report.id}
          </p>
          <h3 className="mt-1 flex items-center gap-2 font-semibold">
            <FlagIcon className="size-4 text-destructive" aria-hidden="true" />
            {dict.report.categories[report.category]}
          </h3>
          <p className="mt-2 max-w-2xl text-sm">“{lt(report.description, locale)}”</p>
          <p className="mt-3 text-xs text-muted-foreground">{dict.lot.reportedBy}</p>
          <Signer address={report.reporter} role="resident" you={me === report.reporter} />
          {report.evidence.length > 0 ? (
            <div className="mt-2">
              <EvidenceList evidence={report.evidence} />
            </div>
          ) : null}
          <p
            className={cn(
              "mt-3 rounded-sm px-2 py-1.5 text-xs",
              state === "confirmed" ? "bg-danger-surface text-destructive" : state === "open" ? "bg-warning-surface text-warning" : "bg-muted text-muted-foreground"
            )}
          >
            <span className="font-semibold">{dict.lot.resolution[state]}</span>
            {res ? (
              <>
                {" "}
                · {fmtDate(res.anchor.at, locale)} · {lt(res.note, locale)}
              </>
            ) : null}
          </p>
        </article>
      </li>
    )
}
