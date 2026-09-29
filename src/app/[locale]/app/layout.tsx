import { DemoControls } from "@/components/demo/demo-controls"
import { DemoProvider } from "@/components/demo/demo-provider"
import { WalletButton } from "@/components/demo/wallet-button"
import { NavLinks } from "@/components/site/nav-links"
import { href, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export default async function AppLayout({ children, params }: LayoutProps<"/[locale]/app">) {
  const { locale: raw } = await params
  const locale = raw as Locale
  const dict = getDictionary(locale)
  const items = [
    { href: href(locale, "/app"), label: dict.nav.app.explore, match: [href(locale, "/app/lots")] },
    { href: href(locale, "/app/declare"), label: dict.nav.app.declare },
    { href: href(locale, "/app/review"), label: dict.nav.app.review },
    { href: href(locale, "/app/verify"), label: dict.nav.app.verify },
  ]
  return (
    <DemoProvider>
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:gap-4">
          <nav aria-label={dict.nav.app.label} className="-mx-2">
            <NavLinks items={items} variant="tabs" />
          </nav>
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <span className="eyebrow rounded-sm border border-dashed border-warning bg-warning-surface px-2 py-1 text-[10px] text-warning">
              {dict.common.demoBadge}
            </span>
            <DemoControls />
            <WalletButton className="ml-auto lg:ml-0" />
          </div>
        </div>
      </div>
      {children}
    </DemoProvider>
  )
}
