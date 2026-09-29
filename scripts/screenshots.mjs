// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start          (serves on port 3150)
//        pnpm screenshots                   (BASE_URL defaults to http://localhost:3150)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
// Optional: ONLY=<substring of the variant tag>, e.g. ONLY=en-390-light
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3150"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY
const KEY = "cadastrum-demo-v1"

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const T = {
  en: {
    connect: "Connect wallet",
    sign: "Sign",
    reject: "Reject",
    cont: "Continue",
    accessory: "Accessory building",
    width: "Width (m)",
    depth: "Depth (m)",
    sample: "Use the sample plan",
    signRecord: "Sign and record",
    confirmed: "Declared. Awaiting attestation.",
    waiting: "Waiting for the network…",
    year: "Year shown on the plan",
  },
  fr: {
    connect: "Connecter le portefeuille",
    sign: "Signer",
    reject: "Refuser",
    cont: "Continuer",
    accessory: "Bâtiment accessoire",
    width: "Largeur (m)",
    depth: "Profondeur (m)",
    sample: "Utiliser le plan d'exemple",
    signRecord: "Signer et inscrire",
    confirmed: "Déclaré. En attente d'attestation.",
    waiting: "En attente du réseau…",
    year: "Année affichée sur le plan",
  },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    hasTouch: w < 768,
    isMobile: w < 768,
    deviceScaleFactor: 1,
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! page error:", e.message))
  return { context, page }
}

