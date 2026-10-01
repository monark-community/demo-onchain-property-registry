/**
 * Cadastrum demo domain types. Everything the UI reads goes through these, so the
 * simulated chain/IPFS in this folder could be swapped for wagmi/viem + a pinning
 * service without touching components.
 */

/** Text that ships in both languages (seed data). User-entered text is a plain string. */
export type LocalText = { en: string; fr: string }
export type Text = LocalText | string

export type Hex = `0x${string}`

/** Plan geometry is in metres. */
export type Rect = { x: number; y: number; w: number; h: number }

export type ZoneCode = "R1" | "R3" | "C2" | "I1" | "M1"

export type Rule = "coverage" | "height" | "units" | "setback"

export interface ZoneRules {
  code: ZoneCode
  /** Maximum share of the lot covered by buildings (0–1). */
  maxCoverage: number
  maxHeight: number
  maxUnits: number
  setbacks: { front: number; side: number; rear: number }
}

export type Side = "north" | "south" | "east" | "west"

export type StreetId = "erables" | "moulin" | "beaulieu"

export interface Lot {
  /** Cadastral number without spaces, used in URLs: "2418305". */
  id: string
  street: StreetId
  civic: string
  rect: Rect
  /** Which side of the lot faces the street (front setback). */
  frontage: Side
  owner: Hex
}

export type StructureKind =
  | "house"
  | "garage"
  | "shed"
  | "extension"
  | "apartment"
  | "commercial"
  | "warehouse"
  | "porch"
  | "workshop"

export interface Structure {
  id: string
  kind: StructureKind
  rect: Rect
  storeys: number
  height: number
  units: number
}

export type Change =
  | { op: "add"; structure: Structure }
  | { op: "modify"; structureId: string; patch: Partial<Pick<Structure, "storeys" | "height" | "units" | "rect">> }
  | { op: "remove"; structureId: string }
  | { op: "zone"; zone: ZoneCode }

export type EntryType =
  | "construction"
  | "extension"
  | "accessory"
  | "storey"
  | "units"
  | "renovation"
  | "demolition"
  | "zoning"

export type Role = "owner" | "contractor" | "inspector" | "clerk" | "resident" | "registrar"

export interface Evidence {
  name: string
  kind: "plan" | "photo" | "report" | "resolution"
  cid: string
  bytes: number
}

export interface Anchor {
  txHash: Hex
  block: number
  /** ISO timestamp of the block. */
  at: string
  contentHash: Hex
}

export type Verdict = "attested" | "variance" | "disputed"

export interface Decision {
  verdict: Verdict
  by: Hex
  role: Role
  note: Text
  /** Rules excused by a variance. */
  rules?: Rule[]
  anchor: Anchor
}

export interface Entry {
  id: string
  lotId: string
  type: EntryType
  /** When the change happened on the ground (ISO date). */
  effective: string
  title: Text
  description: Text
  changes: Change[]
  submitter: Hex
  role: Role
  /** "inspection": recorded by an inspector after a site visit, not declared. */
  source: "declaration" | "inspection" | "archive"
  permit?: string
  evidence: Evidence[]
  anchor: Anchor
  decision?: Decision
}

export type ReportCategory = "undeclared" | "units" | "setback" | "safety"

export interface Report {
  id: string
  lotId: string
  category: ReportCategory
  description: Text
  reporter: Hex
  evidence: Evidence[]
  anchor: Anchor
  resolution?: {
    outcome: "confirmed" | "dismissed"
    by: Hex
    note: Text
    anchor: Anchor
  }
}

export type LotStatus = "compliant" | "variance" | "review" | "violation"

export interface Person {
  address: Hex
  role: Role
  /** Only officials and demo identities have a public name. */
  name?: string
  org?: LocalText
}

export interface DemoSettings {
  /** Force the next signed transaction to fail at the network step. */
  failNext: boolean
  /** Longer confirmation times. */
  slowNetwork: boolean
}

export interface DemoState {
  version: 1
  entries: Entry[]
  reports: Report[]
  identity: Hex | null
  settings: DemoSettings
}
