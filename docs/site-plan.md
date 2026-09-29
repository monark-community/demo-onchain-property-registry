# Cadastrum: site plan

Status: written before the build, and kept in sync with what shipped (see §12 for implementation decisions made along the way).

- Product: **Cadastrum**, a public, on-chain registry of land parcels and the buildings on them.
- Authoritative description: https://www.monark.io/en/project/onchain-property-registry
- Branding: **independent** (`monark-branded: false`). Cadastrum has its own identity. Monark appears only as the "Built with Monark" footer credit (brand guidelines §12). Guidelines §9 (EN/FR) and §11 (disclaimers) apply.
- Stack: Next.js 16 (App Router, `src/`, TypeScript strict), pnpm, Tailwind CSS v4, shadcn/ui on the Monark UI registry (re-themed), `lucide-react`.

---

## 1. Product brief

**Target users.**

| Who | What they need from a lot's record |
|-|-|
| **Buyers, renters and their notaries or agents** | Before signing: is that garage, basement unit or second storey actually recorded and signed off, or is there an open issue? |
| **Owners** | A record of the work they did, attested once, that they can point any future buyer, insurer or lender to. |
| **Municipal inspectors and clerks** | One queue of declared changes and citizen reports, and a record of their own decisions that nobody can quietly edit later. |
| **Neighbours and community members** | A legitimate, accountable way to say "that structure was never declared" without calling city hall three times. |

**Core job to be done.** *"Tell me what was built on this lot, when, who declared it and who signed it off, and whether it still fits the zoning, in a form I can trust without trusting whoever shows it to me."*

**Domain concepts** (each explained in plain words where the site first uses it):

| Concept | Meaning in Cadastrum |
|-|-|
| Lot (parcel) | A piece of land with a cadastral number (e.g. *Lot 2 418 305*), a boundary, an area and a zone. |
| Structure | A building on a lot (house, garage, shed, extension, apartment building) with a footprint, height, storeys and dwelling units. |
| Entry | One declared change to a lot: construction, extension, accessory building, added storey, change in units, renovation, demolition, zoning change. Tied to a wallet and a role, timestamped and anchored on-chain. |
| Attestation | An inspector's signed decision on an entry: **attested** (matches what was built), **attested with a variance** (a minor departure the city accepted), or **disputed** (with a reason). |
| Report | A community member's signed report of a possible irregularity on a lot. It opens a review; an inspector confirms or dismisses it. |
| Zoning envelope | The part of the lot where building is allowed (front, side and rear setbacks), plus maximum lot coverage, height and number of units. |
| Compliance status | Derived from the attested record: **Compliant**, **Variance granted**, **Under review** (open entry or report) or **Violation**. |
| Evidence | Plans and photos attached to an entry. Files live on IPFS; only their content identifier (CID) goes on-chain. |
| Anchor | The on-chain transaction holding the entry's content hash, so anyone can check the record wasn't altered. |

**What the Lovable version got wrong or left out.**

- It was a generic real-estate landing page: gradient hero, invented social proof ("1,200+ active contributors", "5,000+ verified properties"), testimonials and "Earn rewards" badges that the product never delivered.
- The "map" was three pulsing dots on a faint grid, and selecting one showed four static fields. No parcels, no buildings, no history, no time.
- The submission form wasn't tied to any lot, didn't show what would change, and ended with a toast claiming it was "recorded on the blockchain" after a two-second timer. Nothing was stored, and there was no failure state.
- The core ideas on the documentation page (a wallet-signed, timestamped audit trail, role-based submissions, validation of changes, identifying compliance or violations over time, IPFS evidence) were missing or only named in bullet lists.
- Role dashboards showed made-up counters ("12 properties", "8 tours scheduled") for a buyer/seller/agent split that has nothing to do with a registry.
- English only, no disclaimers, a demo banner stuck over the content, Vite + Lovable tooling.

