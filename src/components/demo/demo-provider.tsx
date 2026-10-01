"use client"

import { PenLineIcon } from "lucide-react"
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"

import { Disclaimer } from "@/components/demo/disclaimer"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAvatar, WalletAddress } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import { sleep, simulateNetwork, type Stage } from "@/lib/demo/chain"
import { setState, useDemoState } from "@/lib/demo/store"
import type { Hex, Person } from "@/lib/demo/types"
import { DEMO_IDENTITIES, person } from "@/lib/demo/world"
import { cn } from "@/lib/utils"

export interface SignRequest {
  action: string
  lines: { label: string; value: string; mono?: boolean }[]
}

interface DemoContext {
  identity: Person | null
  connecting: boolean
  openConnect: () => void
  connectAs: (address: Hex) => Promise<void>
  disconnect: () => void
  requestSignature: (req: SignRequest) => Promise<boolean>
}

const Ctx = createContext<DemoContext | null>(null)

export function useDemo(): DemoContext {
  const c = useContext(Ctx)
  if (!c) throw new Error("useDemo must be used inside DemoProvider")
  return c
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { dict } = useI18n()
  const state = useDemoState()
  const identity = state.identity ? (person(state.identity) ?? null) : null
  const [connecting, setConnecting] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)
  const [request, setRequest] = useState<SignRequest | null>(null)
  const resolver = useRef<((ok: boolean) => void) | null>(null)

  const connectAs = useCallback(async (address: Hex) => {
    setChooserOpen(false)
    setConnecting(true)
    await sleep(650)
    setState((s) => ({ ...s, identity: address }))
    setConnecting(false)
  }, [])

  const requestSignature = useCallback((req: SignRequest) => {
    setRequest(req)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const answer = (ok: boolean) => {
    resolver.current?.(ok)
    resolver.current = null
    setRequest(null)
  }

  const value = useMemo<DemoContext>(
    () => ({
      identity,
      connecting,
      openConnect: () => setChooserOpen(true),
      connectAs,
      disconnect: () => setState((s) => ({ ...s, identity: null })),
      requestSignature,
    }),
    [identity, connecting, connectAs, requestSignature]
  )

  const names: Record<string, string> = {
    [DEMO_IDENTITIES[0]!]: dict.wallet.identities.elise,
    [DEMO_IDENTITIES[1]!]: dict.wallet.identities.karim,
    [DEMO_IDENTITIES[2]!]: dict.wallet.identities.maya,
  }

  return (
    <Ctx.Provider value={value}>
      {children}

      {/* Identity chooser (the simulated wallet's account picker) */}
      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent closeLabel={dict.common.close} className="gap-5">
          <DialogHeader>
            <DialogTitle>{dict.wallet.chooseTitle}</DialogTitle>
            <DialogDescription>{dict.wallet.chooseBody}</DialogDescription>
          </DialogHeader>
          <ul className="grid gap-2">
            {DEMO_IDENTITIES.map((addr) => {
              const p = person(addr)!
              const current = identity?.address === addr
              return (
                <li key={addr}>
                  <button
                    type="button"
                    onClick={() => connectAs(addr)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring",
                      current && "border-primary bg-ok-surface"
                    )}
                  >
                    <WalletAvatar address={addr} size={36} />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{p.name}</span>
                        <span className="eyebrow rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{dict.role[p.role]}</span>
                      </span>
                      <span className="text-sm text-muted-foreground">{names[addr]}</span>
                      <WalletAddress address={addr} className="text-xs text-muted-foreground" />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </DialogContent>
      </Dialog>

      {/* Signature prompt */}
      <Dialog open={request !== null} onOpenChange={(o) => (!o ? answer(false) : null)}>
        <DialogContent closeLabel={dict.common.close} showCloseButton={false} className="gap-4 sm:max-w-md">
          <DialogHeader>
            <p className="flex items-center gap-2">
              <NetworkBadge name={dict.common.network} variant="outline" className="rounded-sm font-mono" />
            </p>
            <DialogTitle className="flex items-center gap-2 pt-1">
              <PenLineIcon className="size-5 text-primary" aria-hidden="true" />
              {dict.wallet.prompt.title}
            </DialogTitle>
            <DialogDescription>{dict.wallet.prompt.from}</DialogDescription>
          </DialogHeader>
          {request ? (
            <div className="rounded-md border bg-background">
              <p className="border-b px-3 py-2 font-semibold">{request.action}</p>
              <dl className="grid gap-1.5 px-3 py-2.5 text-sm">
                {request.lines.map((l) => (
                  <div key={l.label} className="grid grid-cols-[7.5rem_1fr] gap-2">
                    <dt className="text-muted-foreground">{l.label}</dt>
                    <dd className={cn("min-w-0 break-words", l.mono && "font-mono text-xs leading-5 break-all")}>{l.value}</dd>
                  </div>
                ))}
                {identity ? (
                  <div className="grid grid-cols-[7.5rem_1fr] gap-2">
                    <dt className="text-muted-foreground">{dict.lot.by}</dt>
                    <dd>
                      {identity.name} · {dict.role[identity.role]}
                    </dd>
                  </div>
                ) : null}
                <div className="grid grid-cols-[7.5rem_1fr] gap-2">
                  <dt className="text-muted-foreground">{dict.wallet.prompt.fee}</dt>
                  <dd className="text-primary">{dict.wallet.prompt.feeValue}</dd>
                </div>
              </dl>
            </div>
          ) : null}
          <Disclaimer fee={false} />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => answer(false)}>
              {dict.wallet.prompt.reject}
            </Button>
            <Button onClick={() => answer(true)} autoFocus>
              {dict.wallet.prompt.sign}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  )
}

export type TxPhase = "idle" | "signing" | "pending" | "confirmed" | "failed" | "rejected"

/**
 * One signed action's lifecycle: prompt → network → commit. `commit` runs only
 * after the simulated network confirms, and returns the block for the UI.
 */
export function useTransaction() {
  const demo = useDemo()
  const [phase, setPhase] = useState<TxPhase>("idle")
  const [stage, setStage] = useState<Stage | null>(null)
  const [block, setBlock] = useState<number | null>(null)

  const run = useCallback(
    async (req: SignRequest, commit: () => number): Promise<boolean> => {
      setPhase("signing")
      setStage(null)
      const ok = await demo.requestSignature(req)
      if (!ok) {
        setPhase("rejected")
        return false
      }
      setPhase("pending")
      let fail = false
      let slow = false
      setState((s) => {
        fail = s.settings.failNext
        slow = s.settings.slowNetwork
        return fail ? { ...s, settings: { ...s.settings, failNext: false } } : s
      })
      try {
        await simulateNetwork({ fail, slow, onStage: setStage })
      } catch {
        setPhase("failed")
        return false
      }
      setBlock(commit())
      setPhase("confirmed")
      return true
    },
    [demo]
  )

  const reset = useCallback(() => {
    setPhase("idle")
    setStage(null)
    setBlock(null)
  }, [])

  return { phase, stage, block, run, reset, busy: phase === "signing" || phase === "pending" }
}
