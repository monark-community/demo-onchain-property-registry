"use client"

import { ArrowRightIcon, FileIcon, FlagIcon, InboxIcon } from "lucide-react"
import Link from "next/link"
import { useMemo, useRef, useState } from "react"

import { useDemo, useTransaction } from "@/components/demo/demo-provider"
import { Disclaimer } from "@/components/demo/disclaimer"
import { TxFeedback } from "@/components/demo/tx-feedback"
import { Plan } from "@/components/plan/plan"
import { ZoneFacts } from "@/components/registry/facts"
import { Seal } from "@/components/registry/seal"
import { Signer } from "@/components/registry/signer"
import { StatusBadge } from "@/components/registry/status"
import { pendingStructures, planLabels, useSnapshots } from "@/components/registry/use-registry"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { decideEntry, resolveReport } from "@/lib/demo/ops"
import { isPending, newBreaches } from "@/lib/demo/registry"
import { getState, setState, useDemoState, useHydrated } from "@/lib/demo/store"
import type { Entry, Hex, Report, Verdict } from "@/lib/demo/types"
import { KARIM, formatLotNumber, getLot, lotAddress } from "@/lib/demo/world"
import { fmtBytes, fmtDate, fmtList, lt, short } from "@/lib/format"
import { cn } from "@/lib/utils"

type Sel = { kind: "entry"; id: string } | { kind: "report"; id: string }
type Outcome = { key: Verdict | "confirmed" | "dismissed"; block: number; txHash: string; lotId: string }

