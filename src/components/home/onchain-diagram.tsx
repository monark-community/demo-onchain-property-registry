import { ArrowRightIcon, BoxIcon, FileTextIcon, ImageIcon, LockIcon } from "lucide-react"

import type { Dictionary } from "@/i18n"

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1 md:flex-col md:py-0">
      <span className="rounded-sm border border-dashed border-primary/60 bg-background px-2 py-1 font-mono text-[11px] whitespace-nowrap text-primary">
        {label}
      </span>
      <ArrowRightIcon className="size-4 rotate-90 text-primary md:rotate-0" aria-hidden="true" />
    </div>
  )
}

/** Entry → content hash → anchor; files → CID → anchor; personal details stay off both. */
export function OnchainDiagram({ dict }: { dict: Dictionary }) {
  const d = dict.home.onchain
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-6">
      <div className="grid gap-3">
        <div className="rounded-md border bg-card p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold">
            <FileTextIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {d.entry}
          </p>
          <ul className="grid gap-1 font-mono text-xs text-muted-foreground">
            {d.entryItems.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border bg-card p-4">
          <p className="flex items-center gap-2 font-semibold">
            <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {d.files}
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">IPFS · bafybei…</p>
        </div>
      </div>
      <div className="grid gap-3 md:gap-16">
        <Arrow label={d.hash} />
        <Arrow label={d.cid} />
      </div>
      <div className="grid gap-3">
        <div className="rounded-md border-2 border-primary bg-card p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold text-primary">
            <BoxIcon className="size-4" aria-hidden="true" />
            {d.chain}
          </p>
          <ul className="grid gap-1 font-mono text-xs text-muted-foreground">
            {d.chainItems.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-dashed bg-background p-4">
          <p className="mb-2 flex items-center gap-2 font-semibold">
            <LockIcon className="size-4 text-muted-foreground" aria-hidden="true" />
            {d.offchain}
          </p>
          <ul className="grid gap-1 font-mono text-xs text-muted-foreground">
            {d.offchainItems.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
