"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/i18n/client"
import { resetDemo, setState, useDemoState } from "@/lib/demo/store"

export function DemoControls() {
  const { dict } = useI18n()
  const state = useDemoState()
  const set = (patch: Partial<typeof state.settings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontalIcon aria-hidden="true" />
          {dict.demo.controls}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" closeLabel={dict.common.close} className="w-full max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>{dict.demo.title}</SheetTitle>
          <SheetDescription>{dict.demo.body}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 px-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="demo-fail">{dict.demo.failNext}</Label>
              <p className="mt-1 text-sm text-muted-foreground">{dict.demo.failNextHelp}</p>
            </div>
            <Switch id="demo-fail" checked={state.settings.failNext} onCheckedChange={(v) => set({ failNext: v })} />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="demo-slow">{dict.demo.slow}</Label>
              <p className="mt-1 text-sm text-muted-foreground">{dict.demo.slowHelp}</p>
            </div>
            <Switch id="demo-slow" checked={state.settings.slowNetwork} onCheckedChange={(v) => set({ slowNetwork: v })} />
          </div>
          <div className="border-t pt-5">
            <Button
              variant="outline"
              onClick={() => {
                resetDemo()
                toast.success(dict.demo.resetDone)
              }}
            >
              <RotateCcwIcon aria-hidden="true" />
              {dict.demo.reset}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">{dict.demo.resetHelp}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
