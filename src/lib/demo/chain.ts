import { canonical, cidFrom, hex32 } from "./hash"
import type { Anchor, Entry, Evidence, Hex, Report } from "./types"

/**
 * Simulated chain. Blocks every 12 s from a fixed origin, so seed data and new
 * transactions share one believable timeline.
 */
export const NETWORK = { name: "Sepolia", chainId: 11155111, explorer: null } as const

const ORIGIN_MS = Date.UTC(2019, 0, 1)
const ORIGIN_BLOCK = 4_800_000
const BLOCK_MS = 12_000

export function blockAt(iso: string): number {
  return ORIGIN_BLOCK + Math.floor((Date.parse(iso) - ORIGIN_MS) / BLOCK_MS)
}

/** The part of an entry that is hashed and anchored (everything but the anchor and later decisions). */
export function entryPayload(e: Entry) {
  return {
    id: e.id,
    lotId: e.lotId,
    type: e.type,
    effective: e.effective,
    title: e.title,
    description: e.description,
    changes: e.changes,
    submitter: e.submitter,
    role: e.role,
    source: e.source,
    permit: e.permit,
    evidence: e.evidence.map((x) => x.cid),
  }
}

export function reportPayload(r: Report) {
  return {
    id: r.id,
    lotId: r.lotId,
    category: r.category,
    description: r.description,
    reporter: r.reporter,
    evidence: r.evidence.map((x) => x.cid),
  }
}

export const contentHash = (payload: unknown): Hex => hex32(canonical(payload))

export function makeAnchor(seed: string, at: string, payload: unknown): Anchor {
  return { txHash: hex32(`tx:${seed}:${at}`), block: blockAt(at), at, contentHash: contentHash(payload) }
}

export function makeEvidence(name: string, kind: Evidence["kind"], bytes: number, seed = name): Evidence {
  return { name, kind, bytes, cid: cidFrom(`${seed}:${bytes}`) }
}

// ---------------------------------------------------------------- network simulation

export class TxError extends Error {
  constructor(public readonly reason: "rejected" | "network") {
    super(reason)
  }
}

export type Stage = "broadcast" | "included"

/** Wait like a real network: broadcast, then inclusion, then one confirmation. */
export async function simulateNetwork(opts: { fail: boolean; slow: boolean; onStage?: (s: Stage) => void }): Promise<void> {
  const base = opts.slow ? 2600 : 900
  const jitter = () => Math.round(Math.random() * (opts.slow ? 1400 : 700))
  opts.onStage?.("broadcast")
  await sleep(base + jitter())
  if (opts.fail) throw new TxError("network")
  opts.onStage?.("included")
  await sleep(base * 0.6 + jitter())
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Simulated IPFS pin: reports progress, returns a content identifier. */
export async function pinToIpfs(file: { name: string; bytes: number }, onProgress?: (pct: number) => void): Promise<string> {
  const steps = 8
  for (let i = 1; i <= steps; i++) {
    await sleep(120 + Math.random() * 90)
    onProgress?.(Math.round((i / steps) * 100))
  }
  return cidFrom(`${file.name}:${file.bytes}:${Date.now()}`)
}