export function ReviewQueue() {
  const { dict, locale } = useI18n()
  const demo = useDemo()
  const hydrated = useHydrated()
  const state = useDemoState()
  const tx = useTransaction()
  const snaps = useSnapshots(null)
  const pending = useMemo(() => pendingStructures(snaps), [snaps])
  const me = hydrated ? demo.identity : null
  const isInspector = me?.role === "inspector"

  const entries = useMemo(() => state.entries.filter((e) => isPending(e)).sort((a, b) => a.anchor.at.localeCompare(b.anchor.at)), [state.entries])
  const reports = useMemo(() => state.reports.filter((r) => !r.resolution).sort((a, b) => a.anchor.at.localeCompare(b.anchor.at)), [state.reports])
  const [tab, setTab] = useState<"entries" | "reports">("entries")
  const [sel, setSel] = useState<Sel | null>(null)
  const [note, setNote] = useState("")
  const [noteError, setNoteError] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const list = tab === "entries" ? entries : reports
  const effectiveSel: Sel | null = sel ?? (list[0] ? { kind: tab === "entries" ? "entry" : "report", id: list[0].id } : null)
  const entry = effectiveSel?.kind === "entry" ? state.entries.find((e) => e.id === effectiveSel.id) : undefined
  const report = effectiveSel?.kind === "report" ? state.reports.find((r) => r.id === effectiveSel.id) : undefined
  const item = entry ?? report
  const lot = item ? getLot(item.lotId)! : undefined
  const check = entry && lot ? newBreaches(state, lot, entry) : null

  const panel = useRef<HTMLDivElement>(null)
  const showPanel = () => {
    // On narrow screens the panel sits under the queue: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) window.setTimeout(() => panel.current?.scrollIntoView({ block: "start" }), 50)
  }

  function select(s: Sel) {
    if (tx.busy) return
    setSel(s)
    setNote("")
    setNoteError(false)
    setOutcome(null)
    tx.reset()
    showPanel()
  }

  async function decide(key: Outcome["key"]) {
    if (!item || !lot || !me) return
    if ((key === "disputed" || key === "dismissed") && note.trim().length < 4) {
      setNoteError(true)
      return
    }
    setNoteError(false)
    const isEntry = !!entry
    const action = key === "disputed" ? dict.wallet.actions.dispute : isEntry ? dict.wallet.actions.attest : dict.wallet.actions.resolve
    const verdictLabel = isEntry ? dict.entryStatus[key as Verdict] : key === "confirmed" ? dict.review.confirm : dict.review.dismiss
    const noteText = note.trim() || verdictLabel
    const ok = await tx.run(
      {
        action,
        lines: [
          { label: dict.common.lot, value: `${lotAddress(lot)} · ${formatLotNumber(lot.id)}` },
          { label: isEntry ? dict.verify.fields.entry : dict.report.title, value: item.id, mono: true },
          { label: dict.lot.decision, value: verdictLabel },
        ],
      },
      () => {
        if (isEntry) {
          const rules = key === "variance" ? check?.added : undefined
          setState((s) => decideEntry(s, item.id, { verdict: key as Verdict, by: me.address as Hex, role: "inspector", note: noteText, rules }))
          const d = getState().entries.find((e) => e.id === item.id)!.decision!
          setOutcome({ key, block: d.anchor.block, txHash: d.anchor.txHash, lotId: lot.id })
          return d.anchor.block
        }
        setState((s) => resolveReport(s, item.id, { outcome: key as "confirmed" | "dismissed", by: me.address as Hex, note: noteText }))
        const r = getState().reports.find((x) => x.id === item.id)!.resolution!
        setOutcome({ key, block: r.anchor.block, txHash: r.anchor.txHash, lotId: lot.id })
        return r.anchor.block
      }
    )
    if (ok) showPanel()
  }

  const focus = lot ? { x: lot.rect.x - 4, y: lot.rect.y - 4, w: lot.rect.w + 8, h: lot.rect.h + 8 } : undefined
  const highlight = new Set<string>(
    entry ? entry.changes.flatMap((c) => (c.op === "add" ? [c.structure.id] : c.op === "modify" || c.op === "remove" ? [c.structureId] : [])) : []
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-primary">{dict.review.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{dict.review.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{dict.review.sub}</p>
        </div>
        {hydrated && !isInspector ? (
          <div className="flex max-w-md flex-col gap-2 rounded-md border border-dashed bg-card p-3 text-sm">
            <p>{dict.review.needInspector}</p>
            <Button size="sm" className="self-start" onClick={() => void demo.connectAs(KARIM)}>
              {dict.wallet.switch}: Karim Haddad
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Queue */}
        <div className="lg:col-span-4">
          <div role="tablist" aria-label={dict.review.title} className="grid grid-cols-2 rounded-md border bg-card p-1">
            {(["entries", "reports"] as const).map((k) => (
              <button
                key={k}
                role="tab"
                type="button"
                aria-selected={tab === k}
                onClick={() => {
                  setTab(k)
                  setSel(null)
                  setOutcome(null)
                  tx.reset()
                }}
                className={cn("inline-flex min-h-9 items-center justify-center gap-2 rounded-sm text-sm font-medium", tab === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
              >
                {dict.review.tabs[k]}
                <span className="font-mono text-xs opacity-80">{k === "entries" ? entries.length : reports.length}</span>
              </button>
            ))}
          </div>
          {list.length === 0 && !outcome ? (
            <div className="mt-3 flex flex-col items-start gap-2 rounded-md border border-dashed p-5 text-sm text-muted-foreground">
              <InboxIcon className="size-5" aria-hidden="true" />
              {dict.review.empty}
            </div>
          ) : (
            <ul className="mt-3 grid gap-2" role="tabpanel">
              {list.map((x) => {
                const l = getLot(x.lotId)!
                const active = effectiveSel?.id === x.id
                const isE = "type" in x
                return (
                  <li key={x.id}>
                    <button
                      type="button"
                      onClick={() => select({ kind: isE ? "entry" : "report", id: x.id })}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "w-full rounded-md border p-3 text-left transition-colors",
                        active ? "border-primary bg-ok-surface" : "border-dashed border-warning bg-card hover:bg-accent"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
                        <span>{x.id}</span>
                        <span>{t(dict.review.waiting, { date: fmtDate(x.anchor.at, locale) })}</span>
                      </span>
                      <span className="mt-1 block font-semibold">
                        {isE ? lt((x as Entry).title, locale) : dict.report.categories[(x as Report).category]}
                      </span>
                      <span className="block text-sm text-muted-foreground">{lotAddress(l)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Panel */}
        <div ref={panel} className="scroll-mt-20 lg:col-span-8">
          {outcome ? (
            <div className="grid gap-4 rounded-md border border-primary bg-card p-5" role="status">
              <div className="flex items-center gap-5">
                <Seal
                  verdict={outcome.key === "disputed" || outcome.key === "confirmed" ? "disputed" : outcome.key === "variance" ? "variance" : "attested"}
                  label={dict.seal[outcome.key]}
                  block={outcome.block.toLocaleString(locale)}
                  blockLabel={dict.seal.block}
                  fresh
                />
                <div>
                  <p className="text-lg font-semibold">{t(dict.review.decided[outcome.key], { block: outcome.block.toLocaleString(locale) })}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{lotAddress(getLot(outcome.lotId)!)}</p>
                  <StatusBadge
                    className="mt-2"
                    status={snaps.find((s) => s.lot.id === outcome.lotId)!.status}
                    label={dict.status[snaps.find((s) => s.lot.id === outcome.lotId)!.status]}
                  />
                </div>
              </div>
              <TxFeedback phase={tx.phase} stage={tx.stage} txHash={outcome.txHash} confirmed={t(dict.tx.confirmed, { block: outcome.block.toLocaleString(locale) })} />
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={href(locale, `/app/lots/${outcome.lotId}`)}>
                    {dict.review.openLot}
                    <ArrowRightIcon aria-hidden="true" />
                  </Link>
                </Button>
                {list.length > 0 ? (
                  <Button variant="outline" onClick={() => select({ kind: tab === "entries" ? "entry" : "report", id: list[0]!.id })}>
                    {dict.common.continue}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : !item || !lot ? (
            <div className="rounded-md border border-dashed p-6 text-muted-foreground">{list.length ? dict.review.select : dict.review.empty}</div>
          ) : (
            <article className="grid gap-5 rounded-md border bg-card p-5">
              <header>
                <p className="eyebrow text-muted-foreground">
                  {item.id} · {dict.common.lot} {formatLotNumber(lot.id)}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {entry ? lt(entry.title, locale) : dict.report.categories[report!.category]}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {lotAddress(lot)}
                  {entry ? ` · ${dict.entryType[entry.type]} · ${fmtDate(entry.effective, locale)}` : ` · ${dict.review.reportFrom}`}
                  {entry?.permit ? ` · ${dict.lot.permit} ${entry.permit}` : ""}
                </p>
              </header>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="grid content-start gap-3">
                  <Plan
                    snapshots={snaps}
                    labels={planLabels(dict)}
                    idPrefix="review"
                    focus={focus}
                    selectedId={lot.id}
                    envelopeFor={lot.id}
                    pendingStructureIds={pending}
                    highlightIds={highlight}
                  />
                </div>
                <div className="grid content-start gap-4">
                  {lt(entry ? entry.description : report!.description, locale) ? (
                    <p className="text-sm">{lt(entry ? entry.description : report!.description, locale)}</p>
                  ) : null}
                  <div>
                    <p className="text-xs text-muted-foreground">{entry ? dict.lot.by : dict.lot.reportedBy}</p>
                    <Signer address={entry ? entry.submitter : report!.reporter} role={entry ? entry.role : "resident"} />
                  </div>
                  {(entry ?? report)!.evidence.length > 0 ? (
                    <div>
                      <p className="text-xs text-muted-foreground">{dict.lot.evidence}</p>
                      <ul className="mt-1 grid gap-1">
                        {(entry ?? report)!.evidence.map((ev) => (
                          <li key={ev.cid} className="flex flex-wrap items-center gap-x-2 text-xs">
                            <FileIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                            <span className="font-medium">{ev.name}</span>
                            <span className="font-mono text-muted-foreground">
                              {fmtBytes(ev.bytes, locale)} · {short(ev.cid, 10, 6)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {check ? (
                    <div className="rounded-md border bg-background p-3">
                      <p className={cn("text-sm font-semibold", check.added.length ? "text-destructive" : "text-primary")}>
                        {check.added.length ? t(dict.review.newBreaches, { rules: fmtList(check.added.map((r) => dict.rules[r]), locale) }) : dict.review.fitsZone}
                      </p>
                      <div className="mt-3">
                        <ZoneFacts metrics={check.after} structures={snaps.find((s) => s.lot.id === lot.id)!.structures} compact />
                      </div>
                    </div>
                  ) : (
                    <p className="flex items-start gap-2 rounded-md bg-warning-surface p-3 text-sm text-warning">
                      <FlagIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {dict.review.confirmHelp}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-1.5 border-t pt-4">
                <Label htmlFor="review-note">{dict.review.note}</Label>
                <Textarea
                  id="review-note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={dict.review.notePlaceholder}
                  aria-invalid={noteError || undefined}
                  aria-describedby={noteError ? "review-note-error" : undefined}
                  disabled={!isInspector}
                />
                {noteError ? (
                  <p id="review-note-error" className="text-xs text-destructive">
                    {dict.review.noteRequired}
                  </p>
                ) : null}
                {check && check.added.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {t(dict.review.varianceHelp, { rules: fmtList(check.added.map((r) => dict.rules[r]), locale) })}
                  </p>
                ) : null}
              </div>

              <TxFeedback phase={tx.phase} stage={tx.stage} />

              {!isInspector ? (
                <p className="text-sm text-muted-foreground">{dict.review.readOnly}</p>
              ) : (
                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    {entry ? (
                      <>
                        <Button onClick={() => void decide(check && check.added.length ? "variance" : "attested")} disabled={tx.busy}>
                          {check && check.added.length ? dict.review.variance : dict.review.attest}
                        </Button>
                        <Button variant="outline" onClick={() => void decide("disputed")} disabled={tx.busy} className="border-destructive/50 text-destructive hover:text-destructive">
                          {dict.review.dispute}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => void decide("confirmed")} disabled={tx.busy}>
                          {dict.review.confirm}
                        </Button>
                        <Button variant="outline" onClick={() => void decide("dismissed")} disabled={tx.busy}>
                          {dict.review.dismiss}
                        </Button>
                      </>
                    )}
                  </div>
                  <Disclaimer />
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </div>
  )
}
