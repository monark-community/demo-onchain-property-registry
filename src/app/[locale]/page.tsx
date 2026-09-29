import { ArrowRightIcon, PlusIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { HeroPlan } from "@/components/home/hero-plan"
import { OnchainDiagram } from "@/components/home/onchain-diagram"
import { Button } from "@/components/ui/button"
import { href, isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/", null, d.meta.description)
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-3 text-primary">{children}</p>
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: raw } = await params
  const locale = raw as Locale
  const dict = getDictionary(locale)
  const h = dict.home

  return (
    <>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:pt-6">
            <Eyebrow>{h.hero.eyebrow}</Eyebrow>
            <h1 className="text-[2.25rem] leading-[1.05] font-bold sm:text-5xl lg:text-[3.25rem]">{h.hero.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{h.hero.sub}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.hero.primary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.hero.secondary}</Link>
              </Button>
            </div>
            <div className="mt-10 hidden border-t pt-5 lg:block">
              <p className="eyebrow text-muted-foreground">{h.hero.tryTitle}</p>
              <ol className="mt-3 grid gap-3">
                {h.hero.try.map((tip, i) => (
                  <li key={tip} className="grid grid-cols-[1.75rem_1fr] text-sm text-muted-foreground">
                    <span className="font-mono text-primary">0{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="lg:col-span-7">
            <HeroPlan />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>{h.problem.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl">{h.problem.title}</h2>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{h.problem.body}</p>
            <dl className="mt-8 grid grid-cols-3 border-t">
              {h.problem.facts.map((f, i) => (
                <div key={f.label} className={i > 0 ? "border-l pt-4 pl-4" : "pt-4 pr-4"}>
                  <dt className="font-mono text-4xl font-medium text-primary">{f.value}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{f.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-md border">
            <Image src={PHOTOS.frame.src} alt={h.problem.photoAlt} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <Eyebrow>{h.outcomes.eyebrow}</Eyebrow>
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">{h.outcomes.title}</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
            {h.outcomes.items.map((item, i) => (
              <li key={item.title} className={i > 0 ? "border-t pt-8 md:border-t-0 md:border-l md:pt-0 md:pl-8" : "md:pr-8"}>
                <span className="font-mono text-sm text-primary">0{i + 1}</span>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* One lot, three signatures */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-12 lg:items-center">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md border sm:aspect-[4/3] lg:col-span-5 lg:aspect-[4/5]">
            <Image src={PHOTOS.surveyor.src} alt={h.signatures.photoAlt} fill sizes="(min-width: 1024px) 500px, 100vw" className="object-cover object-[50%_35%]" />
          </div>
          <div className="lg:col-span-7">
            <Eyebrow>{h.signatures.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl">{h.signatures.title}</h2>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">{h.signatures.body}</p>
            <ol className="mt-8 grid gap-0">
              {h.signatures.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t py-5">
                  <span
                    aria-hidden="true"
                    className="seal-rest flex size-10 items-center justify-center rounded-full border-2 border-primary font-mono text-sm font-medium text-primary"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="eyebrow text-muted-foreground">{s.role}</p>
                    <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* What goes on-chain */}
      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>{h.onchain.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl">{h.onchain.title}</h2>
            <p className="mt-4 text-lg text-muted-foreground">{h.onchain.body}</p>
          </div>
          <div className="lg:col-span-8">
            <OnchainDiagram dict={dict} />
          </div>
        </div>
      </section>

      {/* Aerial band */}
      <section className="border-b">
        <div className="relative h-64 sm:h-80 lg:h-96">
          <Image src={PHOTOS.aerial.src} alt={h.aerial.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <p className="max-w-3xl text-2xl leading-snug font-semibold sm:text-3xl">{h.aerial.line}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>{h.faq.eyebrow}</Eyebrow>
            <h2 className="text-3xl font-bold sm:text-4xl">{h.faq.title}</h2>
          </div>
          <div className="lg:col-span-8">
            {h.faq.items.map((item) => (
              <details key={item.q} className="group border-t last:border-b">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <PlusIcon className="size-5 shrink-0 text-primary transition-transform group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="max-w-2xl pb-5 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <h2 className="text-3xl font-bold sm:text-4xl">{h.cta.title}</h2>
          <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-primary-foreground text-primary hover:bg-primary-foreground/90 hover:text-primary">
            <Link href={href(locale, "/app")}>
              {h.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
