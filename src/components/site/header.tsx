import Link from "next/link"

import { LocaleSwitch } from "@/components/site/locale-switch"
import { Logo } from "@/components/site/logo"
import { MobileMenu } from "@/components/site/mobile-menu"
import { HeaderAction, NavLinks } from "@/components/site/nav-links"
import { ThemeToggle } from "@/components/site/theme"
import { href, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = [
    { href: href(locale, "/app"), label: dict.nav.registry },
    { href: href(locale, "/how-it-works"), label: dict.nav.howItWorks },
  ]
  const action = { href: href(locale, "/app"), label: dict.nav.openRegistry }
  const names = { en: dict.common.language.en, fr: dict.common.language.fr }
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-15 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href={href(locale)} aria-label="Cadastrum" className="rounded-sm">
          <Logo />
        </Link>
        <nav aria-label={dict.nav.primary} className="hidden md:block">
          <NavLinks items={items} />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <span
              title={dict.common.demoBadge}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-dashed border-warning bg-warning-surface px-2.5 text-xs font-semibold text-warning"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
              {dict.common.demoChip}
            </span>
            <LocaleSwitch locale={locale} label={dict.common.language.label} names={names} />
            <ThemeToggle label={dict.common.theme.toggle} />
            <HeaderAction href={action.href} label={action.label} appPrefix={href(locale, "/app")} />
          </div>
          <MobileMenu
            locale={locale}
            items={items}
            action={action}
            labels={{
              open: dict.common.openMenu,
              menu: dict.common.menu,
              close: dict.common.close,
              language: dict.common.language.label,
              theme: dict.common.theme.toggle,
              demo: dict.common.demoBadge,
              names,
            }}
          />
        </div>
      </div>
    </header>
  )
}
