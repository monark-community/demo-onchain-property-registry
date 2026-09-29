"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LocaleSwitch } from "@/components/site/locale-switch"
import { Logo } from "@/components/site/logo"
import { NavLinks, type NavItem } from "@/components/site/nav-links"
import { ThemeToggle } from "@/components/site/theme"
import type { Locale } from "@/i18n/config"

export function MobileMenu(props: {
  locale: Locale
  items: NavItem[]
  action: NavItem
  labels: { open: string; menu: string; close: string; language: string; theme: string; demo: string; names: Record<Locale, string> }
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [lastPath, setLastPath] = useState(pathname)
  // Close the sheet after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    if (open) setOpen(false)
  }
  const { labels } = props
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.open} className="md:hidden">
          <MenuIcon className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-sm gap-0 p-0" closeLabel={labels.close}>
        <SheetHeader className="h-15 flex-row items-center border-b px-4 py-0">
          <SheetTitle>
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">{labels.menu}</SheetDescription>
        </SheetHeader>
        <nav aria-label={labels.menu} className="p-3">
          <NavLinks items={props.items} variant="vertical" />
        </nav>
        <div className="mt-auto flex flex-col gap-4 border-t p-4">
          <span className="eyebrow text-muted-foreground">{labels.demo}</span>
          <div className="flex items-center gap-3">
            <LocaleSwitch locale={props.locale} label={labels.language} names={labels.names} />
            <ThemeToggle label={labels.theme} />
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href={props.action.href}>{props.action.label}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
