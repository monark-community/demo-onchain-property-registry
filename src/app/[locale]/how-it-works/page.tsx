import { ArrowRightIcon, BoxIcon, DatabaseIcon, LandmarkIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { ZONES } from "@/lib/demo/world"
import { fmtMetres, fmtPct } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"
import { cn } from "@/lib/utils"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/how-it-works", d.how.eyebrow, d.how.sub)
}

const STEP_TONE = [
  "border-foreground/40",
  "border-dashed border-warning bg-warning-surface",
  "border-primary bg-ok-surface",
  "border-dashed border-primary bg-ok-surface",
  "border-destructive bg-danger-surface",
]

export default async function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale: raw } = await params
  const locale = raw as Locale
  const dict = getDictionary(locale)
  const h = dict.how
  const steps = h.lifecycle.steps
  const StoreIcons = [BoxIcon, DatabaseIcon, LandmarkIcon]

  return (
    <>
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="eyebrow text-primary">{h.eyebrow}</p>
            <h1 className="mt-3 text-4xl leading-tight font-bold sm:text-5xl">{h.title}</h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{h.sub}</p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-md border lg:col-span-5 lg:aspect-[4/5]">
            <Image src={PHOTOS.surveyor.src} alt={h.photoAlt} fill priority sizes="(min-width: 1024px) 480px, 100vw" className="object-cover object-[50%_30%]" />
          </div>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-3xl font-bold">{h.lifecycle.title}</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">{h.lifecycle.body}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1.2fr] md:items-center">
            {[0, 1].map((i) => (
              <div key={i} className="contents">
                <div className={cn("rounded-md border-2 p-4", STEP_TONE[i])}>
                  <p className="font-mono text-xs text-muted-foreground">0{i + 1}</p>
                  <p className="mt-1 font-semibold">{steps[i]!.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{steps[i]!.body}</p>
                </div>
                <ArrowRightIcon className="mx-auto size-5 rotate-90 text-muted-foreground md:rotate-0" aria-hidden="true" />
              </div>
            ))}
            <div className="grid gap-3">
              {[2, 3, 4].map((i) => (
                <div key={i} className={cn("rounded-md border-2 p-3", STEP_TONE[i])}>
                  <p className="font-semibold">{steps[i]!.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{steps[i]!.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-3xl font-bold">{h.roles.title}</h2>
          <div className="mt-6 overflow-x-auto rounded-md border bg-card">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b bg-muted">
                <tr>
                  {h.roles.headers.map((x) => (
                    <th key={x} scope="col" className="px-4 py-3 font-semibold">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {h.roles.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) =>
                      i === 0 ? (
                        <th key={i} scope="row" className="px-4 py-3 font-medium">
                          {cell}
                        </th>
                      ) : (
                        <td key={i} className={cn("px-4 py-3", cell === h.roles.no ? "text-muted-foreground" : "")}>
                          {cell}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Zoning */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-3xl font-bold">{h.zoning.title}</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">{h.zoning.body}</p>
          <div className="mt-6 overflow-x-auto rounded-md border bg-background">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b bg-muted">
                <tr>
                  {h.zoning.headers.map((x) => (
                    <th key={x} scope="col" className="px-4 py-3 font-semibold">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y font-mono text-xs">
                {Object.values(ZONES).map((z) => (
                  <tr key={z.code}>
                    <th scope="row" className="px-4 py-3 font-medium">
                      {z.code}
                    </th>
                    <td className="px-4 py-3 font-sans text-sm">{dict.zone[z.code]}</td>
                    <td className="px-4 py-3">{fmtPct(z.maxCoverage, locale, 0)}</td>
                    <td className="px-4 py-3">{fmtMetres(z.maxHeight, locale, 0)}</td>
                    <td className="px-4 py-3">{z.maxUnits}</td>
                    <td className="px-4 py-3">
                      {fmtMetres(z.setbacks.front, locale)} / {fmtMetres(z.setbacks.side, locale)} / {fmtMetres(z.setbacks.rear, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Storage */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-3xl font-bold">{h.storage.title}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {h.storage.items.map((item, i) => {
              const Icon = StoreIcons[i]!
              return (
                <div key={item.title} className={cn("rounded-md border bg-card p-5", i === 0 && "border-2 border-primary")}>
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Limits + CTA */}
      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-bold">{h.limits.title}</h2>
            <ul className="mt-5 grid gap-3">
              {h.limits.items.map((x) => (
                <li key={x} className="border-l-2 border-border pl-4 text-muted-foreground">
                  {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-end lg:col-span-5 lg:justify-end">
            <Button asChild size="lg">
              <Link href={href(locale, "/app/lots/2418305")}>
                {h.cta}
                <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