## 2. Value proposition

**For anyone buying, renting, building or inspecting in a municipality, Cadastrum is the public record of every lot and every structure on it, where owners declare changes, inspectors sign them off and each entry is anchored on-chain, so you can check a property's real history yourself instead of trusting scattered files, word of mouth or the seller's say-so.**

Supporting benefits, as outcomes:

1. **You know what you're signing for.** See every structure on a lot, when it appeared, who declared it and whether an inspector signed it off, before you buy, rent or build.
2. **Your work counts once, for good.** Declare an extension with its plans, get it attested, and every future buyer, insurer or lender can check it without another visit to city hall.
3. **Nobody can quietly rewrite the file.** Every entry, attestation and report is signed by a named role and anchored on-chain; edits become new entries, never overwrites.

## 3. Hero

- **Headline (8 words):** "What was built, when, and who signed off." / FR: « Ce qui a été bâti, quand, et qui l'a validé. »
- **Subheadline:** "Cadastrum is the public record of every lot and every structure on it. Owners declare changes, inspectors attest them, and each entry is anchored on-chain, so anyone can check a property before they buy, rent or build." / FR: « Cadastrum est le registre public de chaque lot et de chaque bâtiment qui s'y trouve. Les propriétaires déclarent leurs travaux, les inspecteurs les attestent et chaque inscription est ancrée on-chain : tout le monde peut vérifier un immeuble avant d'acheter, de louer ou de construire. »
- **Primary CTA:** "Open the registry" → `/{locale}/app`. FR « Ouvrir le registre ».
- **Secondary CTA:** "How a record is made" → `/{locale}/how-it-works`. FR « Comment naît une inscription ».
- **Hero visual: the product itself.** A live, server-rendered plan of the demo neighbourhood (the same SVG the registry uses), with one lot drawn out and a year scrubber under it. Dragging from 1931 to 2026 grows and removes structures and recolours lots by their compliance at that date; the selected lot's latest entries sit beside the plan. It's the one thing a photo can't show: a lot's history over time. The hero opens on 2026 with lot *2 418 305* (the unrecorded extension) highlighted, so the first thing a visitor reads is a violation that a buyer would want to know about.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects to the visitor's preferred language (fallback English).

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` | Make the case in one scroll and send people into the registry. | Hero (headline, CTAs, live plan with year scrubber) · "A lot's story is in four filing cabinets" (the problem, three short facts) · Three outcomes · "One lot, three signatures" (owner declares → inspector attests → neighbour reports, with the surveyor photo) · "What goes on-chain" (small diagram: entry → content hash → anchor; files → IPFS CID) · aerial photo band with one line · FAQ (6) · closing CTA band |
| `/app` | **Registry explorer.** Search by address or lot number, browse the plan, see recent entries. | Search bar · plan with legend, year scrubber and status filter · lot list (accessible alternative to the plan) · recent entries across the registry |
| `/app/lots/[id]` | **Lot record.** The page a buyer, notary or inspector opens. | Header (address, lot number, zone, area, compliance verdict) · actions (declare a change, report an irregularity, copy link) · lot plan (boundary, setback envelope, footprints, year scrubber) · facts vs zoning (coverage, height, units, setbacks) · entry timeline with attestations, anchors and evidence |
| `/app/declare` | **Declare a change** (owner flow). | Stepper: what changed → details with live plan and zoning check → evidence (IPFS) → review and sign → result |
| `/app/review` | **Inspector queue.** | Tabs: declarations to attest, reports to review · item list · review panel (before/after plan, zoning check, evidence, decision) |
| `/app/verify` | **Verify an entry** by entry ID or transaction hash. | Input with examples · proof card (anchor, block, timestamp, signer and role, content hash check, evidence CIDs, attestations) |
| `/how-it-works` | Explains the trust model for officials and sceptical buyers. Justified because a registry is only useful if people understand who can write what and what "anchored" guarantees. | Lifecycle diagram (declared → pending → attested / variance / disputed) · roles and permissions table · zoning rules used by the demo · what's on-chain vs IPFS vs off-chain · limits of the demo |
| `/credits` | Photo credits (linked from the footer). | Photos with photographer and Unsplash links · fonts and icons |
| `/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow`. | Three tiers, rationale, assumptions |
| 404 | Localized not-found with a route back to the registry and search. | |

**Header** (sticky, 60px): Cadastrum logo · links "Registry" (`/app`) and "How it works" · EN/FR switch · theme toggle · primary action ("Open the registry" on marketing pages; the connect-wallet control inside `/app`). Inside `/app` a second bar holds the app's sections (Explore, Declare, Review, Verify), the "Demo · simulated data" badge and demo controls. Mobile: logo + menu button opening a full-height sheet with links, switches and the action.

**Footer:** one-line description · links (Registry, How it works, Verify an entry, Credits) · "Demo · simulated data · Val-des-Ormes is a fictional municipality" · photo credit link · "Built with Monark" credit (muted, 12–13px, linking to monark.io) · project documentation and GitHub links.

## 5. Feature highlights

| Feature | User benefit | Where it appears | Proven by |
|-|-|-|-|
| **Year scrubber** | See a lot as it stood in any year, and when each structure appeared. | Home hero, explorer, lot record | Flow 1 |
| **Zoning check before you sign** | Know whether your change fits the zone (coverage, height, units, setbacks) before you declare it. | Declare flow, review panel, lot facts | Flow 2 |
| **Signed attestations with a seal** | An inspector's decision is a signed, dated entry, visible to all, never an email. | Lot timeline, review queue | Flow 3 |
| **Accountable reports** | Neighbours can report an undeclared structure; the report is signed, one per person, and reviewed in the open. | Lot record, review queue | Flow 4 |
| **Proof you can check yourself** | Anyone can recompute an entry's content hash and match it to its on-chain anchor. | Verify page, every entry | Flow 5 |

## 6. Key flows

Demo identities (chosen in the simulated wallet): **Élise Martel**, owner of 24 rue des Érables; **Karim Haddad**, building inspector for the (fictional) Ville de Val-des-Ormes; **Maya Chen**, resident of rue des Érables. Signing never costs the user anything: network fees are sponsored by the municipality (shown on every prompt).

Every signed action goes through the same simulated pipeline: wallet prompt (confirm or reject) → *Waiting for the network…* (1.5–3 s, with a progress line) → **Anchored in block #N** (confirmed) or **failed** (rejected in the wallet, or network failure forced by the demo controls), each with a retry.

1. **Look up a lot (no wallet).** Search "36 rue des Érables" or "2 418 305", or click the lot on the plan → lot record opens: status *Violation*, coverage 46 % vs 40 % allowed → scrub back to 2019 and the rear extension disappears; 2024 it appears with a hatched "undeclared" outline → read the timeline: Maya's report (Mar 2024), Karim's confirmation (Apr 2024) → open the anchor. Empty state: "No lot matches '…'". Loading: skeleton while the local registry state hydrates. Unknown lot id: localized 404.
2. **Declare a change (owner).** Connect as Élise → *Declare a change* on 24 rue des Érables → choose *Accessory building* → set 6 m × 4 m, one storey, 3.8 m → plan draws the dashed footprint; coverage meter rises to 38 % of 40 % (fits) → try 8 × 6 m: meter crosses the line, *Exceeds maximum lot coverage* warning, signing still allowed but flagged → attach a plan (simulated IPFS pin: uploading → pinned, CID shown) → review before/after → sign → pending → confirmed: *Declared. Awaiting attestation.* The lot turns *Under review*. Failed: wallet rejected, or network error with retry. Élise on a lot she doesn't own: "Only the owner of this lot can declare changes. You can report an irregularity instead."
3. **Attest or dispute (inspector).** Switch to Karim → Review queue shows Élise's declaration and older pending ones (the Lemieux foundry redevelopment) → open one: before/after plan, zoning check, evidence → **Attest** (optional note, "grant a variance" when outside the rules), or **Dispute** (reason required) → sign → pending → confirmed: the seal stamps onto the entry with its block number; the lot status updates. Empty queue: "Nothing waiting. Every declaration and report has a decision."
4. **Report an irregularity (resident).** Connect as Maya → lot 42 rue des Érables → *Report an irregularity* → category (undeclared structure, units differ from the record, too close to the lot line, safety concern) + description (+ optional photo, pinned to IPFS) → sign → confirmed: lot becomes *Under review* and the report joins Karim's queue. Guard: "You already have an open report on this lot." Karim then confirms (lot → *Violation*) or dismisses it.
5. **Verify an entry.** Anyone → *Verify* → paste an entry ID or transaction hash (or pick an example) → proof card: block, timestamp, signer and role, recomputed content hash **matches** the anchored one, evidence CIDs, attestations. Error states: malformed input ("That's not an entry ID or a transaction hash"), unknown ("No entry is anchored under this hash on the demo network").

## 7. Content (EN / FR)

Tone: plain, exact and calm, like a good notary or a well-run city service. Short declarative sentences, concrete nouns (lots, sheds, signatures), no hype, no crypto slang. "On-chain" and "wallet"/« portefeuille » stay as French speakers use them. French is written natively for Québec (« lot », « inscription », « attestation », « dérogation mineure », « marge de recul »).

The full copy lives in `src/i18n/dictionaries/en.ts` and `fr.ts`; the key sections:

**Problem ("A lot's story is in four filing cabinets" / « L'histoire d'un lot dort dans quatre classeurs »)**
- EN: "Permits sit at city hall, the cadastre at the land registry, inspection reports in a binder, and the rest in the seller's memory. When they disagree, the buyer finds out last."
- FR : « Les permis sont à l'hôtel de ville, le cadastre au registre foncier, les rapports d'inspection dans un cartable, et le reste dans la mémoire du vendeur. Quand ils se contredisent, c'est l'acheteur qui l'apprend en dernier. »

**Three outcomes**
1. "Know what you're signing for" — "Every structure on a lot, when it appeared, who declared it and whether an inspector signed it off." / « Sachez ce que vous achetez » — « Chaque bâtiment d'un lot, depuis quand il existe, qui l'a déclaré et si un inspecteur l'a attesté. »
2. "Declare once, for good" — "Your extension, its plans and its attestation, checkable by every future buyer, insurer or lender." / « Déclarez une fois pour toutes » — « Votre agrandissement, ses plans et son attestation, vérifiables par chaque futur acheteur, assureur ou prêteur. »
3. "Nobody rewrites the file" — "Every entry is signed by a named role and anchored on-chain. Corrections are new entries, never overwrites." / « Personne ne réécrit le dossier » — « Chaque inscription est signée par un rôle identifié et ancrée on-chain. Une correction est une nouvelle inscription, jamais un effacement. »

**One lot, three signatures** — "The owner declares. The inspector attests. The neighbour can report. Each signature is on the record, with who, what role and when." / « Une propriétaire déclare. Un inspecteur atteste. Une voisine peut signaler. Chaque signature reste au dossier : qui, à quel titre, et quand. »

**What goes on-chain** — "The entry's content hash, the signer and the time go on-chain. Plans and photos go to IPFS, and only their fingerprint is anchored. Personal details stay off both." / « L'empreinte de l'inscription, le signataire et l'heure vont on-chain. Les plans et les photos vont sur IPFS, et seule leur empreinte est ancrée. Les renseignements personnels ne vont ni sur l'un ni sur l'autre. »

**FAQ** (EN / FR)
1. *Does this replace the land registry?* No. The official cadastre still defines lots and ownership. Cadastrum records what happens on them: structures, changes, inspections, reports. / *Est-ce que ça remplace le registre foncier ?* Non. Le cadastre officiel définit toujours les lots et la propriété. Cadastrum consigne ce qui s'y passe : bâtiments, travaux, inspections, signalements.
2. *Who can write to a lot's record?* Its owner (or their contractor) declares changes, municipal inspectors attest or dispute them, and any verified resident can file a report. Everyone can read. / *Qui peut écrire au dossier d'un lot ?* Le propriétaire (ou son entrepreneur) déclare les travaux, les inspecteurs municipaux les attestent ou les contestent, et tout résident vérifié peut signaler. Tout le monde peut lire.
3. *What if an entry is wrong?* It's never edited. An inspector disputes it, or the owner declares a correction; both stay visible, in order. / *Et si une inscription est fausse ?* Elle n'est jamais modifiée. Un inspecteur la conteste ou le propriétaire déclare une correction ; les deux restent visibles, dans l'ordre.
4. *Is my personal information on-chain?* No. The chain holds a content hash, a wallet address and a role. Names and contact details stay with the municipality. / *Mes renseignements personnels sont-ils on-chain ?* Non. La chaîne contient une empreinte, une adresse de portefeuille et un rôle. Les noms et coordonnées restent à la municipalité.
5. *Do I pay a fee to declare something?* No. The municipality sponsors the network fees for declarations, attestations and reports. / *Faut-il payer pour déclarer ?* Non. La municipalité paie les frais de réseau des déclarations, attestations et signalements.
6. *Can I rely on this for a purchase?* Not in this demo: the town, lots and people are fictional and nothing here is legal advice. In production, an attested entry is evidence to bring to your notary, not a substitute for one. / *Puis-je m'y fier pour un achat ?* Pas dans cette démo : la ville, les lots et les personnes sont fictifs, et rien ici n'est un avis juridique. En production, une inscription attestée est une preuve à apporter à votre notaire, pas un substitut.

**Closing CTA** — "Pick a lot. Scrub back to 1931." / « Choisissez un lot. Remontez jusqu'en 1931. » → "Open the registry" / « Ouvrir le registre ».

**Empty and error states** (all in both dictionaries): search no match; empty review queue; no entries yet on a lot; verify malformed / unknown; wallet rejected ("You declined the signature. Nothing was recorded." / « Vous avez refusé la signature. Rien n'a été inscrit. »); network failure ("The network didn't confirm the transaction. Nothing was recorded; you can try again." / « Le réseau n'a pas confirmé la transaction. Rien n'a été inscrit ; vous pouvez réessayer. »); not owner; duplicate report; 404 ("This lot isn't on the plan." / « Ce lot n'est pas au plan. »); generic error boundary.

## 8. Aesthetics

**Concept: "Surveyor's plat, signed in ink."** Warm plat paper, precise ink lines, a registry green for what's attested, ochre for what's pending, brick for violations. Cadastrum's audience makes decisions with legal weight (notaries, inspectors, buyers about to sign), and its raw material is the plan: lot lines, setbacks, footprints. The site should feel like an exact, public document you'd trust at a counter, not a crypto dashboard. Everything that matters is drawn as a line on a plan, and the chain is the quiet part underneath.

**Palette.** Hex values, applied to the shadcn roles in `globals.css`. Ratios computed with the WCAG formula (AA needs 4.5:1 for text, 3:1 for UI and large text).

| Role | Light | Dark |
|-|-|-|
| `background` | `#F4F1E8` plat paper | `#131713` ink wash |
| `foreground` | `#1C211E` survey ink | `#ECE8DC` |
| `card` | `#FBF9F4` | `#1A1F1A` |
| `primary` | `#1F5A46` registry green | `#86C9AA` |
| `primary-foreground` | `#F7F4EA` | `#0E1A13` |
| `muted` | `#E9E4D6` | `#232A23` |
| `muted-foreground` | `#565B52` | `#A9AD9F` |
| `accent` | `#E7DEC6` ochre wash | `#2D3429` |
| `accent-foreground` | `#1C211E` | `#ECE8DC` |
| `border` / `input` | `#CFC7B1` | `#353D33` |
| `ring` | `#1F5A46` | `#86C9AA` |
| `destructive` | `#A3301D` brick | `#EE8A75` |
| `warning` (pending) | `#7A4E00` on `#F3E3B5` | `#E9C46A` on `#3A2F12` |
| `chart-1…5` | `#1F5A46`, `#B07D12`, `#A3301D`, `#4E6470`, `#7A5A3E` | `#86C9AA`, `#E0B04A`, `#EE8A75`, `#9DB3BE`, `#C9A57F` |

