import { entryPayload, makeAnchor, makeEvidence, reportPayload } from "./chain"
import type { DemoState, Entry, Evidence, Hex, LocalText, Report, Role, Rule, Structure, StructureKind, Verdict } from "./types"
import { ARCHIVE, BUILDER, CLERK, ELISE, KARIM, MAYA, PAUL, getLot, place } from "./world"

/** Archive import date: every structure built before it was imported and checked by the clerk. */
const IMPORT_AT = "2019-06-12T14:20:00Z"

const KIND: Record<StructureKind, LocalText> = {
  house: { en: "House", fr: "Maison" },
  garage: { en: "Detached garage", fr: "Garage détaché" },
  shed: { en: "Garden shed", fr: "Remise" },
  extension: { en: "Rear extension", fr: "Agrandissement arrière" },
  apartment: { en: "Apartment building", fr: "Immeuble à logements" },
  commercial: { en: "Commercial building", fr: "Bâtiment commercial" },
  warehouse: { en: "Foundry building", fr: "Bâtiment de la fonderie" },
  porch: { en: "Covered porch", fr: "Galerie couverte" },
  workshop: { en: "Workshop", fr: "Atelier" },
}

const FEMININE = new Set<StructureKind>(["house", "shed", "porch"])

type DecisionSeed = { verdict: Verdict; by: Hex; role: Role; at: string; note: LocalText; rules?: Rule[] }

type EntrySeed = Omit<Entry, "anchor" | "decision" | "evidence"> & {
  recorded: string
  evidence?: Evidence[]
  decision?: DecisionSeed
}

function entry(s: EntrySeed): Entry {
  const { recorded, decision, evidence = [], ...rest } = s
  const e: Entry = { ...rest, evidence, anchor: makeAnchor(s.id, recorded, null) }
  e.anchor = makeAnchor(s.id, recorded, entryPayload(e))
  if (decision) {
    const { at, ...d } = decision
    e.decision = { ...d, anchor: makeAnchor(`${s.id}:decision`, at, { entry: s.id, ...d }) }
  }
  return e
}

const structure = (lotId: string, kind: StructureKind, front: number, side: number, w: number, d: number, storeys: number, height: number, units: number, n = 1): Structure => ({
  id: `${lotId}-${kind}${n > 1 ? `-${n}` : ""}`,
  kind,
  rect: place(getLot(lotId)!, front, side, w, d),
  storeys,
  height,
  units,
})

let archiveSeq = 0

/** One archive entry per pre-2019 structure: imported from the permit archive and checked by the clerk. */
function archived(lotId: string, year: number, s: Structure, permit: string): Entry {
  archiveSeq += 1
  const id = `CDM-2019-${String(archiveSeq).padStart(4, "0")}`
  return entry({
    id,
    lotId,
    type: "construction",
    effective: `${year}-06-01`,
    title: { en: `${KIND[s.kind].en} built`, fr: `${KIND[s.kind].fr} ${FEMININE.has(s.kind) ? "construite" : "construit"}` },
    description: {
      en: `Imported from the municipal permit archive (permit ${permit}) and checked against the 2018 assessment roll.`,
      fr: `Importé des archives de permis de la municipalité (permis ${permit}) et vérifié avec le rôle d'évaluation 2018.`,
    },
    changes: [{ op: "add", structure: s }],
    submitter: ARCHIVE,
    role: "registrar",
    source: "archive",
    permit,
    evidence: [makeEvidence(`permit-${permit}.pdf`, "plan", 180_000 + archiveSeq * 7_331)],
    recorded: IMPORT_AT,
    decision: {
      verdict: "attested",
      by: CLERK,
      role: "clerk",
      at: "2019-06-14T15:05:00Z",
      note: { en: "Archive import verified.", fr: "Import des archives vérifié." },
    },
  })
}

