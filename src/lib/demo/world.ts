import { addressFrom } from "./hash"
import type { Hex, LocalText, Lot, Person, Rect, Side, StreetId, ZoneCode, ZoneRules } from "./types"

/**
 * The demo world: Quartier du Moulin, in the fictional municipality of
 * Val-des-Ormes. Plan units are metres; the plan is 240 m × 170 m.
 */
export const PLAN = { width: 240, height: 170 } as const

export const MUNICIPALITY = "Val-des-Ormes"

export const STREETS: Record<StreetId, { name: string; rect: Rect; label: { x: number; y: number; vertical?: boolean } }> = {
  moulin: { name: "rue du Moulin", rect: { x: 0, y: 0, w: 240, h: 10 }, label: { x: 75, y: 6.4 } },
  erables: { name: "rue des Érables", rect: { x: 0, y: 80, w: 240, h: 12 }, label: { x: 75, y: 87.4 } },
  beaulieu: { name: "avenue Beaulieu", rect: { x: 150, y: 0, w: 12, h: 170 }, label: { x: 156.6, y: 128, vertical: true } },
}

export const PARK: { rect: Rect; name: LocalText } = {
  rect: { x: 0, y: 127, w: 150, h: 43 },
  name: { en: "Parc du Moulin", fr: "Parc du Moulin" },
}

/** Setback that applies to accessory buildings (garage, shed, workshop) on side and rear lines. */
export const ACCESSORY_SETBACK = 1

export const ZONES: Record<ZoneCode, ZoneRules> = {
  R1: { code: "R1", maxCoverage: 0.4, maxHeight: 10, maxUnits: 2, setbacks: { front: 6, side: 1.5, rear: 7.5 } },
  R3: { code: "R3", maxCoverage: 0.5, maxHeight: 14, maxUnits: 12, setbacks: { front: 4, side: 2, rear: 6 } },
  C2: { code: "C2", maxCoverage: 0.6, maxHeight: 12, maxUnits: 4, setbacks: { front: 0, side: 0, rear: 4 } },
  I1: { code: "I1", maxCoverage: 0.6, maxHeight: 12, maxUnits: 0, setbacks: { front: 6, side: 3, rear: 6 } },
  M1: { code: "M1", maxCoverage: 0.55, maxHeight: 20, maxUnits: 40, setbacks: { front: 3, side: 3, rear: 6 } },
}

/** Zone each lot had when the archive was imported; zoning entries change it. */
export const INITIAL_ZONE: Record<string, ZoneCode> = {}

// ---------------------------------------------------------------- people

export const ELISE: Hex = "0x7a3f5c0e9b21d4a86f0c3b5e2d9a41c7e8b2c21d"
export const KARIM: Hex = "0x3be9a1d07c44f25e9018b6ad3c7f2e51d8a904af"
export const MAYA: Hex = "0xc45d82e1f3a07b6c9d24e5f18a3b70c62d4e9e10"
export const CLERK: Hex = "0x9d1c4b7e2a05f86d31c9e0b4a7f23d58e6c1b702"
export const ARCHIVE: Hex = "0x51a0e2c9d7b34f18a6e05c92d3b7f4a18c06e3d9"
export const PAUL: Hex = "0x2f8b6d91c0e43a57b2d8f1e6c9a04b73e5d2a618"
export const BUILDER: Hex = "0xa6e3f0b2d95c17e84b0a3d6f2c91e5b78d4f0c35"

export const PEOPLE: Person[] = [
  { address: ELISE, role: "owner", name: "Élise Martel" },
  { address: KARIM, role: "inspector", name: "Karim Haddad", org: { en: "Planning department, Val-des-Ormes", fr: "Service de l'urbanisme, Val-des-Ormes" } },
  { address: MAYA, role: "resident", name: "Maya Chen" },
  { address: CLERK, role: "clerk", name: "Isabelle Fortin", org: { en: "City Clerk, Val-des-Ormes", fr: "Greffe, Val-des-Ormes" } },
  { address: ARCHIVE, role: "registrar", org: { en: "Municipal archive import", fr: "Import des archives municipales" } },
  { address: PAUL, role: "inspector", name: "Paul Desrosiers", org: { en: "Planning department, Val-des-Ormes", fr: "Service de l'urbanisme, Val-des-Ormes" } },
  { address: BUILDER, role: "contractor", org: { en: "Habitations Beaulieu inc.", fr: "Habitations Beaulieu inc." } },
]

