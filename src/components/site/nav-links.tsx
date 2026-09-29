"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

/** `match`: extra path prefixes that also make this item active (the item itself matches exactly). */
export type NavItem = { href: string; label: string; match?: string[] }

const within = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`)

export function isActive(pathname: string, item: NavItem, siblings: NavItem[] = []): boolean {
  if (item.match) return pathname === item.href || item.match.some((m) => within(pathname, m))
  if (!within(pathname, item.href)) return false
  // A more specific sibling wins (e.g. /app/review over /app).
  return !siblings.some((s) => s !== item && s.href.length > item.href.length && within(pathname, s.href))
}

export function NavLinks({
  items,
  className,
  variant = "header",
}: {
  items: NavItem[]
  className?: string
  variant?: "header" | "tabs" | "vertical"
}) {
  const pathname = usePathname() ?? ""
  return (
    <ul className={cn("flex", variant === "vertical" ? "flex-col gap-1" : "items-center gap-0.5", className)}>
      {items.map((item) => {
        const active = isActive(pathname, item, items)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium transition-colors",
                variant === "vertical" && "w-full py-2 text-base",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                active && variant === "header" && "after:absolute after:inset-x-3 after:-bottom-[12px] after:h-0.5 after:bg-primary",
                active && variant === "tabs" && "bg-accent font-semibold",
                active && variant === "vertical" && "bg-accent"
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** The header's primary action, hidden inside the registry app (the app bar has its own). */
export function HeaderAction({ href, label, appPrefix }: { href: string; label: string; appPrefix: string }) {
  const pathname = usePathname() ?? ""
  if (within(pathname, appPrefix)) return null
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
    >
      {label}
    </Link>
  )
}
