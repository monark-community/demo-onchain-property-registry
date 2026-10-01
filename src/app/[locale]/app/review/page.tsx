import type { Metadata } from "next"

import { ReviewQueue } from "@/components/registry/review-queue"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/review">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/review", d.review.title, d.review.sub)
}

export default function ReviewPage() {
  return <ReviewQueue />
}
