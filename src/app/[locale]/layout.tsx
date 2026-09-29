import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, Public_Sans } from "next/font/google"
import { notFound } from "next/navigation"

import "../globals.css"

import { SiteFooter } from "@/components/site/footer"
import { SiteHeader } from "@/components/site/header"
import { ThemeProvider } from "@/components/site/theme"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nProvider } from "@/i18n/client"
import { isLocale, locales, SITE_URL } from "@/i18n/config"
import { getDictionary } from "@/i18n"

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: d.title, template: d.titleTemplate },
    description: d.description,
    applicationName: "Cadastrum",
    alternates: { canonical: `/${locale}`, languages: { en: "/en", fr: "/fr", "x-default": "/en" } },
    openGraph: {
      type: "website",
      siteName: "Cadastrum",
      title: d.title,
      description: d.description,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      url: `/${locale}`,
    },
    twitter: { card: "summary_large_image", title: d.title, description: d.description },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#131713" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)

  return (
    <html lang={locale} className={`${publicSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <I18nProvider locale={locale} dict={dict}>
            <TooltipProvider delayDuration={200}>
              <a
                href="#main"
                className="sr-only z-50 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
              >
                {dict.common.skip}
              </a>
              <SiteHeader locale={locale} dict={dict} />
              <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
                {children}
              </main>
              <SiteFooter locale={locale} dict={dict} />
              <Toaster position="bottom-right" closeButton={false} offset={16} mobileOffset={{ bottom: 16, left: 16, right: 16 }} />
            </TooltipProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
