"use client"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  HammerIcon,
  HomeIcon,
  Layers2Icon,
  Trash2Icon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"

import { useDemo, useTransaction } from "@/components/demo/demo-provider"
import { InfoTip } from "@/components/registry/info-tip"
import { TxFeedback } from "@/components/demo/tx-feedback"
import { Plan } from "@/components/plan/plan"
import { EvidencePicker } from "@/components/registry/evidence-picker"
import { ZoneFacts } from "@/components/registry/facts"
import { ReportDialog } from "@/components/registry/report-dialog"
import { pendingStructures, planLabels, useSnapshots } from "@/components/registry/use-registry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { addEntry, draftEntry } from "@/lib/demo/ops"
import { applyEntries, lotEntries, measure } from "@/lib/demo/registry"
import { getState, setState, useDemoState, useHydrated } from "@/lib/demo/store"
import type { Change, Entry, EntryType, Evidence, Hex, Lot, Rect, Structure, StructureKind } from "@/lib/demo/types"
import { KARIM, LOTS, formatLotNumber, getLot, lotAddress, place } from "@/lib/demo/world"
import { fmtList, fmtPct, short } from "@/lib/format"
import { cn } from "@/lib/utils"

type DeclType = Exclude<EntryType, "construction" | "zoning">
const TYPES: { type: DeclType; Icon: typeof HomeIcon }[] = [
  { type: "extension", Icon: HomeIcon },
  { type: "accessory", Icon: WarehouseIcon },
  { type: "storey", Icon: Layers2Icon },
  { type: "units", Icon: UsersIcon },
  { type: "renovation", Icon: HammerIcon },
  { type: "demolition", Icon: Trash2Icon },
]
const ACCESSORY_KINDS = ["shed", "garage", "workshop"] as const
const MAIN = new Set<StructureKind>(["house", "apartment", "commercial", "warehouse"])

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
const num = (s: string) => Number(s.replace(",", "."))
const rnd = () => Math.random().toString(36).slice(2, 7)

function lotDims(lot: Lot) {
  return lot.frontage === "north" || lot.frontage === "south" ? { width: lot.rect.w, depth: lot.rect.h } : { width: lot.rect.h, depth: lot.rect.w }
}

function extensionRect(lot: Lot, main: Rect, w: number, d: number): Rect {
  switch (lot.frontage) {
    case "south":
      return { x: main.x, y: main.y - d, w, h: d }
    case "north":
      return { x: main.x, y: main.y + main.h, w, h: d }
    case "west":
      return { x: main.x + main.w, y: main.y, w: d, h: w }
    case "east":
      return { x: main.x - d, y: main.y, w: d, h: w }
  }
}

interface Form {
  type: DeclType | null
  width: string
  depth: string
  height: string
  storeys: string
  units: string
  kind: (typeof ACCESSORY_KINDS)[number]
  corner: "left" | "right"
  fromSide: string
  fromRear: string
  structureId: string
  date: string
  permit: string
  title: string
  description: string
  evidence: Evidence[]
}

