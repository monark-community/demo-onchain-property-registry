import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { LOTS } from "@/lib/demo/world"

export const alt = "Cadastrum"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const INK = "#1C211E"
const PAPER = "#F4F1E8"
const GREEN = "#1F5A46"
const BRICK = "#A3301D"
const OCHRE = "#E9C46A"

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const s = 2.1 // metres → px for the mini plan
  const lots = LOTS.map((l) => {
    const status = l.id === "2418305" || l.id === "2418333" ? "v" : l.id === "2418320" || l.id === "2418331" ? "r" : "c"
    return { ...l.rect, status, id: l.id }
  })

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: PAPER, color: INK, padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="1" stroke={GREEN} strokeWidth="2" />
              <path d="M2.75 12.5 12.5 2.75" stroke={GREEN} strokeWidth="2" />
              <circle cx="21.25" cy="21.25" r="2.75" fill={GREEN} />
            </svg>
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>Cadastrum</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{d.home.hero.title}</span>
            <span style={{ fontSize: 24, color: "#565B52", lineHeight: 1.35 }}>{d.footer.tagline}</span>
          </div>
          <span style={{ fontSize: 18, color: "#565B52", letterSpacing: 2, textTransform: "uppercase" }}>{d.common.demoBadge}</span>
        </div>
        <div
          style={{
            display: "flex",
            position: "relative",
            marginLeft: "auto",
            width: 240 * s,
            height: 170 * s,
            alignSelf: "center",
            background: "#E2DCCB",
            border: `2px solid ${INK}`,
          }}
        >
          {lots.map((l) => (
            <div
              key={l.id}
              style={{
                position: "absolute",
                left: l.x * s,
                top: l.y * s,
                width: l.w * s,
                height: l.h * s,
                background: l.status === "v" ? "#F4D9D1" : l.status === "r" ? "#F3E3B5" : "#FBF9F4",
                border: `1px solid ${l.status === "v" ? BRICK : l.status === "r" ? OCHRE : "#8A8F85"}`,
                display: "flex",
              }}
            />
          ))}
          <div style={{ position: "absolute", left: 0, top: 127 * s, width: 150 * s, height: 43 * s, background: "#DDE3CF", display: "flex" }} />
          <div style={{ position: "absolute", left: 100 * s, top: 45 * s, width: 25 * s, height: 35 * s, border: `4px solid ${GREEN}`, display: "flex" }} />
        </div>
      </div>
    ),
    size
  )
}
