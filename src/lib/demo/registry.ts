import type { DemoState, Entry, Lot, LotStatus, Report, Rule, Structure, ZoneCode, ZoneRules } from "./types"
import { ACCESSORY_SETBACK, INITIAL_ZONE, ZONES, lineDistances, lotArea } from "./world"

/**
 * Pure derivations over the registry: what stood on a lot at a date, how it
 * measures against its zone, and the lot's compliance status. Shared by the
 * plan, the lot record, the declare flow and the inspector's review.
 */

const ACCESSORY = new Set<Structure["kind"]>(["garage", "shed", "workshop"])

export interface SetbackCheck {
  structureId: string
  line: "front" | "rear" | "side"
  distance: number
  required: number
}

export interface Metrics {
  zone: ZoneRules
  lotArea: number
  footprint: number
  coverage: number
  height: number
  units: number
  /** The tightest setback relative to what's required (most negative margin first). */
  setback: SetbackCheck | null
  breaches: Rule[]
}

export interface LotSnapshot {
  lot: Lot
  structures: Structure[]
  zone: ZoneCode
  metrics: Metrics
  status: LotStatus
  pendingEntries: Entry[]
  openReports: Report[]
  excused: Rule[]
}

const EPS = 0.001

/** End of a year as an ISO timestamp, or null for "now" (everything). */
export const endOfYear = (year: number | null): string | null => (year === null ? null : `${year}-12-31T23:59:59Z`)

const onOrBefore = (iso: string, asOf: string | null) => asOf === null || iso <= asOf

export function lotEntries(state: Pick<DemoState, "entries">, lotId: string): Entry[] {
  return state.entries
    .filter((e) => e.lotId === lotId)
    .sort((a, b) => (a.effective === b.effective ? a.anchor.at.localeCompare(b.anchor.at) : a.effective.localeCompare(b.effective)))
}

export function lotReports(state: Pick<DemoState, "reports">, lotId: string): Report[] {
  return state.reports.filter((r) => r.lotId === lotId).sort((a, b) => a.anchor.at.localeCompare(b.anchor.at))
}

/** Apply entries in order to get the structures and zone on the ground. */
export function applyEntries(lotId: string, entries: Entry[]): { structures: Structure[]; zone: ZoneCode } {
  let zone: ZoneCode = INITIAL_ZONE[lotId] ?? "R1"
  const map = new Map<string, Structure>()
  for (const e of entries) {
    for (const c of e.changes) {
      if (c.op === "add") map.set(c.structure.id, { ...c.structure })
      else if (c.op === "remove") map.delete(c.structureId)
      else if (c.op === "modify") {
        const s = map.get(c.structureId)
        if (s) map.set(s.id, { ...s, ...c.patch })
      } else if (c.op === "zone") zone = c.zone
    }
  }
  return { structures: [...map.values()], zone }
}

export function measure(lot: Lot, structures: Structure[], zoneCode: ZoneCode): Metrics {
  const zone = ZONES[zoneCode]
  const area = lotArea(lot)
  const footprint = structures.reduce((sum, s) => sum + s.rect.w * s.rect.h, 0)
  const coverage = footprint / area
  const height = structures.reduce((m, s) => Math.max(m, s.height), 0)
  const units = structures.reduce((sum, s) => sum + s.units, 0)

  let worst: SetbackCheck | null = null
  let worstMargin = Infinity
  for (const s of structures) {
    const d = lineDistances(lot, s.rect)
    const acc = ACCESSORY.has(s.kind)
    const checks: SetbackCheck[] = [
      { structureId: s.id, line: "rear", distance: d.rear, required: acc ? ACCESSORY_SETBACK : zone.setbacks.rear },
      { structureId: s.id, line: "side", distance: Math.min(d.sideA, d.sideB), required: acc ? ACCESSORY_SETBACK : zone.setbacks.side },
    ]
    if (!acc) checks.push({ structureId: s.id, line: "front", distance: d.front, required: zone.setbacks.front })
    for (const c of checks) {
      const margin = c.distance - c.required
      if (margin < worstMargin) {
        worstMargin = margin
        worst = c
      }
    }
  }

  const breaches: Rule[] = []
  if (coverage > zone.maxCoverage + EPS) breaches.push("coverage")
  if (height > zone.maxHeight + EPS) breaches.push("height")
  if (units > zone.maxUnits) breaches.push("units")
  if (worst && worstMargin < -EPS) breaches.push("setback")

  return { zone, lotArea: area, footprint, coverage, height, units, setback: worst, breaches }
}

