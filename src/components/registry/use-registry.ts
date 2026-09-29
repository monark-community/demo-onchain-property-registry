"use client"

import { useMemo } from "react"

import type { PlanLabels } from "@/components/plan/plan"
import { lotAriaLabel } from "@/components/plan/plan"
import type { Dictionary } from "@/i18n"
import { endOfYear, snapshot, type LotSnapshot } from "@/lib/demo/registry"
import { useDemoState } from "@/lib/demo/store"
import { LOTS } from "@/lib/demo/world"

export function useSnapshots(year: number | null = null): LotSnapshot[] {
  const state = useDemoState()
  return useMemo(() => LOTS.map((l) => snapshot(state, l, endOfYear(year))), [state, year])
}

export function planLabels(dict: Dictionary): PlanLabels {
  return {
    park: dict.plan.park,
    north: dict.plan.north,
    scale: dict.plan.scale,
    lotAria: (snap) => lotAriaLabel(dict.plan.lotAria, snap, dict.status[snap.status]),
  }
}

/** Structures added by declarations that are still pending. */
export function pendingStructures(snaps: LotSnapshot[]): Set<string> {
  const ids = new Set<string>()
  for (const s of snaps)
    for (const e of s.pendingEntries)
      for (const c of e.changes) {
        if (c.op === "add") ids.add(c.structure.id)
        if (c.op === "modify") ids.add(c.structureId)
      }
  return ids
}
