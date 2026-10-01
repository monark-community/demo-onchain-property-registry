"use client"

import { CheckIcon, FileUpIcon, Loader2Icon, PaperclipIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { pinToIpfs } from "@/lib/demo/chain"
import type { Evidence } from "@/lib/demo/types"
import { fmtBytes, short } from "@/lib/format"

/** Pick a file (only its name and size are used) or a sample, then "pin" it to IPFS. */
export function EvidencePicker({
  value,
  onChange,
  sampleName,
  kind,
  chooseLabel,
  sampleLabel,
}: {
  sampleLabel?: string
  value: Evidence[]
  onChange: (next: Evidence[]) => void
  sampleName: string
  kind: Evidence["kind"]
  chooseLabel?: string
}) {
  const { dict, locale } = useI18n()
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<{ name: string; pct: number } | null>(null)

  async function pin(name: string, bytes: number) {
    setUploading({ name, pct: 0 })
    const cid = await pinToIpfs({ name, bytes }, (pct) => setUploading({ name, pct }))
    setUploading(null)
    onChange([...value, { name, bytes, cid, kind: /\.(jpe?g|png|heic|webp)$/i.test(name) ? "photo" : kind }])
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <input
          ref={input}
          type="file"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void pin(f.name, f.size)
            e.target.value = ""
          }}
        />
        <Button type="button" variant="outline" disabled={!!uploading} onClick={() => input.current?.click()}>
          <FileUpIcon aria-hidden="true" />
          {chooseLabel ?? dict.declare.evidence.choose}
        </Button>
        <Button type="button" variant="ghost" disabled={!!uploading} onClick={() => void pin(sampleName, 842_117)}>
          <PaperclipIcon aria-hidden="true" />
          {sampleLabel ?? dict.declare.evidence.sample}
        </Button>
      </div>
      <ul className="grid gap-2" aria-live="polite">
        {value.map((ev) => (
          <li key={ev.cid} className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm">
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate font-medium">{ev.name}</span>
              <span className="flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-primary">
                  <CheckIcon className="size-3" aria-hidden="true" />
                  {dict.declare.evidence.pinned}
                </span>
                {fmtBytes(ev.bytes, locale)} · {short(ev.cid, 12, 6)}
              </span>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`${dict.declare.evidence.remove} ${ev.name}`}
              onClick={() => onChange(value.filter((x) => x.cid !== ev.cid))}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </li>
        ))}
        {uploading ? (
          <li className="rounded-md border border-dashed px-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{uploading.name}</span>
            </span>
            <span className="mt-1 block font-mono text-xs text-muted-foreground">{t(dict.declare.evidence.uploading, { pct: uploading.pct })}</span>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-muted">
              <span className="block h-full bg-primary transition-[width]" style={{ width: `${uploading.pct}%` }} />
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  )
}
