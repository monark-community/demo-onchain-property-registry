import { cn } from "@/lib/utils"

/**
 * Cadastrum mark: a lot boundary, a lot line cutting its corner, and a survey
 * monument (the filled dot) at the opposite corner.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} fill="none">
      {title ? <title>{title}</title> : null}
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M2.75 12.5 12.5 2.75" stroke="currentColor" strokeWidth="2" />
      <rect x="10" y="10" width="6.5" height="6.5" fill="currentColor" opacity="0.28" />
      <circle cx="21.25" cy="21.25" r="2.75" fill="currentColor" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <LogoMark className="size-6 text-primary" />
      <span className="text-[1.125rem] leading-none font-bold tracking-[-0.02em]">Cadastrum</span>
    </span>
  )
}
