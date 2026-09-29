import Link from "next/link"

import { Logo } from "@/components/site/logo"
import { MONARK_URL, PROJECT_DOC_URL, REPO_URL, href, type Locale } from "@/i18n/config"
import { t, type Dictionary } from "@/i18n"

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const links = [
    { href: href(locale, "/app"), label: dict.nav.registry },
    { href: href(locale, "/how-it-works"), label: dict.nav.howItWorks },
    { href: href(locale, "/app/verify"), label: dict.nav.verify },
    { href: href(locale, "/credits"), label: dict.nav.credits },
  ]
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{dict.footer.tagline}</p>
        </div>
        <nav aria-label={dict.footer.product}>
          <h2 className="eyebrow mb-3 text-muted-foreground">{dict.footer.product}</h2>
          <ul className="space-y-1.5 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-foreground underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="eyebrow mb-3 text-muted-foreground">Cadastrum</h2>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href={PROJECT_DOC_URL} className="text-foreground underline-offset-4 hover:underline">
                {dict.footer.docs}
              </a>
            </li>
            <li>
              <a href={REPO_URL} className="text-foreground underline-offset-4 hover:underline">
                {dict.footer.github}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-[0.8125rem] text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>
            {t(dict.footer.rights, { year: 2026 })} · {dict.footer.demo}
          </p>
          <a href={MONARK_URL} className="underline-offset-4 hover:text-foreground hover:underline">
            {dict.footer.builtWith}
          </a>
        </div>
      </div>
    </footer>
  )
}