async function shot(page, v, name, fullPage = false) {
  if (fullPage) {
    const y = await page.evaluate(() => window.scrollY)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(400)
    await page.evaluate((top) => window.scrollTo(0, top), y)
  }
  await page.waitForTimeout(350)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  if (overflow > 0) console.log(`  ! horizontal overflow ${overflow}px on ${name}`)
  await page.screenshot({ path: `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

async function freshDemo(page, v) {
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await page.evaluate((key) => localStorage.removeItem(key), KEY)
  await page.reload({ waitUntil: "networkidle" })
}

async function connectAs(page, v, name) {
  const t = T[v.locale]
  const connect = page.getByRole("button", { name: t.connect, exact: true }).first()
  if (await connect.isVisible().catch(() => false)) {
    await connect.click()
  } else {
    await page.locator("[data-slot=connect-wallet-trigger]").click()
    await page.getByRole("menuitem", { name: /Switch identity|Changer d'identité/ }).click()
  }
  const dialog = page.getByRole("dialog")
  await dialog.waitFor()
  await dialog.getByRole("button", { name: new RegExp(name) }).click()
  await page.locator("[data-slot=connect-wallet-trigger]").waitFor({ timeout: 5000 })
  await page.waitForTimeout(300)
}

async function signPrompt(page, v, answer) {
  const dialog = page.getByRole("dialog").filter({ has: page.getByRole("button", { name: T[v.locale].reject }) })
  await dialog.waitFor()
  await dialog.getByRole("button", { name: answer === "sign" ? T[v.locale].sign : T[v.locale].reject, exact: true }).click()
}

async function setYear(page, v, stepsBack) {
  const slider = page.getByRole("slider", { name: T[v.locale].year }).first()
  await slider.focus()
  await slider.press("End")
  for (let i = 0; i < stepsBack; i++) await slider.press("ArrowLeft")
  await page.waitForTimeout(300)
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(500)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Open menu" }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
    await page.keyboard.press("Escape")
  }
}

async function declareFlow(page, v, { failures = true } = {}) {
  const t = T[v.locale]
  await page.goto(`${BASE}/${v.locale}/app/declare?lot=2418303`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: new RegExp(t.accessory) }).click()
  await shot(page, v, "flow2-01-type", v.w >= 768)
  await page.getByRole("button", { name: t.cont }).click()
  await page.getByLabel(t.width).fill("6")
  await page.getByLabel(t.depth).fill("4")
  await page.waitForTimeout(300)
  await shot(page, v, "flow2-02-details-fits", true)
  await page.getByLabel(t.width).fill("12")
  await page.getByLabel(t.depth).fill("9")
  await page.waitForTimeout(300)
  await shot(page, v, "flow2-03-details-breach", true)
  await page.getByRole("button", { name: t.cont }).click()
  await page.getByRole("button", { name: t.sample }).click()
  await page.waitForTimeout(1800)
  await shot(page, v, "flow2-04-evidence")
  await page.getByRole("button", { name: t.cont }).click()
  await page.getByRole("button", { name: t.signRecord }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow2-05-sign-prompt")
  if (failures) {
    await signPrompt(page, v, "reject")
    await page.waitForTimeout(300)
    await shot(page, v, "flow2-06-rejected")
    // Force a network failure through the demo controls.
    await page.getByRole("button", { name: "Demo controls" }).click()
    await page.getByRole("switch", { name: "Make the next transaction fail" }).click()
    await shot(page, v, "app-demo-controls")
    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: t.signRecord }).click()
    await signPrompt(page, v, "sign")
    await page.getByText(t.waiting).first().waitFor()
    await page.waitForTimeout(400)
    await shot(page, v, "flow2-07-pending")
    await page.getByText(/didn't confirm/).first().waitFor({ timeout: 10000 })
    await shot(page, v, "flow2-08-failed")
    await page.getByRole("button", { name: "Try again" }).first().click()
  }
  await signPrompt(page, v, "sign")
  await page.getByText(t.confirmed).first().waitFor({ timeout: 12000 })
  await page.waitForTimeout(400)
  await shot(page, v, "flow2-09-confirmed", true)
}

async function appFlows(page, v) {
  await freshDemo(page, v)
  await shot(page, v, "app-01-explorer", true)

  // Flow 1: look up a lot
  await page.getByLabel("Search the registry").fill("36 rue des erables")
  await page.waitForTimeout(300)
  await page.getByRole("button", { name: /36 rue des Érables, lot 2\s418\s305/ }).click()
  await page.waitForTimeout(700)
  await shot(page, v, "flow1-01-search-select", v.w >= 768)
  await page.getByLabel("Search the registry").fill("99 rue imaginaire")
  await page.waitForTimeout(300)
  await page.getByText(/No lot matches/).scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-02-no-match")
  await page.goto(`${BASE}/${v.locale}/app/lots/2418305`, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  await shot(page, v, "flow1-03-lot-record", true)
  await setYear(page, v, 5)
  await page.getByRole("slider").first().scrollIntoViewIfNeeded()
  await shot(page, v, "flow1-04-lot-2022")

  // Flow 2: declare as the owner
  await connectAs(page, v, "Élise Martel")
  await page.goto(`${BASE}/${v.locale}/app/declare?lot=2418305`, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  await shot(page, v, "flow2-00-not-owner")
  await declareFlow(page, v)

  // Flow 3: inspector attests with a variance
  await page.getByRole("button", { name: /Switch to the inspector/ }).click()
  await page.waitForURL(/\/app\/review/)
  await page.getByRole("button", { name: /Garage in the back yard|Shed in the back yard/ }).first().click()
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-01-review", true)
  await page.getByLabel("Note for the record").fill("Checked on the plans: 1.5 m from both lines, coverage over by 1.8 points. Minor variance, resolution 2026-201.")
  await page.getByRole("button", { name: "Attest with a variance" }).click()
  await signPrompt(page, v, "sign")
  await page.getByText(/Sealed in block/).first().waitFor({ timeout: 12000 })
  await page.waitForTimeout(250)
  await shot(page, v, "flow3-02-sealed")
  await page.getByRole("link", { name: "Open the lot record" }).click()
  await page.waitForURL(/\/app\/lots\/2418303/)
  await page.getByText("Attested with variance").first().waitFor()
  await page.getByText("Attested with variance").last().scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-03-lot-after")

  // Flow 4: a resident reports an irregularity
  await connectAs(page, v, "Maya Chen")
  await page.goto(`${BASE}/${v.locale}/app/lots/2418306`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Report an irregularity" }).first().click()
  const dialog = page.getByRole("dialog")
  await dialog.getByText("More dwellings than the record shows").click()
  await dialog.getByLabel("Describe what you saw").fill("The workshop at the back has had a kitchen and tenants since spring. Two mailboxes at the front.")
  await shot(page, v, "flow4-01-report-form")
  await dialog.getByRole("button", { name: "Sign and file the report" }).click()
  await signPrompt(page, v, "sign")
  await page.getByText(/filed in block/).first().waitFor({ timeout: 12000 })
  await shot(page, v, "flow4-02-report-filed")
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).first().click()
  await page.waitForTimeout(400)
  await page.getByRole("button", { name: "Report an irregularity" }).first().click()
  await page.getByText("You already have an open report on this lot.").waitFor()
  await shot(page, v, "flow4-03-duplicate")
  await page.keyboard.press("Escape")
  await connectAs(page, v, "Karim Haddad")
  await page.goto(`${BASE}/${v.locale}/app/review`, { waitUntil: "networkidle" })
  await page.getByRole("tab", { name: /Reports/ }).click()
  await page.waitForTimeout(300)
  await shot(page, v, "flow4-04-report-in-queue", true)

  // Flow 5: verify an entry
  await page.goto(`${BASE}/${v.locale}/app/verify?q=CDM-2024-0092`, { waitUntil: "networkidle" })
  await page.waitForTimeout(400)
  await shot(page, v, "flow5-01-verified", true)
  await page.getByLabel("Entry ID or transaction hash").fill("hello")
  await page.getByRole("button", { name: "Verify", exact: true }).click()
  await shot(page, v, "flow5-02-malformed")
}

async function frenchFlow(page, v) {
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(500)
  await shot(page, v, "page-home", true)
  await freshDemo(page, v)
  await connectAs(page, v, "Élise Martel")
  await declareFlow(page, v, { failures: false })
  await page.goto(`${BASE}/fr/app/lots/2418305`, { waitUntil: "networkidle" })
  await page.waitForTimeout(600)
  await shot(page, v, "flow1-03-lot-record", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
