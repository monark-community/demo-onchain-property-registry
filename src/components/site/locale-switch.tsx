"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { locales, switchLocalePath, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

/** Compact EN/FR switch that keeps the current page. */
export function LocaleSwitch({ locale, label, names }: { locale: Locale; label: string; names: Record<Locale, string> }) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <nav aria-label={label} className="inline-flex h-9 items-center rounded-md border border-border p-0.5 font-mono text-xs">
      {locales.map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, l)}
          hrefLang={l}
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          title={names[l]}
          className={cn(
            "inline-flex h-full min-w-9 items-center justify-center rounded-[3px] px-2 uppercase transition-colors",
            l === locale ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span aria-hidden="true">{l}</span>
          <span className="sr-only">{names[l]}</span>
        </Link>
      ))}
    </nav>
  )
}
