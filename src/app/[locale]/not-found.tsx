"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { href } from "@/i18n/config"

export default function NotFound() {
  const { dict, locale } = useI18n()
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-6 px-4 py-20 sm:px-6">
      <svg viewBox="0 0 120 80" className="h-20 w-auto text-muted-foreground" aria-hidden="true" fill="none">
        <rect x="1" y="1" width="118" height="78" stroke="currentColor" strokeDasharray="4 4" />
        <rect x="40" y="22" width="40" height="36" stroke="var(--destructive)" strokeWidth="2" strokeDasharray="6 4" />
        <path d="M40 22 80 58M80 22 40 58" stroke="var(--destructive)" strokeWidth="1.5" />
      </svg>
      <p className="eyebrow text-muted-foreground">404</p>
      <h1 className="text-4xl font-bold">{dict.notFound.title}</h1>
      <p className="text-lg text-muted-foreground">{dict.notFound.body}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={href(locale, "/app")}>{dict.notFound.registry}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={href(locale)}>{dict.notFound.home}</Link>
        </Button>
      </div>
    </section>
  )
}
