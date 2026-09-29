"use client"

import { WalletAvatar } from "@/components/ui/wallet"
import { useI18n } from "@/i18n/client"
import type { Hex, Role } from "@/lib/demo/types"
import { person } from "@/lib/demo/world"
import { short } from "@/lib/format"

const PUBLIC_ROLES = new Set<Role>(["inspector", "clerk", "registrar", "contractor"])

/** Who signed: officials by name, owners and residents by role and address only. */
export function Signer({ address, role, you }: { address: Hex; role: Role; you?: boolean }) {
  const { dict, locale } = useI18n()
  const p = person(address)
  const name = p && PUBLIC_ROLES.has(role) ? (p.name ?? p.org?.[locale]) : undefined
  const org = p?.name && p.org ? p.org[locale] : undefined
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <WalletAvatar address={address} size={18} />
      <span className="min-w-0 text-sm">
        <span className="font-medium">{name ?? dict.role[role]}</span>
        {name && role !== "registrar" ? <span className="text-muted-foreground"> · {dict.role[role]}</span> : null}
        {org ? <span className="text-muted-foreground"> · {org}</span> : null}
        <span className="ml-1 font-mono text-xs text-muted-foreground" title={address}>
          {short(address, 6, 4)}
        </span>
        {you ? <span className="ml-1 rounded-sm bg-accent px-1 text-xs">{dict.common.you}</span> : null}
      </span>
    </span>
  )
}
