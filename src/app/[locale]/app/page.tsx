import type { Metadata } from "next"

import { Explorer } from "@/components/registry/explorer"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app", d.nav.registry, d.explorer.sub)
}

export default function ExplorerPage() {
  return <Explorer />
}