Contrast (light / dark): foreground on background 14.46 / 14.78 · foreground on card 15.52 / 13.66 · muted-foreground on background 6.17 / 7.90 · muted-foreground on muted 5.49 / 6.42 · primary-foreground on primary 7.31 / 9.31 · primary on background 7.13 / 9.44 · accent-foreground on accent 12.18 / 10.49 · destructive-foreground on destructive 6.66 / 7.75 · destructive on background 6.20 / 7.35 · warning on warning-bg 5.64 / 7.88 · ring on background 7.13 / 9.44 · chart colours on card ≥ 3.45 (chart-2 light, graphics only) and ≥ 5.9 for the rest. Borders are decorative (1.5:1); every control also has a text label or a focus ring.

**Type.** Two families via `next/font`:
- **Public Sans** (400, 500, 600, 700) for everything readable. It was drawn for public services (the U.S. Web Design System), which is exactly the register: civic, neutral, highly legible.
- **IBM Plex Mono** (400, 500) for lot numbers, measurements, hashes, CIDs, block numbers and the small uppercase plan labels, like the annotation lettering on a survey plan.
- Scale (px): 12 / 14 / 16 / 18 / 20 / 24 / 30 / 40 / 52 (hero, 36 on mobile). Headings 700 with −0.02em tracking; eyebrow labels mono 12px uppercase, +0.08em.

