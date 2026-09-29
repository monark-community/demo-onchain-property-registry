"use client"

import { FlagIcon } from "lucide-react"
import { useState } from "react"

import { useDemo, useTransaction } from "@/components/demo/demo-provider"
import { Disclaimer } from "@/components/demo/disclaimer"
import { TxFeedback } from "@/components/demo/tx-feedback"
import { EvidencePicker } from "@/components/registry/evidence-picker"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/client"
import { t } from "@/i18n/t"
import { fileReport, hasOpenReport } from "@/lib/demo/ops"
import { getState, setState, useDemoState } from "@/lib/demo/store"
import type { Evidence, Hex, Lot, ReportCategory } from "@/lib/demo/types"
import { formatLotNumber, lotAddress } from "@/lib/demo/world"
import { cn } from "@/lib/utils"

const CATEGORIES: ReportCategory[] = ["undeclared", "units", "setback", "safety"]

export function ReportDialog({ lot, trigger }: { lot: Lot; trigger?: React.ReactNode }) {
  const { dict } = useI18n()
  const demo = useDemo()
  const state = useDemoState()
  const tx = useTransaction()
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<ReportCategory>("undeclared")
  const [description, setDescription] = useState("")
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string>()
  const [reportId, setReportId] = useState<string>()

  const me = demo.identity
  const duplicate = me ? hasOpenReport(state, lot.id, me.address) && tx.phase !== "confirmed" : false

  async function submit() {
    if (!me) return
    if (description.trim().length < 8) {
      setError(dict.report.tooShort)
      return
    }
    setError(null)
    await tx.run(
      {
        action: dict.wallet.actions.report,
        lines: [
          { label: dict.common.lot, value: `${lotAddress(lot)} · ${formatLotNumber(lot.id)}` },
          { label: dict.review.category, value: dict.report.categories[category] },
        ],
      },
      () => {
        const res = fileReport(getState(), { lotId: lot.id, category, description: description.trim(), reporter: me.address as Hex, evidence })
        setState(() => res.state)
        setTxHash(res.report.anchor.txHash)
        setReportId(res.report.id)
        return res.report.anchor.block
      }
    )
  }

  function onOpenChange(o: boolean) {
    if (tx.busy) return
    setOpen(o)
    if (!o) {
      tx.reset()
      setDescription("")
      setEvidence([])
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <FlagIcon aria-hidden="true" />
            {dict.lot.report}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent closeLabel={dict.common.close} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{dict.report.title}</DialogTitle>
          <DialogDescription>
            {lotAddress(lot)} · {dict.common.lot} {formatLotNumber(lot.id)}
          </DialogDescription>
        </DialogHeader>
        {!me ? (
          <div className="grid gap-3">
            <p className="text-sm text-muted-foreground">{dict.report.needWallet}</p>
            <Button onClick={demo.openConnect}>{dict.wallet.connect}</Button>
          </div>
        ) : tx.phase === "confirmed" ? (
          <div className="grid gap-3">
            <TxFeedback phase={tx.phase} stage={tx.stage} txHash={txHash} confirmed={t(dict.report.done, { id: reportId ?? "", block: tx.block ?? "" })} />
            <Button onClick={() => onOpenChange(false)}>{dict.common.close}</Button>
          </div>
        ) : duplicate ? (
          <p className="rounded-md border border-dashed border-warning bg-warning-surface p-3 text-sm text-warning">{dict.report.duplicate}</p>
        ) : (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <p className="text-sm text-muted-foreground">{dict.report.sub}</p>
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium">{dict.report.category}</legend>
              {CATEGORIES.map((c) => (
                <label
                  key={c}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
                    category === c ? "border-primary bg-ok-surface" : "bg-card hover:bg-accent"
                  )}
                >
                  <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="size-4 accent-[var(--primary)]" />
                  {dict.report.categories[c]}
                </label>
              ))}
            </fieldset>
            <div className="grid gap-1.5">
              <Label htmlFor="report-description">{dict.report.description}</Label>
              <Textarea
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                aria-describedby="report-description-hint"
                aria-invalid={error ? true : undefined}
              />
              <p id="report-description-hint" className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
                {error ?? dict.report.descriptionHint}
              </p>
            </div>
            <div className="grid gap-1.5">
              <span className="text-sm font-medium">
                {dict.report.photo} <span className="font-normal text-muted-foreground">({dict.common.optional})</span>
              </span>
              <EvidencePicker value={evidence} onChange={setEvidence} sampleName={`photo-${lot.civic}.jpg`} kind="photo" chooseLabel={dict.report.photo} sampleLabel={dict.report.samplePhoto} />
            </div>
            <TxFeedback phase={tx.phase} stage={tx.stage} onRetry={() => void submit()} />
            <Disclaimer />
            <Button type="submit" disabled={tx.busy}>
              {dict.report.submit}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
