"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { dict } = useI18n()
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-5 px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-bold">{dict.error.title}</h1>
      <p className="text-lg text-muted-foreground">{dict.error.body}</p>
      <Button onClick={reset}>{dict.error.retry}</Button>
    </section>
  )
}
