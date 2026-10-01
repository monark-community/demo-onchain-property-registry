import type { Verdict } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

/** The inspector's seal: an ink ring with the verdict and the block it was anchored in. */
export function Seal({
  verdict,
  label,
  block,
  blockLabel,
  fresh,
  className,
}: {
  verdict: Verdict
  label: string
  block: string
  blockLabel: string
  fresh?: boolean
  className?: string
}) {
  const tone = verdict === "disputed" ? "text-destructive" : "text-primary"
  return (
    <div
      className={cn("@container relative size-[5.5rem] shrink-0 select-none", tone, fresh ? "seal-stamp" : "seal-rest", className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" fill="none">
        <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="3" strokeDasharray={verdict === "variance" ? "6 4" : undefined} />
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.2" />
        <path d="M24 53h52" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="absolute inset-x-2 top-[29%] text-center text-[11cqw] leading-none font-bold tracking-[0.06em] uppercase">{label}</span>
      <span className="absolute inset-x-3 top-[59%] text-center font-mono text-[7.5cqw] leading-none opacity-80">{blockLabel}</span>
      <span className="absolute inset-x-3 top-[69%] text-center font-mono text-[8.5cqw] leading-none tracking-[-0.02em]">{block}</span>
    </div>
  )
}