export function DeclareFlow() {
  const { dict, locale } = useI18n()
  const params = useSearchParams()
  const router = useRouter()
  const demo = useDemo()
  const hydrated = useHydrated()
  const state = useDemoState()
  const tx = useTransaction()
  const me = hydrated ? demo.identity : null
  const myLot = me ? LOTS.find((l) => l.owner.toLowerCase() === me.address.toLowerCase()) : undefined
  const [lotChoice, setLotChoice] = useState<string | null>(null)
  const lotId = lotChoice ?? params.get("lot") ?? myLot?.id ?? "2418303"
  const lot = getLot(lotId) ?? getLot("2418303")!
  const isOwner = !!me && me.address.toLowerCase() === lot.owner.toLowerCase()

  const [step, setStep] = useState(0)
  const [seed] = useState(rnd)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ id: string; txHash: string } | null>(null)
  const [f, setF] = useState<Form>({
    type: null,
    width: "6",
    depth: "4",
    height: "3.5",
    storeys: "2",
    units: "2",
    kind: "shed",
    corner: "left",
    fromSide: "1.5",
    fromRear: "1.5",
    structureId: "",
    date: today(),
    permit: "",
    title: "",
    description: "",
    evidence: [],
  })
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((prev) => ({ ...prev, [k]: v }))

  // Current state of the lot (every entry, pending included).
  const current = useMemo(() => applyEntries(lot.id, lotEntries(state, lot.id)), [state, lot.id])
  const main = current.structures.find((s) => MAIN.has(s.kind)) ?? current.structures[0]
  const snaps = useSnapshots(null)
  const pending = useMemo(() => pendingStructures(snaps), [snaps])

  // Build the changes from the form.
  const built = useMemo((): { changes: Change[]; draft: Structure[]; highlight: string[]; problem: string | null } => {
    const w = num(f.width)
    const d = num(f.depth)
    const h = num(f.height)
    const sizeOk = w >= 1 && w <= 60 && d >= 1 && d <= 60
    const heightOk = h >= 2 && h <= 25
    switch (f.type) {
      case "extension": {
        if (!sizeOk) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.size }
        if (!heightOk) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.height }
        if (!main) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.structure }
        const s: Structure = { id: `${lot.id}-extension-${seed}`, kind: "extension", rect: extensionRect(lot, main.rect, w, d), storeys: 1, height: h, units: 0 }
        return { changes: [{ op: "add", structure: s }], draft: [s], highlight: [], problem: null }
      }
      case "accessory": {
        if (!sizeOk) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.size }
        if (!heightOk) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.height }
        const dims = lotDims(lot)
        const side = Math.max(0, num(f.fromSide) || 0)
        const rear = Math.max(0, num(f.fromRear) || 0)
        const front = dims.depth - rear - d
        const fromLeft = f.corner === "left" ? side : dims.width - side - w
        const s: Structure = { id: `${lot.id}-${f.kind}-${seed}`, kind: f.kind, rect: place(lot, front, fromLeft, w, d), storeys: 1, height: h, units: 0 }
        return { changes: [{ op: "add", structure: s }], draft: [s], highlight: [], problem: null }
      }
      case "storey": {
        if (!main) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.structure }
        if (!heightOk) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.height }
        return {
          changes: [{ op: "modify", structureId: main.id, patch: { storeys: Math.max(1, Math.round(num(f.storeys))), height: h } }],
          draft: [],
          highlight: [main.id],
          problem: null,
        }
      }
      case "units": {
        const u = Math.round(num(f.units))
        if (!main || !(u >= 0 && u <= 40)) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.units }
        return { changes: [{ op: "modify", structureId: main.id, patch: { units: u } }], draft: [], highlight: [main.id], problem: null }
      }
      case "renovation":
        return { changes: [], draft: [], highlight: [], problem: null }
      case "demolition": {
        const target = current.structures.find((s) => s.id === f.structureId)
        if (!target) return { changes: [], draft: [], highlight: [], problem: dict.declare.validation.structure }
        return { changes: [{ op: "remove", structureId: target.id }], draft: [], highlight: [target.id], problem: null }
      }
      default:
        return { changes: [], draft: [], highlight: [], problem: null }
    }
  }, [f, lot, main, seed, current.structures, dict])

  const before = useMemo(() => measure(lot, current.structures, current.zone), [lot, current])
  const after = useMemo(() => {
    const a = applyEntries(lot.id, [...lotEntries(state, lot.id), { changes: built.changes } as Pick<Entry, "changes"> as Entry])
    return { ...measure(lot, a.structures, a.zone), structures: a.structures }
  }, [lot, state, built.changes])
  const newBreaches = after.breaches.filter((b) => !before.breaches.includes(b))

  const defaultTitle = (() => {
    if (!f.type) return ""
    const kindName = f.type === "accessory" ? dict.declare.accessoryKinds[f.kind] : f.type === "demolition" ? dict.kind[current.structures.find((s) => s.id === f.structureId)?.kind ?? "shed"] : ""
    return t(dict.declare.defaults[f.type], { kind: kindName })
  })()
  const title = f.title.trim() || defaultTitle

  const input = () => ({
    lotId: lot.id,
    type: f.type!,
    effective: f.date || today(),
    title,
    description: f.description.trim(),
    changes: built.changes,
    permit: f.permit.trim() || undefined,
    evidence: f.evidence,
    submitter: me!.address as Hex,
    role: "owner" as const,
  })

  const preview = f.type && me ? draftEntry(state, input()) : null
  const stepNames = [dict.declare.steps.what, dict.declare.steps.details, dict.declare.steps.evidence, dict.declare.steps.review]

  function next() {
    if (step === 1 && built.problem) {
      setError(built.problem)
      return
    }
    if (step === 1 && !title) {
      setError(dict.declare.validation.title)
      return
    }
    setError(null)
    setStep((s) => Math.min(3, s + 1))
  }

  async function sign() {
    if (!me || !f.type) return
    await tx.run(
      {
        action: dict.wallet.actions.declare,
        lines: [
          { label: dict.common.lot, value: `${lotAddress(lot)} · ${formatLotNumber(lot.id)}` },
          { label: dict.declare.review.summary, value: `${dict.entryType[f.type]} · ${title}` },
          { label: dict.lot.contentHash, value: short(preview?.anchor.contentHash ?? "", 14, 10), mono: true },
        ],
      },
      () => {
        const e = draftEntry(getState(), input())
        setState((s) => addEntry(s, e))
        setDone({ id: e.id, txHash: e.anchor.txHash })
        return e.anchor.block
      }
    )
  }

  function restart() {
    tx.reset()
    setDone(null)
    setStep(0)
    setF((prev) => ({ ...prev, type: null, title: "", description: "", permit: "", evidence: [] }))
  }

  const focus = { x: lot.rect.x - 4, y: lot.rect.y - 4, w: lot.rect.w + 8, h: lot.rect.h + 8 }

  // ---------------------------------------------------------------- guards
  const header = (
    <div className="border-b pb-6">
      <p className="eyebrow text-primary">{dict.declare.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{dict.declare.title}</h1>
    </div>
  )

  const lotSelect = (
    <div className="grid gap-1.5">
      <Label htmlFor="declare-lot">{dict.declare.lotLabel}</Label>
      <Select
        value={lot.id}
        onValueChange={(v) => {
          setLotChoice(v)
          setStep(0)
          tx.reset()
        }}
        disabled={tx.busy || tx.phase === "confirmed"}
      >
        <SelectTrigger id="declare-lot" className="h-11 w-full bg-card sm:w-96">
          <SelectValue placeholder={dict.declare.lotPick} />
        </SelectTrigger>
        <SelectContent>
          {LOTS.map((l) => (
            <SelectItem key={l.id} value={l.id}>
              {lotAddress(l)} · {formatLotNumber(l.id)}
              {me && l.owner.toLowerCase() === me.address.toLowerCase() ? ` · ${dict.declare.ownerOf}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {header}
        <div className="mt-6 h-64 animate-pulse rounded-md bg-muted" aria-label={dict.common.loading} />
      </div>
    )
  }

  if (!me || !isOwner) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {header}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="grid content-start gap-5 lg:col-span-6">
            {lotSelect}
            <div className="rounded-md border border-dashed bg-card p-5">
              <p className="font-semibold">{!me ? dict.declare.needWallet : dict.declare.notOwner}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {!me ? (
                  <Button onClick={demo.openConnect}>{dict.wallet.connect}</Button>
                ) : (
                  <>
                    <ReportDialog lot={lot} trigger={<Button>{dict.declare.notOwnerCta}</Button>} />
                    <Button variant="outline" onClick={demo.openConnect}>
                      {dict.wallet.switch}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Plan snapshots={snaps} labels={planLabels(dict)} idPrefix="declare-guard" focus={focus} selectedId={lot.id} pendingStructureIds={pending} />
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------- flow
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {header}

      {/* Stepper */}
      <ol className="mt-6 grid grid-cols-4 gap-1" aria-label={t(dict.declare.stepOf, { n: step + 1, total: 4 })}>
        {stepNames.map((name, i) => (
          <li key={name} aria-current={i === step ? "step" : undefined}>
            <span className={cn("block h-1 rounded-full", i < step || done ? "bg-primary" : i === step ? "bg-foreground" : "bg-muted")} />
            <span className={cn("mt-2 hidden text-sm sm:block", i === step ? "font-semibold" : "text-muted-foreground")}>
              {i + 1}. {name}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm font-semibold sm:hidden">
        {t(dict.declare.stepOf, { n: step + 1, total: 4 })} · {stepNames[step]}
      </p>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* Form */}
        <div className="grid content-start gap-6 lg:col-span-7">
          {step === 0 ? (
            <>
              {lotSelect}
              <fieldset>
                <legend className="mb-3 text-sm font-medium">{dict.declare.steps.what}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TYPES.map(({ type, Icon }) => (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={f.type === type}
                      onClick={() => {
                        set("type", type)
                        if (type === "demolition" && !f.structureId) set("structureId", current.structures.find((s) => !MAIN.has(s.kind))?.id ?? current.structures[0]?.id ?? "")
                        if (type === "storey" && main) {
                          set("storeys", String(main.storeys + 1))
                          set("height", String(Math.round((main.height + 2.8) * 10) / 10))
                        }
                        if (type === "units" && main) set("units", String(main.units + 1))
                        if (type === "extension" || type === "accessory") set("height", type === "accessory" ? "3" : "3.8")
                      }}
                      className={cn(
                        "flex items-start gap-3 rounded-md border p-4 text-left transition-colors hover:bg-accent",
                        f.type === type ? "border-primary bg-ok-surface ring-1 ring-primary" : "bg-card"
                      )}
                    >
                      <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        <span className="block font-semibold">{dict.declare.types[type].title}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">{dict.declare.types[type].body}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          ) : null}

          {step === 1 && f.type ? (
            <div className="grid gap-5">
              {f.type === "accessory" ? (
                <Field label={dict.declare.fields.kind} id="d-kind">
                  <Select value={f.kind} onValueChange={(v) => set("kind", v as Form["kind"])}>
                    <SelectTrigger id="d-kind" className="h-10 w-full bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESSORY_KINDS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {dict.declare.accessoryKinds[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
              {f.type === "extension" || f.type === "accessory" ? (
                <div className="grid grid-cols-3 gap-3">
                  <NumField id="d-width" label={dict.declare.fields.width} value={f.width} onChange={(v) => set("width", v)} />
                  <NumField id="d-depth" label={dict.declare.fields.depth} value={f.depth} onChange={(v) => set("depth", v)} />
                  <NumField id="d-height" label={dict.declare.fields.height} value={f.height} onChange={(v) => set("height", v)} />
                </div>
              ) : null}
              {f.type === "accessory" ? (
                <>
                  <fieldset className="grid gap-2">
                    <legend className="mb-1 text-sm font-medium">{dict.declare.fields.corner}</legend>
                    <div className="flex flex-wrap gap-2">
                      {(["left", "right"] as const).map((c) => (
                        <label
                          key={c}
                          className={cn(
                            "flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                            f.corner === c ? "border-primary bg-ok-surface" : "bg-card"
                          )}
                        >
                          <input type="radio" name="corner" checked={f.corner === c} onChange={() => set("corner", c)} className="accent-[var(--primary)]" />
                          {c === "left" ? dict.declare.fields.cornerLeft : dict.declare.fields.cornerRight}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid grid-cols-2 gap-3">
                    <NumField id="d-side" label={dict.declare.fields.fromSide} value={f.fromSide} onChange={(v) => set("fromSide", v)} />
                    <NumField id="d-rear" label={dict.declare.fields.fromRear} value={f.fromRear} onChange={(v) => set("fromRear", v)} />
                  </div>
                </>
              ) : null}
              {f.type === "storey" ? (
                <div className="grid grid-cols-2 gap-3">
                  <NumField id="d-storeys" label={dict.declare.fields.storeys} value={f.storeys} onChange={(v) => set("storeys", v)} />
                  <NumField id="d-height" label={dict.declare.fields.height} value={f.height} onChange={(v) => set("height", v)} />
                </div>
              ) : null}
              {f.type === "units" ? <NumField id="d-units" label={dict.declare.fields.units} value={f.units} onChange={(v) => set("units", v)} /> : null}
              {f.type === "demolition" ? (
                <Field label={dict.declare.fields.structure} id="d-structure">
                  <Select value={f.structureId} onValueChange={(v) => set("structureId", v)}>
                    <SelectTrigger id="d-structure" className="h-10 w-full bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {current.structures.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {dict.kind[s.kind]} · {s.rect.w} × {s.rect.h} m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={dict.declare.fields.date} id="d-date">
                  <Input id="d-date" type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className="h-10 bg-card" />
                </Field>
                <Field label={`${dict.declare.fields.permit} (${dict.common.optional})`} id="d-permit">
                  <Input id="d-permit" value={f.permit} onChange={(e) => set("permit", e.target.value)} placeholder="2026-XXX" className="h-10 bg-card font-mono" />
                </Field>
              </div>
              <Field label={dict.declare.fields.title} id="d-title">
                <Input id="d-title" value={f.title} placeholder={defaultTitle} onChange={(e) => set("title", e.target.value)} className="h-10 bg-card" />
              </Field>
              <Field label={`${dict.declare.fields.description} (${dict.common.optional})`} id="d-desc">
                <Textarea id="d-desc" rows={3} placeholder={dict.declare.fields.descriptionHint} value={f.description} onChange={(e) => set("description", e.target.value)} className="bg-card" />
              </Field>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3">
              <h2 className="flex items-center gap-1 text-lg font-semibold">
                {dict.declare.evidence.title}
                <InfoTip label="IPFS">{dict.declare.evidence.body}</InfoTip>
              </h2>
              <EvidencePicker
                value={f.evidence}
                onChange={(v) => set("evidence", v)}
                sampleName={t(dict.declare.evidence.sampleName, { lot: lot.civic })}
                kind="plan"
              />
            </div>
          ) : null}

          {step === 3 && f.type && preview ? (
            <div className="grid gap-4">
              <h2 className="text-lg font-semibold">{dict.declare.review.title}</h2>
              <div className="rounded-md border bg-card">
                <div className="border-b p-4">
                  <p className="eyebrow text-muted-foreground">
                    {dict.declare.review.summary} · {done?.id ?? preview.id}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">
                    {dict.entryType[f.type]} · {t(dict.declare.review.onLot, { address: lotAddress(lot) })} · {f.date}
                    {f.permit ? ` · ${dict.lot.permit} ${f.permit}` : ""}
                  </p>
                  {f.description ? <p className="mt-2 text-sm">{f.description}</p> : null}
                </div>
                <dl className="grid gap-2 p-4 text-sm sm:grid-cols-[9rem_1fr]">
                  <dt className="text-muted-foreground">{dict.lot.evidence}</dt>
                  <dd>{f.evidence.length ? f.evidence.map((e) => e.name).join(", ") : "—"}</dd>
                  <dt className="flex items-center gap-0.5 text-muted-foreground">
                    {dict.lot.contentHash}
                    <InfoTip label={dict.lot.contentHash}>{dict.declare.review.hashNote}</InfoTip>
                  </dt>
                  <dd className="font-mono text-xs break-all">{preview.anchor.contentHash}</dd>
                </dl>
              </div>

              {done && tx.phase === "confirmed" ? (
                <div className="grid gap-3 rounded-md border border-primary bg-ok-surface p-4">
                  <p className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <CheckIcon className="size-5" aria-hidden="true" />
                    {dict.declare.result.confirmedTitle}
                  </p>
                  <p className="text-sm">{t(dict.declare.result.confirmedBody, { id: done.id, block: (tx.block ?? 0).toLocaleString(locale) })}</p>
                  <TxFeedback phase={tx.phase} stage={tx.stage} txHash={done.txHash} confirmed={t(dict.tx.confirmed, { block: (tx.block ?? 0).toLocaleString(locale) })} />
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={href(locale, `/app/lots/${lot.id}`)}>{dict.declare.result.viewRecord}</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-card"
                      onClick={async () => {
                        await demo.connectAs(KARIM)
                        router.push(href(locale, "/app/review"))
                      }}
                    >
                      {dict.declare.result.reviewAs}
                    </Button>
                    <Button variant="ghost" onClick={restart}>
                      {dict.declare.result.another}
                    </Button>
                  </div>
                </div>
              ) : (
                <TxFeedback phase={tx.phase} stage={tx.stage} onRetry={() => void sign()} />
              )}
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/40 bg-danger-surface p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {/* Navigation */}
          {!(done && tx.phase === "confirmed") ? (
            <div className="flex items-center justify-between gap-3 border-t pt-5">
              <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || tx.busy}>
                <ArrowLeftIcon aria-hidden="true" />
                {dict.common.back}
              </Button>
              {step < 3 ? (
                <Button onClick={next} disabled={step === 0 && !f.type}>
                  {dict.common.continue}
                  <ArrowRightIcon aria-hidden="true" />
                </Button>
              ) : (
                <Button onClick={() => void sign()} disabled={tx.busy} size="lg">
                  {dict.declare.review.sign}
                </Button>
              )}
            </div>
          ) : null}
        </div>

        {/* Preview */}
        <aside className="grid content-start gap-4 lg:sticky lg:top-20 lg:col-span-5 lg:self-start">
          <Plan
            snapshots={snaps}
            labels={planLabels(dict)}
            idPrefix="declare"
            focus={focus}
            selectedId={lot.id}
            envelopeFor={lot.id}
            draft={step >= 1 && !done ? built.draft : []}
            highlightIds={step >= 1 ? new Set(built.highlight) : undefined}
            pendingStructureIds={pending}
          />
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block size-3 border-2 border-dashed border-primary bg-primary/20" />
              {dict.plan.footprintDraft}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-0 w-5 border-t border-dashed border-primary" />
              {dict.plan.envelope}
            </span>
          </div>
          <div className="rounded-md border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">{dict.declare.check.title}</h2>
              {f.type && step >= 1 && !done ? (
                newBreaches.length === 0 ? (
                  <span className="text-sm font-semibold text-primary">{dict.declare.check.fits}</span>
                ) : (
                  <span className="text-sm font-semibold text-destructive">
                    {t(dict.declare.check.breaks, { rules: fmtList(newBreaches.map((r) => dict.rules[r]), locale) })}
                  </span>
                )
              ) : null}
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {dict.declare.check.before}: {fmtPct(before.coverage, locale)} · {dict.declare.check.after}: {fmtPct(after.coverage, locale)}
            </p>
            <div className="mt-4">
              <ZoneFacts metrics={step >= 1 ? after : before} structures={step >= 1 ? after.structures : current.structures} compact />
            </div>
            {f.type && step >= 1 && !done && newBreaches.length > 0 ? <p className="mt-3 text-xs text-muted-foreground">{dict.declare.check.breaksHelp}</p> : null}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function NumField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label} id={id}>
      <Input id={id} inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} className="h-10 bg-card font-mono tabular-nums" />
    </Field>
  )
}
