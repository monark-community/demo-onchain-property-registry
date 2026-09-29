import { intlLocale, type Locale } from "@/i18n/config"
import type { Text } from "@/lib/demo/types"

/** Pick the right language from seed text; user-entered strings pass through. */
export function lt(text: Text, locale: Locale): string {
  return typeof text === "string" ? text : text[locale]
}

export function fmtDate(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "America/Toronto", ...opts }).format(new Date(iso))
}

export function fmtDateTime(iso: string, locale: Locale): string {
  return fmtDate(iso, locale, { dateStyle: "medium", timeStyle: "short" })
}

export function fmtNumber(n: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n)
}

export function fmtPct(ratio: number, locale: Locale, digits = 1): string {
  return new Intl.NumberFormat(intlLocale[locale], { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(ratio)
}

export const fmtMetres = (n: number, locale: Locale, digits = 1) => `${fmtNumber(n, locale, digits)} m`
export const fmtArea = (n: number, locale: Locale) => `${fmtNumber(n, locale)} m²`

export function fmtBytes(bytes: number, locale: Locale): string {
  if (bytes >= 1_000_000) return `${fmtNumber(bytes / 1_000_000, locale, 1)} MB`
  return `${fmtNumber(bytes / 1000, locale)} kB`
}

export const fmtBlock = (n: number, locale: Locale) => fmtNumber(n, locale)

export function short(hash: string, start = 8, end = 6): string {
  return hash.length <= start + end + 1 ? hash : `${hash.slice(0, start)}…${hash.slice(-end)}`
}

/** Join a list the way each language does ("a, b and c" / « a, b et c »). */
export function fmtList(items: string[], locale: Locale): string {
  return new Intl.ListFormat(intlLocale[locale], { style: "long", type: "conjunction" }).format(items)
}
