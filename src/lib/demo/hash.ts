import type { Hex } from "./types"

/**
 * Deterministic, dependency-free 256-bit digest for the simulation (eight seeded
 * 32-bit mixes). Not cryptographic: a real deployment would use keccak256.
 * Works in any context (no crypto.subtle, which is missing on plain-http LAN hosts).
 */
export function digest(input: string): string {
  let out = ""
  for (let seed = 0; seed < 8; seed++) {
    let h = 0x811c9dc5 ^ Math.imul(seed + 1, 0x9e3779b1)
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
      h ^= h >>> 13
    }
    h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
    h ^= h >>> 16
    out += (h >>> 0).toString(16).padStart(8, "0")
  }
  return out
}

export const hex32 = (input: string): Hex => `0x${digest(input)}`

/** A plausible 20-byte address from a seed string. */
export const addressFrom = (seed: string): Hex => `0x${digest(`addr:${seed}`).slice(0, 40)}`

const B32 = "abcdefghijklmnopqrstuvwxyz234567"

/** A CIDv1-looking identifier (bafybei…) derived from content. */
export function cidFrom(seed: string): string {
  const d = digest(`cid:${seed}`) + digest(`cid2:${seed}`)
  let s = ""
  for (let i = 0; i < 52; i++) s += B32[parseInt(d.slice(i * 2, i * 2 + 2), 16) % 32]
  return `bafybei${s}`
}

/** Canonical JSON (sorted keys) so a hash can be recomputed by anyone. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`
  const obj = value as Record<string, unknown>
  return `{${Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`)
    .join(",")}}`
}