/** Is the entry still waiting for a decision at `asOf`? */
export function isPending(e: Entry, asOf: string | null = null): boolean {
  if (!onOrBefore(e.anchor.at, asOf)) return false
  return !e.decision || !onOrBefore(e.decision.anchor.at, asOf)
}

export function entryStatus(e: Entry, asOf: string | null = null): "pending" | "attested" | "variance" | "disputed" {
  if (!e.decision || !onOrBefore(e.decision.anchor.at, asOf)) return "pending"
  return e.decision.verdict
}

export function snapshot(state: Pick<DemoState, "entries" | "reports">, lot: Lot, asOf: string | null = null): LotSnapshot {
  const all = lotEntries(state, lot.id)
  const onGround = all.filter((e) => onOrBefore(`${e.effective}T00:00:00Z`, asOf))
  const { structures, zone } = applyEntries(lot.id, onGround)
  const metrics = measure(lot, structures, zone)

  const known = all.filter((e) => onOrBefore(e.anchor.at, asOf))
  const pendingEntries = known.filter((e) => isPending(e, asOf))
  const reports = lotReports(state, lot.id).filter((r) => onOrBefore(r.anchor.at, asOf))
  const openReports = reports.filter((r) => !r.resolution || !onOrBefore(r.resolution.anchor.at, asOf))

  const decided = known.filter((e) => e.decision && onOrBefore(e.decision.anchor.at, asOf))
  const excused = [...new Set(decided.flatMap((e) => (e.decision!.verdict === "variance" ? (e.decision!.rules ?? []) : [])))]

  // Flags: a confirmed report or a disputed entry, cleared by a later positive decision on a newer entry.
  const flags: string[] = [
    ...reports.filter((r) => r.resolution?.outcome === "confirmed" && onOrBefore(r.resolution.anchor.at, asOf)).map((r) => r.resolution!.anchor.at),
    ...decided.filter((e) => e.decision!.verdict === "disputed").map((e) => e.decision!.anchor.at),
  ]
  const cleared = (flagAt: string) =>
    decided.some((e) => e.source === "declaration" && e.anchor.at > flagAt && e.decision!.verdict !== "disputed")
  const flagged = flags.some((f) => !cleared(f))

  const unexcused = metrics.breaches.filter((b) => !excused.includes(b))
  let status: LotStatus
  if (flagged) status = "violation"
  else if (pendingEntries.length > 0 || openReports.length > 0) status = "review"
  else if (unexcused.length > 0) status = "violation"
  else if (metrics.breaches.length > 0) status = "variance"
  else status = "compliant"

  return { lot, structures, zone, metrics, status, pendingEntries, openReports, excused }
}

/** Rules an entry would newly break, comparing the lot before and after it (everything else included). */
export function newBreaches(state: Pick<DemoState, "entries" | "reports">, lot: Lot, entry: Entry): { before: Metrics; after: Metrics; added: Rule[] } {
  const others = lotEntries(state, lot.id).filter((e) => e.id !== entry.id)
  const b = applyEntries(lot.id, others)
  const a = applyEntries(lot.id, [...others, entry].sort((x, y) => x.effective.localeCompare(y.effective)))
  const before = measure(lot, b.structures, b.zone)
  const after = measure(lot, a.structures, a.zone)
  return { before, after, added: after.breaches.filter((r) => !before.breaches.includes(r)) }
}

export const STATUS_ORDER: LotStatus[] = ["violation", "review", "variance", "compliant"]

export function findEntry(state: Pick<DemoState, "entries">, idOrHash: string): Entry | undefined {
  const q = idOrHash.trim().toLowerCase()
  return state.entries.find(
    (e) => e.id.toLowerCase() === q || e.anchor.txHash.toLowerCase() === q || e.decision?.anchor.txHash.toLowerCase() === q
  )
}

export function findReport(state: Pick<DemoState, "reports">, idOrHash: string): Report | undefined {
  const q = idOrHash.trim().toLowerCase()
  return state.reports.find(
    (r) => r.id.toLowerCase() === q || r.anchor.txHash.toLowerCase() === q || r.resolution?.anchor.txHash.toLowerCase() === q
  )
}

/** First year anything was built in the neighbourhood, for the scrubber. */
export const FIRST_YEAR = 1930
export const LAST_YEAR = 2026
