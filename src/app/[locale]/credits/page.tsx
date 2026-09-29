import type { Metadata } from "next"
import Image from "next/image"

import { isLocale, type Locale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { lt } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/credits", d.credits.title, d.credits.sub)
}

export default async function CreditsPage({ params }: PageProps<"/[locale]/credits">) {
  const { locale: raw } = await params
  const locale = raw as Locale
  const dict = getDictionary(locale)
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">{dict.credits.title}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{dict.credits.sub}</p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {Object.values(PHOTOS).map((p) => (
          <li key={p.src} className="grid content-start gap-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border">
              <Image src={p.src} alt="" fill sizes="(min-width: 640px) 320px, 100vw" className="object-cover" />
            </div>
            <p className="text-sm">
              <a href={p.page} className="font-medium text-primary underline-offset-4 hover:underline">
                {t(dict.credits.photo, { name: p.photographer })}
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              <a href={p.profile} className="underline-offset-4 hover:underline">
                {p.profile.replace("https://", "")}
              </a>
              {" · "}
              {dict.credits.usedOn} {lt(p.usedOn, locale)}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">{dict.credits.fonts}</p>
    </div>
  )
}
