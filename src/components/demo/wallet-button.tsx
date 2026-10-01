"use client"

import { RepeatIcon } from "lucide-react"

import { useDemo } from "@/components/demo/demo-provider"
import { ConnectWallet } from "@/components/ui/connect-wallet"
import { DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/i18n/client"
import { useHydrated } from "@/lib/demo/store"

/** The registry's connect-wallet control, wired to the simulated identities. */
export function WalletButton({ className }: { className?: string }) {
  const { dict } = useI18n()
  const demo = useDemo()
  const hydrated = useHydrated()
  const id = hydrated ? demo.identity : null
  return (
    <ConnectWallet
      status={demo.connecting ? "connecting" : id ? "connected" : "disconnected"}
      address={id?.address}
      name={id ? `${id.name} · ${dict.role[id.role]}` : undefined}
      onConnect={demo.openConnect}
      onDisconnect={demo.disconnect}
      connectLabel={dict.wallet.connect}
      connectingLabel={dict.wallet.connecting}
      disconnectLabel={dict.wallet.disconnect}
      className={className}
      menu={
        <>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{dict.common.network}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={demo.openConnect}>
            <RepeatIcon className="mr-2 size-4" aria-hidden="true" />
            {dict.wallet.switch}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      }
    />
  )
}
