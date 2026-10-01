import type { LocalText } from "@/lib/demo/types"

/** Every photograph on the site (all Unsplash License). Mirrored in docs/assets.md. */
export const PHOTOS = {
  aerial: {
    src: "/images/aerial-street-grid.jpg",
    width: 2400,
    height: 1350,
    photographer: "Tom Rumble",
    profile: "https://unsplash.com/@tomrumble",
    page: "https://unsplash.com/photos/top-view-photography-of-houses-at-daytime-7lvzopTxjOU",
    usedOn: { en: "Home, aerial band", fr: "Accueil, bandeau aérien" } as LocalText,
  },
  surveyor: {
    src: "/images/surveyor-street.jpg",
    width: 1600,
    height: 2400,
    photographer: "Agustín Pimentel",
    profile: "https://unsplash.com/@agustin_pimentel",
    page: "https://unsplash.com/photos/man-in-orange-vest-uses-surveying-equipment-outdoors-l2_XkKXObm0",
    usedOn: { en: "Home, “One lot, three signatures”; How it works", fr: "Accueil, « Un lot, trois signatures » ; Fonctionnement" } as LocalText,
  },
  frame: {
    src: "/images/frame-from-above.jpg",
    width: 2400,
    height: 1599,
    photographer: "Avel Chuklanov",
    profile: "https://unsplash.com/@chuklanov",
    page: "https://unsplash.com/photos/beige-wooden-house-layout-IB0VA6VdqBw",
    usedOn: { en: "Home, the problem", fr: "Accueil, le problème" } as LocalText,
  },
} as const
