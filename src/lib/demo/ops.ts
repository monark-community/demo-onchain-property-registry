import { entryPayload, makeAnchor, reportPayload } from "./chain"
import type { Change, DemoState, Entry, EntryType, Evidence, Hex, Report, ReportCategory, Role, Rule, Verdict } from "./types"

/**
 * State transitions for confirmed transactions. Each returns a new DemoState;
 * the UI calls them only after the simulated network confirms.
 */

function nextId(existing: string[], prefix: "CDM" | "RPT", year: number): string {
  const re = new RegExp(`^${prefix}-${year}-(\\d{4})$`)
  const max = existing.reduce((m, id) => {
    const hit = re.exec(id)
    return hit ? Math.max(m, Number(hit[1])) : m
  }, prefix === "CDM" ? 400 : 40)
  return `${prefix}-${year}-${String(max + 1).padStart(4, "0")}`
}

export interface DeclarationInput {
  lotId: string
  type: EntryType
  effective: string
  title: string
  description: string
  changes: Change[]
  permit?: string
  evidence: Evidence[]
  submitter: Hex
  role: Role
}

/** Build the entry a declaration would create (also used to preview it before signing). */
export function draftEntry(state: DemoState, input: DeclarationInput, at = new Date().toISOString()): Entry {
  const id = nextId(state.entries.map((e) => e.id), "CDM", new Date(at).getUTCFullYear())
  const e: Entry = {
    id,
    lotId: input.lotId,
    type: input.type,
    effective: input.effective,
    title: input.title,
    description: input.description,
    changes: input.changes,
    submitter: input.submitter,
    role: input.role,
    source: "declaration",
    permit: input.permit || undefined,
    evidence: input.evidence,
    anchor: makeAnchor(id, at, null),
  }
  e.anchor = makeAnchor(id, at, entryPayload(e))
  return e
}

export function addEntry(state: DemoState, entry: Entry): DemoState {
  return { ...state, entries: [...state.entries, entry] }
}

export function decideEntry(
  state: DemoState,
  entryId: string,
  d: { verdict: Verdict; by: Hex; role: Role; note: string; rules?: Rule[] },
  at = new Date().toISOString()
): DemoState {
  return {
    ...state,
    entries: state.entries.map((e) =>
      e.id === entryId ? { ...e, decision: { ...d, anchor: makeAnchor(`${e.id}:decision`, at, { entry: e.id, ...d }) } } : e
    ),
  }
}

export function fileReport(
  state: DemoState,
  r: { lotId: string; category: ReportCategory; description: string; reporter: Hex; evidence: Evidence[] },
  at = new Date().toISOString()
): { state: DemoState; report: Report } {
  const id = nextId(state.reports.map((x) => x.id), "RPT", new Date(at).getUTCFullYear())
  const base = { id, ...r } as Report
  const report: Report = { ...base, anchor: makeAnchor(id, at, reportPayload(base)) }
  return { state: { ...state, reports: [...state.reports, report] }, report }
}

export function resolveReport(
  state: DemoState,
  reportId: string,
  res: { outcome: "confirmed" | "dismissed"; by: Hex; note: string },
  at = new Date().toISOString()
): DemoState {
  return {
    ...state,
    reports: state.reports.map((r) =>
      r.id === reportId
        ? { ...r, resolution: { ...res, anchor: makeAnchor(`${r.id}:resolution`, at, { report: r.id, outcome: res.outcome }) } }
        : r
    ),
  }
}

export function hasOpenReport(state: DemoState, lotId: string, reporter: Hex): boolean {
  return state.reports.some((r) => r.lotId === lotId && r.reporter.toLowerCase() === reporter.toLowerCase() && !r.resolution)
}