export function person(address: Hex): Person | undefined {
  return PEOPLE.find((p) => p.address.toLowerCase() === address.toLowerCase())
}

/** The three identities a visitor can connect as. */
export const DEMO_IDENTITIES: Hex[] = [ELISE, KARIM, MAYA]

// ---------------------------------------------------------------- lots

type LotSeed = [id: string, street: StreetId, civic: string, rect: Rect, frontage: Side, zone: ZoneCode, owner?: Hex]

const row = (
  firstId: number,
  street: StreetId,
  civics: string[],
  y: number,
  h: number,
  w: number,
  frontage: Side,
  zone: ZoneCode
): LotSeed[] => civics.map((civic, i) => [String(firstId + i), street, civic, { x: i * w, y, w, h }, frontage, zone])

const LOT_SEEDS: LotSeed[] = [
  ...row(2418291, "moulin", ["11", "17", "23", "29", "35", "41"], 10, 35, 25, "north", "R1"),
  ...row(2418301, "erables", ["12", "18", "24", "30", "36", "42"], 45, 35, 25, "south", "R1"),
  ["2418310", "beaulieu", "60", { x: 162, y: 10, w: 78, h: 35 }, "west", "R3"],
  ["2418311", "beaulieu", "76", { x: 162, y: 45, w: 78, h: 35 }, "west", "C2"],
  ["2418320", "beaulieu", "120", { x: 162, y: 92, w: 78, h: 78 }, "west", "I1"],
  ...row(2418331, "erables", ["13", "21", "29", "37", "45"], 92, 35, 30, "north", "R1"),
]

export const LOTS: Lot[] = LOT_SEEDS.map(([id, street, civic, rect, frontage, zone, owner]) => {
  INITIAL_ZONE[id] = zone
  return { id, street, civic, rect, frontage, owner: owner ?? (id === "2418303" ? ELISE : addressFrom(`owner-${id}`)) }
})

export const LOT_IDS = LOTS.map((l) => l.id)

export function getLot(id: string): Lot | undefined {
  return LOTS.find((l) => l.id === id)
}

/** "2418305" -> "2 418 305", the way Québec cadastre numbers are written. */
export function formatLotNumber(id: string): string {
  return id.replace(/^(\d)(\d{3})(\d{3})$/, "$1 $2 $3")
}

export function lotAddress(lot: Lot): string {
  return `${lot.civic} ${STREETS[lot.street].name}`
}

export const lotArea = (lot: Lot) => lot.rect.w * lot.rect.h

/**
 * Place a rectangle on a lot in street-relative terms: `front` metres back from the
 * front line, `side` metres from the lot's left/top side, `w` along the frontage, `d` deep.
 */
export function place(lot: Lot, front: number, side: number, w: number, d: number): Rect {
  const r = lot.rect
  switch (lot.frontage) {
    case "north":
      return { x: r.x + side, y: r.y + front, w, h: d }
    case "south":
      return { x: r.x + side, y: r.y + r.h - front - d, w, h: d }
    case "west":
      return { x: r.x + front, y: r.y + side, w: d, h: w }
    case "east":
      return { x: r.x + r.w - front - d, y: r.y + side, w: d, h: w }
  }
}

/** Distance from a structure to each lot line, labelled front/rear/side. */
export function lineDistances(lot: Lot, s: Rect): { front: number; rear: number; sideA: number; sideB: number } {
  const r = lot.rect
  const north = s.y - r.y
  const south = r.y + r.h - (s.y + s.h)
  const west = s.x - r.x
  const east = r.x + r.w - (s.x + s.w)
  switch (lot.frontage) {
    case "north":
      return { front: north, rear: south, sideA: west, sideB: east }
    case "south":
      return { front: south, rear: north, sideA: west, sideB: east }
    case "west":
      return { front: west, rear: east, sideA: north, sideB: south }
    case "east":
      return { front: east, rear: west, sideA: north, sideB: south }
  }
}
