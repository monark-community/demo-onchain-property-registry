import { CheckIcon } from "lucide-react"
import type { Metadata } from "next"

import { isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { cn } from "@/lib/utils"

/**
 * Internal strategy review only: never linked from anywhere, absent from the
 * sitemap, and marked noindex/nofollow.
 */
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return { title: d.pricing.title, description: d.pricing.sub, robots: { index: false, follow: false } }
}

export default async function PricingPage({ params }: PageProps<"/[locale]/pricing">) {
  const { locale: raw } = await params
  const locale = raw as Locale
  const p = getDictionary(locale).pricing
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <p className="eyebrow inline-block rounded-sm border border-dashed border-warning bg-warning-surface px-2 py-1 text-warning">{p.eyebrow}</p>
      <h1 className="mt-4 text-4xl font-bold">{p.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{p.sub}</p>

      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {p.tiers.map((tier, i) => (
          <li key={tier.name} className={cn("flex flex-col rounded-md border bg-card p-6", i === 2 && "border-2 border-primary")}>
            <h2 className="text-xl font-semibold">{tier.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{tier.for}</p>
            <p className="mt-5">
              <span className="font-mono text-4xl font-medium">{tier.price}</span>
              {tier.unit ? <span className="mt-1 block text-sm text-muted-foreground">{tier.unit}</span> : null}
            </p>
            <ul className="mt-6 grid gap-2 border-t pt-5 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-mono text-sm text-muted-foreground">{p.example}</p>

      <section className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold">{p.why.title}</h2>
        <ul className="mt-4 grid max-w-3xl gap-3">
          {p.why.items.map((x) => (
            <li key={x} className="border-l-2 border-primary pl-4 text-muted-foreground">
              {x}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