**Logo.** A mark drawn like a lot on a plan: a square boundary, a diagonal lot line splitting it, and a filled survey monument (dot) at one corner; wordmark "Cadastrum" in Public Sans 700. Favicon: the mark alone on registry green. Built in SVG (`src/components/site/logo.tsx`, `src/app/icon.svg`).

**Shape.** Radius 4px (paper forms, not pills). 1px hairline borders do the structural work; no drop shadows except on overlays. Dashed lines mean *proposed or pending* (surveyors' convention); 45° hatching means *violation*; a solid fill means *attested*. Motion is short and purposeful: 180 ms ease-out on state, a 600 ms line-draw when a lot is selected, and the seal. Everything honours `prefers-reduced-motion`.

**Imagery.** Photography is used for places and people only, all top-down or at-work, warm daylight: an aerial of a street grid (the real-world counterpart of the plan), a surveyor at work in a city street, a house frame seen from above (a change in progress). Everything that explains the product is drawn in code: the plan, the timeline, the on-chain diagram, the lifecycle.

**Signature moments.**
1. **Scrub the years.** Drag a year slider and the neighbourhood rebuilds itself: the 1931 foundry, the 1960s bungalows, the 1988 garage, the 2022 demolition, the new building under construction. Lots recolour with their compliance at that date.
2. **The seal.** When an inspector's attestation confirms, a round ink seal with the block number stamps onto the entry (a short scale-and-settle), and the lot's status line updates beside it.
3. **Check before you sign.** While declaring, the new footprint draws dashed on the lot plan and a coverage meter rises toward the zone's limit line; cross it and the meter turns brick with the exact number.

**What we deliberately avoid.** Blue/purple "AI" gradients, frosted glass, neon, glowing coins and 3D blobs: a registry has to look like a document, and those read as speculation. No map tiles pretending to be a GIS (a drawn plan is clearer and ours). No rounded-xl shadowed card grids (default shadcn look). No gradients at all, no emoji, no stock "handshake over keys" photos, no token or reward mechanics.

## 9. Assets

| Asset | Purpose and placement |
|-|-|
| `public/images/aerial-street-grid.jpg` (Tom Rumble, Unsplash) | Home: aerial band ("Every lot on this street has a story"). |
| `public/images/surveyor-street.jpg` (Agustín Pimentel, Unsplash) | Home: "One lot, three signatures" section; how-it-works header. |
| `public/images/frame-from-above.jpg` (Avel Chuklanov, Unsplash) | Home: problem section / how-it-works "a change in progress". |
| Neighbourhood plan (SVG, code) | Hero, explorer, lot record, declare, review. |
| On-chain diagram (SVG, code) | Home and how-it-works. |
| Lifecycle diagram (SVG, code) | How-it-works. |
| Seal (SVG, code) | Lot timeline, review. |
| Logo mark + favicon (SVG) | Header, footer, `icon.svg`, OG image. |
| Open Graph image (`opengraph-image.tsx`) | Per locale, product name + headline + mini plan. |

Icons: `lucide-react` only. Every photo is listed with its Unsplash URL and photographer in `docs/assets.md` and credited on `/credits`.

## 10. Pricing strategy

Cadastrum is a public record: **reading, verifying and reporting must stay free**, or the registry loses the people who keep it honest. The paying customers are the ones who run it and the ones who earn money from it.

| Tier | Who | Price | Includes |
|-|-|-|-|
| **Public** | Everyone | Free | Search, lot records, year scrubber, verification, reports (fees sponsored). |
| **Professional** | Notaries, agents, lenders, insurers, private inspectors | CA$29 per user / month | Watchlists and alerts on lots, certified lot extracts (PDF with proofs), 5,000 API lookups/month. |
| **Municipality** | Cities and MRCs operating the registry | CA$0.06 per lot per month, minimum CA$250/month | Inspector console and credentials, archive import, sponsored network fees, open-data export, support. A 12,000-lot town pays CA$720/month. |

Reasoning: municipalities already pay for land-records and permit software and bear the cost of disputes; a per-lot price scales with their size and budget and includes network fees so citizens never touch gas. Professionals get direct commercial value (faster due diligence), so a per-seat fee is fair and familiar. `/pricing` exists for internal review only: unlinked, not in the sitemap, `robots: noindex, nofollow`. No price is mentioned anywhere else.

## 11. Out of scope

- No real chain, wallet, IPFS or backend: all simulated in the browser, persisted in `localStorage`.
- Not a GIS: a hand-drawn plan of one fictional neighbourhood (Quartier du Moulin, Val-des-Ormes), no map tiles, no geocoding.
- No ownership transfers, mortgages or titles (that's the land registry's job), no payments, no tokens.
- No identity verification or credential issuance flow; the three demo identities come pre-verified.
- No permit application workflow (Cadastrum records what was built and decided, it doesn't issue permits).
- No accounts, notifications, alerts or PDF extracts (those are in the Professional tier story only).

## 12. Implementation decisions

(Updated while building.)

- **Fictional municipality.** Val-des-Ormes and its people are fictional so the demo never impersonates a real city registry. Lot numbers follow the Québec cadastre style (7 digits, "2 418 305").
- **Disclaimer wording.** Nothing in Cadastrum moves value, so the §11 "not financial advice" line is adapted to "Testnet demo · not legal advice · no real records" next to every signing action; "Demo · simulated data" is in the footer and the app bar.
- **Geometry in metres.** The plan's SVG units are metres, so coverage, setbacks and heights are computed on the same geometry that's drawn.
