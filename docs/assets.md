# Assets

All photographs are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (no Unsplash+ images; each download was checked to come from `images.unsplash.com`). They were resized to at most 2400 px on the long edge, compressed (JPEG q76) and are served with `next/image`. Photographers are credited on `/credits` (linked from the footer).

| File | Unsplash page | Photographer | Used on |
|-|-|-|-|
| `public/images/aerial-street-grid.jpg` | https://unsplash.com/photos/top-view-photography-of-houses-at-daytime-7lvzopTxjOU | [Tom Rumble](https://unsplash.com/@tomrumble) | Home, closing call to action |
| `public/images/surveyor-street.jpg` | https://unsplash.com/photos/man-in-orange-vest-uses-surveying-equipment-outdoors-l2_XkKXObm0 | [Agustín Pimentel](https://unsplash.com/@agustin_pimentel) | Home, "One lot, three signatures"; How it works header |
| `public/images/frame-from-above.jpg` | https://unsplash.com/photos/beige-wooden-house-layout-IB0VA6VdqBw | [Avel Chuklanov](https://unsplash.com/@chuklanov) | Home, "The problem" |

## Drawn in code

| Asset | Where |
|-|-|
| Plan of Quartier du Moulin (`src/components/plan/plan.tsx`, SVG in metres, HTML label overlay) | Home hero, explorer, lot record, declare, review |
| Year scrubber (`src/components/plan/year-scrubber.tsx`) | Home hero, explorer, lot record |
| Inspector's seal (`src/components/registry/seal.tsx`) | Lot timeline, review result |
| On-chain diagram (`src/components/home/onchain-diagram.tsx`) | Home |
| Entry lifecycle diagram | How it works |
| Logo mark and wordmark (`src/components/site/logo.tsx`), favicon (`src/app/icon.svg`) | Header, footer, browser tab |
| Open Graph image (`src/app/[locale]/opengraph-image.tsx`) | Link previews, per locale |

## Fonts and icons

- Public Sans (USWDS) and IBM Plex Mono, via `next/font/google`, SIL Open Font License.
- Icons: `lucide-react` (ISC).