function buildEntries(): Entry[] {
  archiveSeq = 0
  const A = (lotId: string, year: number, s: Structure, permit: string) => archived(lotId, year, s, permit)
  const list: Entry[] = []

  // Block A, north row (rue du Moulin)
  list.push(A("2418291", 1951, structure("2418291", "house", 7, 4, 17, 11, 1, 4.8, 1), "1951-032"))
  list.push(A("2418292", 1954, structure("2418292", "house", 6.5, 4.5, 16, 12, 1, 5, 1), "1954-118"))
  list.push(A("2418293", 1956, structure("2418293", "house", 6, 3.5, 18, 12, 2, 7.5, 1), "1956-071"))
  list.push(A("2418293", 1979, structure("2418293", "garage", 27, 2, 6, 6, 1, 3.6, 0), "1979-204"))
  list.push(A("2418294", 1958, structure("2418294", "house", 7, 4, 17, 11, 1, 5.2, 1), "1958-146"))
  list.push(A("2418295", 1961, structure("2418295", "house", 6, 3.5, 18, 12, 1, 5.4, 1), "1961-090"))
  list.push(A("2418296", 1963, structure("2418296", "house", 6.5, 4, 17, 13, 2, 7.8, 1), "1963-127"))
  list.push(A("2418296", 1995, structure("2418296", "shed", 30, 20, 3, 3, 1, 2.6, 0), "1995-311"))

  // Block A, south row (rue des Érables)
  list.push(A("2418301", 1957, structure("2418301", "house", 6, 4, 17, 12, 1, 5.1, 1), "1957-058"))
  list.push(A("2418302", 1959, structure("2418302", "house", 6.5, 3.5, 18, 11, 2, 7.6, 1), "1959-163"))
  list.push(A("2418303", 1962, structure("2418303", "house", 6, 3.5, 18, 12, 1, 5.4, 1), "1962-114"))
  list.push(A("2418303", 1988, structure("2418303", "garage", 27.5, 16.5, 7, 6, 1, 3.8, 0), "1988-247"))
  list.push(A("2418304", 1960, structure("2418304", "house", 6, 4, 17, 12, 1, 5.2, 1), "1960-099"))
  list.push(A("2418305", 1958, structure("2418305", "house", 6, 3, 19, 13, 1, 5.3, 1), "1958-150"))
  list.push(A("2418305", 1975, structure("2418305", "garage", 26.8, 17.8, 6, 7, 1, 3.5, 0), "1975-188"))
  list.push(A("2418306", 1966, structure("2418306", "house", 6, 3.5, 18, 12, 1, 5.3, 1), "1966-203"))
  list.push(A("2418306", 1999, structure("2418306", "workshop", 29, 2, 5, 4, 1, 3.4, 0), "1999-142"))

  // Block B (avenue Beaulieu)
  list.push(A("2418310", 1974, structure("2418310", "apartment", 5, 3, 28, 30, 3, 10.5, 8), "1974-066"))
  list.push(A("2418311", 1938, structure("2418311", "commercial", 0, 15, 20, 26, 2, 8.5, 1), "1938-011"))

  // Block D: the Lemieux foundry
  list.push(A("2418320", 1931, structure("2418320", "warehouse", 8, 10, 55, 45, 1, 9, 0), "1931-004"))

  // Block C, south side of rue des Érables
  list.push(A("2418331", 1968, structure("2418331", "house", 6.5, 5, 20, 12, 1, 5.4, 1), "1968-172"))
  list.push(A("2418332", 1970, structure("2418332", "house", 6, 5.5, 19, 12, 2, 7.9, 1), "1970-038"))
  list.push(A("2418333", 1971, structure("2418333", "house", 6, 5, 20, 13, 1, 5.5, 1), "1971-129"))
  list.push(A("2418334", 1972, structure("2418334", "house", 6.5, 6, 18, 12, 1, 5.2, 1), "1972-083"))
  list.push(A("2418334", 2008, structure("2418334", "shed", 31, 24, 3, 2.5, 1, 2.5, 0), "2008-219"))
  list.push(A("2418335", 1990, structure("2418335", "house", 6, 5, 20, 13, 2, 8.4, 1), "1990-057"))

  // ---- Stories ------------------------------------------------------------

  // 29 rue des Érables: basement unit declared, disputed for lack of egress.
  list.push(
    entry({
      id: "CDM-2019-0412",
      lotId: "2418333",
      type: "units",
      effective: "2019-08-15",
      title: { en: "Basement apartment added", fr: "Logement ajouté au sous-sol" },
      description: {
        en: "Basement finished as a second dwelling (one bedroom, separate entrance at the side).",
        fr: "Sous-sol aménagé en deuxième logement (une chambre, entrée séparée sur le côté).",
      },
      changes: [{ op: "modify", structureId: "2418333-house", patch: { units: 2 } }],
      submitter: "0x5e0c7a19d2b84f63a1e9c05d7b2f48a3c6e1d094",
      role: "owner",
      source: "declaration",
      evidence: [makeEvidence("basement-layout.pdf", "plan", 412_880)],
      recorded: "2019-09-03T18:42:00Z",
      decision: {
        verdict: "disputed",
        by: PAUL,
        role: "inspector",
        at: "2019-11-14T16:10:00Z",
        note: {
          en: "Site visit: the basement unit has no second means of egress (window well too small). Unit not approved until corrected.",
          fr: "Visite des lieux : le logement du sous-sol n'a pas de deuxième issue (margelle trop petite). Logement non approuvé tant que ce n'est pas corrigé.",
        },
      },
    })
  )

  // 76 avenue Beaulieu: the corner store becomes a café with two flats upstairs.
  list.push(
    entry({
      id: "CDM-2019-0433",
      lotId: "2418311",
      type: "units",
      effective: "2016-05-01",
      title: { en: "Café downstairs, two flats upstairs", fr: "Café au rez-de-chaussée, deux logements à l'étage" },
      description: {
        en: "Change of use from convenience store to café; the upper floor divided into two apartments. Permit 2016-088.",
        fr: "Changement d'usage du dépanneur en café ; l'étage divisé en deux logements. Permis 2016-088.",
      },
      changes: [{ op: "modify", structureId: "2418311-commercial", patch: { units: 3 } }],
      submitter: "0x8c2e4f07a61d93b5e0f2c7a48d19b36e5a0c7f21",
      role: "owner",
      source: "declaration",
      permit: "2016-088",
      evidence: [makeEvidence("permit-2016-088.pdf", "plan", 238_114), makeEvidence("upper-floor-plan.pdf", "plan", 506_302)],
      recorded: "2019-10-07T13:15:00Z",
      decision: {
        verdict: "attested",
        by: PAUL,
        role: "inspector",
        at: "2019-10-21T14:00:00Z",
        note: { en: "Matches permit 2016-088 and the 2017 final inspection.", fr: "Conforme au permis 2016-088 et à l'inspection finale de 2017." },
      },
    })
  )

  // 11 rue du Moulin: second storey.
  list.push(
    entry({
      id: "CDM-2021-0158",
      lotId: "2418291",
      type: "storey",
      effective: "2021-07-20",
      title: { en: "Second storey added", fr: "Ajout d'un étage" },
      description: {
        en: "Second storey over the full footprint, three bedrooms. Height 8.2 m. Permit 2021-044.",
        fr: "Étage complet sur toute l'emprise, trois chambres. Hauteur 8,2 m. Permis 2021-044.",
      },
      changes: [{ op: "modify", structureId: "2418291-house", patch: { storeys: 2, height: 8.2 } }],
      submitter: "0x4d7a2c90e1b53f86a0d4e7c21b95f3a08e6d2c47",
      role: "owner",
      source: "declaration",
      permit: "2021-044",
      evidence: [makeEvidence("elevations-2021-044.pdf", "plan", 1_204_577), makeEvidence("finished-front.jpg", "photo", 2_310_904)],
      recorded: "2021-08-02T20:31:00Z",
      decision: {
        verdict: "attested",
        by: KARIM,
        role: "inspector",
        at: "2021-10-06T15:22:00Z",
        note: { en: "Final inspection passed. Height measured at 8.1 m.", fr: "Inspection finale réussie. Hauteur mesurée : 8,1 m." },
      },
    })
  )

  // 24 rue des Érables: Élise's kitchen renovation.
  list.push(
    entry({
      id: "CDM-2021-0302",
      lotId: "2418303",
      type: "renovation",
      effective: "2021-10-15",
      title: { en: "Kitchen and windows renovated", fr: "Cuisine et fenêtres rénovées" },
      description: {
        en: "Kitchen redone, six windows replaced, no change to the footprint or the structure. Permit 2021-131.",
        fr: "Cuisine refaite, six fenêtres remplacées, aucun changement à l'emprise ni à la structure. Permis 2021-131.",
      },
      changes: [],
      submitter: ELISE,
      role: "owner",
      source: "declaration",
      permit: "2021-131",
      evidence: [makeEvidence("permit-2021-131.pdf", "plan", 201_455)],
      recorded: "2021-11-03T19:05:00Z",
      decision: {
        verdict: "attested",
        by: KARIM,
        role: "inspector",
        at: "2021-11-18T14:40:00Z",
        note: { en: "Interior work only, matches the permit.", fr: "Travaux intérieurs seulement, conformes au permis." },
      },
    })
  )

  // 120 avenue Beaulieu: the foundry is demolished, rezoned and rebuilt.
  list.push(
    entry({
      id: "CDM-2022-0071",
      lotId: "2418320",
      type: "demolition",
      effective: "2022-03-28",
      title: { en: "Foundry building demolished", fr: "Bâtiment de la fonderie démoli" },
      description: {
        en: "Demolition of the 1931 Lemieux foundry building after soil characterisation. Permit D-2022-006.",
        fr: "Démolition du bâtiment de la fonderie Lemieux (1931) après caractérisation des sols. Permis D-2022-006.",
      },
      changes: [{ op: "remove", structureId: "2418320-warehouse" }],
      submitter: BUILDER,
      role: "contractor",
      source: "declaration",
      permit: "D-2022-006",
      evidence: [makeEvidence("demolition-permit-D-2022-006.pdf", "plan", 188_040), makeEvidence("site-cleared.jpg", "photo", 3_004_117)],
      recorded: "2022-04-04T12:12:00Z",
      decision: {
        verdict: "attested",
        by: KARIM,
        role: "inspector",
        at: "2022-04-12T13:30:00Z",
        note: { en: "Site cleared, foundations removed.", fr: "Terrain dégagé, fondations retirées." },
      },
    })
  )
  list.push(
    entry({
      id: "CDM-2024-0035",
      lotId: "2418320",
      type: "zoning",
      effective: "2024-02-19",
      title: { en: "Rezoned from I1 to M1", fr: "Zonage modifié de I1 à M1" },
      description: {
        en: "By-law 2024-03, adopted by council on 19 February 2024: the former foundry site becomes a mixed residential zone (M1).",
        fr: "Règlement 2024-03, adopté par le conseil le 19 février 2024 : l'ancien site de la fonderie devient une zone mixte résidentielle (M1).",
      },
      changes: [{ op: "zone", zone: "M1" }],
      submitter: CLERK,
      role: "clerk",
      source: "declaration",
      evidence: [makeEvidence("by-law-2024-03.pdf", "resolution", 96_512)],
      recorded: "2024-02-20T15:00:00Z",
      decision: {
        verdict: "attested",
        by: CLERK,
        role: "clerk",
        at: "2024-02-20T15:02:00Z",
        note: { en: "Certified copy of the adopted by-law.", fr: "Copie certifiée du règlement adopté." },
      },
    })
  )
  list.push(
    entry({
      id: "CDM-2026-0214",
      lotId: "2418320",
      type: "construction",
      effective: "2026-05-15",
      title: { en: "Six-storey building, 32 homes", fr: "Immeuble de six étages, 32 logements" },
      description: {
        en: "Les Ateliers Lemieux: 32 apartments over six storeys (19.5 m), underground parking. Structure complete; permit 2024-219.",
        fr: "Les Ateliers Lemieux : 32 logements sur six étages (19,5 m), stationnement souterrain. Structure terminée ; permis 2024-219.",
      },
      changes: [{ op: "add", structure: structure("2418320", "apartment", 4, 8, 48, 36, 6, 19.5, 32) }],
      submitter: BUILDER,
      role: "contractor",
      source: "declaration",
      permit: "2024-219",
      evidence: [makeEvidence("permit-2024-219.pdf", "plan", 356_880), makeEvidence("site-plan-rev-C.pdf", "plan", 2_870_431), makeEvidence("structure-complete.jpg", "photo", 3_512_006)],
      recorded: "2026-06-02T14:48:00Z",
    })
  )

  // 17 rue du Moulin: a shed too close to the line, accepted as a minor variance.
  list.push(
    entry({
      id: "CDM-2023-0126",
      lotId: "2418292",
      type: "accessory",
      effective: "2023-05-20",
      title: { en: "Garden shed", fr: "Remise de jardin" },
      description: {
        en: "3 × 2.5 m shed in the back corner, 0.6 m from the east lot line (existing concrete slab reused).",
        fr: "Remise de 3 × 2,5 m dans le coin arrière, à 0,6 m de la ligne est (dalle de béton existante réutilisée).",
      },
      changes: [{ op: "add", structure: structure("2418292", "shed", 31.5, 21.4, 3, 2.5, 1, 2.4, 0) }],
      submitter: "0x6b1f3e8a04c27d95b3e0a6f18c2d74e9b05a3c88",
      role: "owner",
      source: "declaration",
      evidence: [makeEvidence("shed-site-plan.jpg", "photo", 1_602_338)],
      recorded: "2023-06-01T17:20:00Z",
      decision: {
        verdict: "variance",
        by: KARIM,
        role: "inspector",
        at: "2023-07-11T14:05:00Z",
        rules: ["setback"],
        note: {
          en: "Minor variance granted by resolution 2023-117: shed kept at 0.6 m from the line, neighbour's written consent on file.",
          fr: "Dérogation mineure accordée par la résolution 2023-117 : remise maintenue à 0,6 m de la ligne, consentement écrit du voisin au dossier.",
        },
      },
    })
  )

  // 36 rue des Érables: an undeclared extension, reported and confirmed.
  list.push(
    entry({
      id: "CDM-2024-0092",
      lotId: "2418305",
      type: "extension",
      effective: "2023-08-01",
      title: { en: "Rear extension (undeclared)", fr: "Agrandissement arrière (non déclaré)" },
      description: {
        en: "Recorded after a site visit following report RPT-2024-0031: 9 × 12 m single-storey rear extension built in summer 2023 without a permit.",
        fr: "Inscrit après une visite des lieux à la suite du signalement RPT-2024-0031 : agrandissement arrière de 9 × 12 m, un étage, construit à l'été 2023 sans permis.",
      },
      changes: [{ op: "add", structure: structure("2418305", "extension", 19, 3, 9, 12, 1, 4.2, 0) }],
      submitter: KARIM,
      role: "inspector",
      source: "inspection",
      evidence: [makeEvidence("site-visit-2024-04-02.pdf", "report", 684_120), makeEvidence("rear-yard.jpg", "photo", 2_880_413)],
      recorded: "2024-04-02T19:45:00Z",
      decision: {
        verdict: "attested",
        by: KARIM,
        role: "inspector",
        at: "2024-04-02T19:46:00Z",
        note: {
          en: "Measured on site. Lot coverage 45.4 % (max 40 %), rear setback 4.0 m (min 7.5 m). Owner notified on 3 April 2024.",
          fr: "Mesuré sur place. Taux d'occupation 45,4 % (max. 40 %), marge arrière 4,0 m (min. 7,5 m). Propriétaire avisé le 3 avril 2024.",
        },
      },
    })
  )

  // 13 rue des Érables: a covered porch, waiting for the inspector.
  list.push(
    entry({
      id: "CDM-2026-0301",
      lotId: "2418331",
      type: "extension",
      effective: "2026-08-10",
      title: { en: "Covered porch at the back", fr: "Galerie couverte à l'arrière" },
      description: {
        en: "4 × 3 m roofed porch against the back wall, open on three sides. Permit 2026-152.",
        fr: "Galerie couverte de 4 × 3 m contre le mur arrière, ouverte sur trois côtés. Permis 2026-152.",
      },
      changes: [{ op: "add", structure: structure("2418331", "porch", 18.5, 9, 4, 3, 1, 3.2, 0) }],
      submitter: "0x1c9e5a3f07d28b64e0a1c7f39d5b82e6a4f0d153",
      role: "owner",
      source: "declaration",
      permit: "2026-152",
      evidence: [makeEvidence("porch-drawing.pdf", "plan", 318_775)],
      recorded: "2026-08-24T21:02:00Z",
    })
  )

  return list
}

