import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LotRecord } from "@/components/registry/lot-record"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { LOT_IDS, formatLotNumber, getLot, lotAddress } from "@/lib/demo/world"
import { pageMetadata } from "@/lib/metadata"

export function generateStaticParams() {
  return locales.flatMap((locale) => LOT_IDS.map((id) => ({ locale, id })))
}

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<"/[locale]/app/lots/[id]">): Promise<Metadata> {
  const { locale, id } = await params
  const lot = getLot(id)
  if (!isLocale(locale) || !lot) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, `/app/lots/${id}`, lotAddress(lot), `${d.common.lot} ${formatLotNumber(id)} · ${d.lot.timelineSub}`)
}

export default async function LotPage({ params }: PageProps<"/[locale]/app/lots/[id]">) {
  const { id } = await params
  if (!getLot(id)) notFound()
  return <LotRecord lotId={id} />
}
