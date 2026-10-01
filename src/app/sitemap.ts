import type { MetadataRoute } from "next"

import { locales, SITE_URL } from "@/i18n/config"
import { LOT_IDS } from "@/lib/demo/world"

// /pricing is deliberately absent: it is an unlinked internal-review page.
const PATHS = ["", "/how-it-works", "/app", "/app/declare", "/app/review", "/app/verify", "/credits", ...LOT_IDS.map((id) => `/app/lots/${id}`)]

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("/app/lots") ? 0.5 : 0.7,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    }))
  )
}