function buildReports(): Report[] {
  const r: Omit<Report, "anchor"> = {
    id: "RPT-2024-0031",
    lotId: "2418305",
    category: "undeclared",
    description: {
      en: "A large extension went up behind the house last summer. I never saw a permit posted and it comes very close to our back fence.",
      fr: "Un gros agrandissement a été construit derrière la maison l'été dernier. Je n'ai jamais vu de permis affiché et il arrive très près de notre clôture arrière.",
    },
    reporter: MAYA,
    evidence: [makeEvidence("from-our-yard.jpg", "photo", 2_140_558)],
  }
  const report: Report = { ...r, anchor: makeAnchor(r.id, "2024-03-11T22:14:00Z", reportPayload(r as Report)) }
  report.resolution = {
    outcome: "confirmed",
    by: KARIM,
    note: {
      en: "Confirmed on site. Structure recorded as CDM-2024-0092.",
      fr: "Confirmé sur place. Bâtiment inscrit sous CDM-2024-0092.",
    },
    anchor: makeAnchor(`${r.id}:resolution`, "2024-04-02T19:50:00Z", { report: r.id, outcome: "confirmed" }),
  }
  return [report]
}

export function seedState(): DemoState {
  return {
    version: 1,
    entries: buildEntries(),
    reports: buildReports(),
    identity: null,
    settings: { failNext: false, slowNetwork: false },
  }
}

/** Frozen seed shared by the server render and the first client render. */
export const SEED: DemoState = seedState()
