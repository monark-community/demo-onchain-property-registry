"use client"

import { CircleAlertIcon, CircleCheckBigIcon, SearchXIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

import { Signer } from "@/components/registry/signer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { contentHash, entryPayload, reportPayload } from "@/lib/demo/chain"
import { findEntry, findReport } from "@/lib/demo/registry"
import { SEED } from "@/lib/demo/seed"
import { useDemoState } from "@/lib/demo/store"
import type { Anchor, Evidence } from "@/lib/demo/types"
import { formatLotNumber, getLot, lotAddress } from "@/lib/demo/world"
import { fmtBlock, fmtBytes, fmtDateTime, lt } from "@/lib/format"

const ID_RE = /^(CDM|RPT)-\d{4}-\d{4}$/i
const HASH_RE = /^0x[0-9a-f]{64}$/i

export function VerifyView() {
  const { dict, locale } = useI18n()
  const params = useSearchParams()
  const state = useDemoState()
  const initial = params.get("q") ?? ""
  const [value, setValue] = useState(initial)
  const [query, setQuery] = useState(initial)

  const q = query.trim()
  const malformed = q !== "" && !ID_RE.test(q) && !HASH_RE.test(q)
  const entry = q && !malformed ? findEntry(state, q) : undefined
  const report = q && !malformed && !entry ? findReport(state, q) : undefined

  const examples = [
    "CDM-2024-0092",
    SEED.entries.find((e) => e.id === "CDM-2021-0158")!.anchor.txHash,
    "RPT-2024-0031",
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <p className="eyebrow text-primary">{dict.verify.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{dict.verify.title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{dict.verify.sub}</p>

      <form
        className="mt-6 grid gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery(value)
        }}
      >
        <label htmlFor="verify-q" className="text-sm font-medium">
          {dict.verify.label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="verify-q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dict.verify.placeholder}
            className="h-11 bg-card font-mono"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={malformed || undefined}
          />
          <Button type="submit" size="lg" className="h-11">
            {dict.verify.button}
          </Button>
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          {dict.verify.examples}
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setValue(ex)
                setQuery(ex)
              }}
              className="max-w-full truncate rounded-sm border bg-card px-1.5 py-0.5 font-mono text-xs hover:bg-accent"
            >
              {ex.length > 20 ? `${ex.slice(0, 12)}…${ex.slice(-6)}` : ex}
            </button>
          ))}
        </p>
      </form>

      <div className="mt-8" aria-live="polite">
        {malformed ? (
          <Problem icon="alert" text={dict.verify.malformed} />
        ) : q && !entry && !report ? (
          <Problem icon="none" text={dict.verify.unknown} />
        ) : entry ? (
          <Proof
            title={lt(entry.title, locale)}
            id={entry.id}
            lotId={entry.lotId}
            anchor={entry.anchor}
            recomputed={contentHash(entryPayload(entry))}
            signer={<Signer address={entry.submitter} role={entry.role} />}
            evidence={entry.evidence}
            decision={
              entry.decision ? (
                <>
                  <span className="font-semibold">{dict.entryStatus[entry.decision.verdict]}</span> · {fmtDateTime(entry.decision.anchor.at, locale)} · #
                  {fmtBlock(entry.decision.anchor.block, locale)}
                  <span className="mt-1 block">{lt(entry.decision.note, locale)}</span>
                </>
              ) : (
                dict.verify.noDecision
              )
            }
          />
        ) : report ? (
          <Proof
            title={t(dict.verify.reportTitle, { id: report.id })}
            id={report.id}
            lotId={report.lotId}
            anchor={report.anchor}
            recomputed={contentHash(reportPayload(report))}
            signer={<Signer address={report.reporter} role="resident" />}
            evidence={report.evidence}
            decision={
              report.resolution ? (
                <>
                  <span className="font-semibold">{dict.lot.resolution[report.resolution.outcome]}</span> · {fmtDateTime(report.resolution.anchor.at, locale)}
                  <span className="mt-1 block">{lt(report.resolution.note, locale)}</span>
                </>
              ) : (
                dict.verify.noDecision
              )
            }
          />
        ) : null}
      </div>
    </div>
  )
}

function Problem({ icon, text }: { icon: "alert" | "none"; text: string }) {
  const Icon = icon === "alert" ? CircleAlertIcon : SearchXIcon
  return (
    <p className="flex items-start gap-2 rounded-md border border-dashed border-destructive/50 bg-danger-surface p-4 text-destructive">
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      {text}
    </p>
  )
}

function Proof(props: {
  title: string
  id: string
  lotId: string
  anchor: Anchor
  recomputed: string
  signer: React.ReactNode
  evidence: Evidence[]
  decision: React.ReactNode
}) {
  const { dict, locale } = useI18n()
  const lot = getLot(props.lotId)!
  const match = props.recomputed === props.anchor.contentHash
  const f = dict.verify.fields
  return (
    <article className="overflow-hidden rounded-md border bg-card">
      <div className={match ? "flex items-start gap-3 bg-ok-surface p-4 text-primary" : "flex items-start gap-3 bg-danger-surface p-4 text-destructive"}>
        <CircleCheckBigIcon className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-lg font-semibold">{match ? dict.verify.matchTitle : dict.verify.mismatchTitle}</p>
          {match ? <p className="text-sm text-foreground">{t(dict.verify.matchBody, { block: fmtBlock(props.anchor.block, locale) })}</p> : null}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold">{props.title}</h2>
        <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[11rem_1fr]">
          <dt className="text-muted-foreground">{f.entry}</dt>
          <dd className="font-mono">{props.id}</dd>
          <dt className="text-muted-foreground">{f.lot}</dt>
          <dd>
            <Link href={href(locale, `/app/lots/${lot.id}`)} className="text-primary underline-offset-4 hover:underline">
              {lotAddress(lot)} · {formatLotNumber(lot.id)}
            </Link>
          </dd>
          <dt className="text-muted-foreground">{f.anchored}</dt>
          <dd>{fmtDateTime(props.anchor.at, locale)}</dd>
          <dt className="text-muted-foreground">{f.block}</dt>
          <dd className="font-mono">#{fmtBlock(props.anchor.block, locale)}</dd>
          <dt className="text-muted-foreground">{f.tx}</dt>
          <dd className="font-mono text-xs break-all">{props.anchor.txHash}</dd>
          <dt className="text-muted-foreground">{f.signer}</dt>
          <dd>{props.signer}</dd>
          <dt className="text-muted-foreground">{f.anchoredHash}</dt>
          <dd className="font-mono text-xs break-all">{props.anchor.contentHash}</dd>
          <dt className="text-muted-foreground">{f.recomputed}</dt>
          <dd className="font-mono text-xs break-all text-primary">{props.recomputed}</dd>
          {props.evidence.length > 0 ? (
            <>
              <dt className="text-muted-foreground">{f.evidence}</dt>
              <dd className="grid gap-1">
                {props.evidence.map((ev) => (
                  <span key={ev.cid} className="text-xs">
                    <span className="font-medium">{ev.name}</span>{" "}
                    <span className="font-mono break-all text-muted-foreground">
                      {fmtBytes(ev.bytes, locale)} · {ev.cid}
                    </span>
                  </span>
                ))}
              </dd>
            </>
          ) : null}
          <dt className="text-muted-foreground">{f.decision}</dt>
          <dd>{props.decision}</dd>
        </dl>
      </div>
    </article>
  )
}
