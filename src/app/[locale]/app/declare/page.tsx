import type { Metadata } from "next"
import { Suspense } from "react"

import { DeclareFlow } from "@/components/registry/declare-flow"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/declare">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/declare", d.declare.eyebrow, d.declare.sub)
}

export default function DeclarePage() {
  return (
    <Suspense fallback={<div className="mx-auto h-96 w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6" />}>
      <DeclareFlow />
    </Suspense>
  )
}
