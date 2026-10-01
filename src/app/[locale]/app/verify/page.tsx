import type { Metadata } from "next"
import { Suspense } from "react"

import { VerifyView } from "@/components/registry/verify-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/verify">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/verify", d.verify.title, d.verify.sub)
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-96 w-full max-w-4xl animate-pulse px-4 py-8 sm:px-6" />}>
      <VerifyView />
    </Suspense>
  )
}
