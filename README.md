# Cadastrum

**The public record of every lot and every structure on it.** Owners declare changes, municipal inspectors attest or dispute them, residents can report what's missing, and every entry is anchored on-chain so anyone can check a property's history before they buy, rent or build.

This repository is the interactive demo, set in the fictional town of Val-des-Ormes (Québec). Everything is simulated in the browser: no real chain, wallet, IPFS or backend.

- Project documentation: https://www.monark.io/en/project/onchain-property-registry
- Site plan (product brief, identity, flows, copy): [`docs/site-plan.md`](docs/site-plan.md)
- Assets and credits: [`docs/assets.md`](docs/assets.md)
- Screenshots: [`docs/screenshots/`](docs/screenshots/)

Cadastrum is an independent product incubated by [Monark](https://www.monark.io).

## What you can do in the demo

1. **Look up a lot**: search an address or a lot number, open its record, drag the year scrubber from 1931 to today and watch structures appear and disappear.
2. **Declare a change** (as Élise, the owner of 24 rue des Érables): pick a change, size it on the plan, see the zoning check move, attach a plan (pinned to IPFS), sign.
3. **Attest or dispute** (as Karim, the city's inspector): review the queue, attest, attest with a variance, or dispute with a reason; the seal stamps onto the record.
4. **Report an irregularity** (as Maya, a resident): file a signed report; the lot goes under review.
5. **Verify an entry**: paste an entry ID or a transaction hash; the content hash is recomputed and compared with the anchored one.

Every signed action shows the wallet prompt and a pending, confirmed, rejected or failed state. The **Demo controls** (in the app bar) can force the next transaction to fail, slow the network, or reset the demo.

## Run it locally

Requirements: Node 22 and pnpm 10.

```sh
pnpm install
pnpm dev          # http://localhost:3150
```

Checks and production build:

```sh
pnpm lint
pnpm typecheck
pnpm build && pnpm start   # http://localhost:3150
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL used in metadata and the sitemap (default `https://cadastrum.monark.io`).

Screenshots (with the production server running): `pnpm screenshots` writes to `docs/screenshots/`.

## How the simulation works

All demo logic lives in [`src/lib/demo/`](src/lib/demo), behind small typed functions, so it could be replaced by wagmi/viem, a pinning service and an indexer without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Domain types: lots, structures, changes, entries, decisions, reports, anchors. |
| `world.ts` | The fictional neighbourhood: streets, 20 lots (geometry in metres), zoning rules, people and roles. |
| `seed.ts` | The seed registry: archive imports since 1931 plus the stories (an undeclared extension, a variance, a disputed basement unit, a rezoned foundry). |
| `registry.ts` | Pure derivations: structures at a date, coverage/height/units/setbacks against the zone, lot status (compliant, variance, under review, violation). |
| `chain.ts` / `hash.ts` | Simulated anchoring: block numbers on a 12 s clock, deterministic content hashes and transaction hashes, IPFS-style CIDs, network latency and failures. |
| `ops.ts` | State transitions applied after a transaction confirms: declare, decide, file and resolve reports. |
| `store.ts` | A tiny external store persisted to `localStorage` (every access wrapped in try/catch); the server and first render always use the seed so pages prerender cleanly. |

The wallet is a set of three pre-verified demo identities (owner, inspector, resident). Signing never costs anything: network fees are presented as sponsored by the municipality.

## Project structure

```
src/
  app/[locale]/          routes (en, fr): home, how-it-works, credits, pricing (unlinked), 404
  app/[locale]/app/      the registry: explorer, lots/[id], declare, review, verify
  components/plan/       the SVG plan, legend and year scrubber
  components/registry/   lot record, declare flow, review queue, reports, verification, seal
  components/demo/       simulated wallet, signature prompt, transaction feedback, demo controls
  components/site/       header, footer, logo, language and theme switches
  components/ui/         shadcn/ui and @monark/ui registry components, re-themed
  i18n/                  typed EN/FR dictionaries
  lib/demo/              the simulated data layer (see above)
  proxy.ts               redirects / to the visitor's language
```

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, pnpm). No `vercel.json` and no environment variables are required; every page is prerendered.

## Disclaimer

Demo · simulated data. Val-des-Ormes, its lots and its people are fictional. Nothing here is legal advice.
