import type { LotSnapshot } from "@/lib/demo/registry"
import type { LotStatus, Rect, Structure } from "@/lib/demo/types"
import { PARK, PLAN, STREETS, ZONES, formatLotNumber, lotAddress } from "@/lib/demo/world"
import { cn } from "@/lib/utils"

/**
 * The drawn plan of Quartier du Moulin. SVG units are metres; strokes don't
 * scale, and every label is an HTML overlay so it stays legible at phone width.
 * Pure (no hooks), so it renders on the server and inside client components.
 */

export interface PlanLabels {
  park: string
  lotAria: (snap: LotSnapshot) => string
  north: string
  scale: string
}

export interface PlanProps {
  snapshots: LotSnapshot[]
  labels: PlanLabels
  idPrefix: string
  selectedId?: string | null
  onSelect?: (id: string) => void
  /** Zoom on a region (e.g. one lot) instead of the whole plan. */
  focus?: Rect
  /** Draw this lot's buildable envelope. */
  envelopeFor?: string
  /** Proposed structures, drawn dashed in the primary colour. */
  draft?: Structure[]
  /** Structure ids whose declaration is still pending (drawn dashed ochre). */
  pendingStructureIds?: Set<string>
  /** Structure ids to highlight (e.g. the one an entry changes). */
  highlightIds?: Set<string>
  showCivics?: boolean
  showStreetNames?: boolean
  dimLots?: Set<string>
  className?: string
}

const STATUS_FILL: Record<LotStatus, string> = {
  compliant: "var(--card)",
  variance: "var(--ok-surface)",
  review: "var(--warning-surface)",
  violation: "var(--danger-surface)",
}

function envelope(snap: LotSnapshot): Rect {
  const { lot } = snap
  const z = ZONES[snap.zone].setbacks
  const r = lot.rect
  const [n, s, w, e] =
    lot.frontage === "north"
      ? [z.front, z.rear, z.side, z.side]
      : lot.frontage === "south"
        ? [z.rear, z.front, z.side, z.side]
        : lot.frontage === "west"
          ? [z.side, z.side, z.front, z.rear]
          : [z.side, z.side, z.rear, z.front]
  return { x: r.x + w, y: r.y + n, w: Math.max(0, r.w - w - e), h: Math.max(0, r.h - n - s) }
}

export function Plan({
  snapshots,
  labels,
  idPrefix,
  selectedId,
  onSelect,
  focus,
  envelopeFor,
  draft = [],
  pendingStructureIds,
  highlightIds,
  showCivics = true,
  showStreetNames = true,
  dimLots,
  className,
}: PlanProps) {
  const vb = focus ?? { x: 0, y: 0, w: PLAN.width, h: PLAN.height }
  const pct = (x: number, y: number) => ({ left: `${((x - vb.x) / vb.w) * 100}%`, top: `${((y - vb.y) / vb.h) * 100}%` })
  const hatch = `${idPrefix}-hatch`
  const envSnap = envelopeFor ? snapshots.find((s) => s.lot.id === envelopeFor) : undefined
  const interactive = Boolean(onSelect)
  const inView = (r: Rect) => r.x < vb.x + vb.w && r.x + r.w > vb.x && r.y < vb.y + vb.h && r.y + r.h > vb.y

  return (
    <div className={cn("relative w-full overflow-hidden rounded-md border bg-[var(--plan-ground)]", className)}>
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="block h-auto w-full" role="presentation">
        <defs>
          <pattern id={hatch} width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="2.4" height="2.4" fill="var(--danger-surface)" />
            <line x1="0" y1="0" x2="0" y2="2.4" stroke="var(--destructive)" strokeWidth="0.7" />
          </pattern>
        </defs>

        {/* Streets and park */}
        {Object.values(STREETS).map((s) => (
          <rect key={s.name} x={s.rect.x} y={s.rect.y} width={s.rect.w} height={s.rect.h} fill="var(--plan-road)" />
        ))}
        <rect x={PARK.rect.x} y={PARK.rect.y} width={PARK.rect.w} height={PARK.rect.h} fill="var(--plan-park)" />
        {[
          [18, 140, 3.2],
          [34, 152, 4],
          [62, 138, 3],
          [88, 158, 3.6],
          [112, 142, 4.2],
          [134, 156, 3],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="none" stroke="var(--primary)" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {/* Centre lines */}
        <line x1="0" y1="86" x2="150" y2="86" stroke="var(--border)" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="162" y1="86" x2="240" y2="86" stroke="var(--border)" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="156" y1="0" x2="156" y2="170" stroke="var(--border)" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" />

        {/* Lots */}
        {snapshots.map((snap) => {
          const { lot, status } = snap
          if (!inView(lot.rect)) return null
          const selected = selectedId === lot.id
          const dim = dimLots?.has(lot.id)
          const fill = status === "violation" ? `url(#${hatch})` : STATUS_FILL[status]
          const common = {
            x: lot.rect.x,
            y: lot.rect.y,
            width: lot.rect.w,
            height: lot.rect.h,
          }
          return (
            <g
              key={lot.id}
              data-lot={lot.id}
              opacity={dim ? 0.35 : 1}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-pressed={interactive ? selected : undefined}
              aria-label={interactive ? labels.lotAria(snap) : undefined}
              onClick={interactive ? () => onSelect!(lot.id) : undefined}
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onSelect!(lot.id)
                      }
                    }
                  : undefined
              }
              className={cn(interactive && "cursor-pointer outline-none [&:focus-visible>.focus-ring]:opacity-100 [&:hover>.lot-edge]:stroke-foreground")}
            >
              <rect {...common} fill={fill} />
              <rect
                {...common}
                className="lot-edge"
                fill="none"
                stroke={status === "review" ? "var(--warning)" : "var(--foreground)"}
                strokeOpacity={status === "review" ? 0.9 : 0.45}
                strokeDasharray={status === "review" ? "5 3" : undefined}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {snap.structures.map((s) => {
                const pending = pendingStructureIds?.has(s.id)
                const hi = highlightIds?.has(s.id)
                return (
                  <rect
                    key={s.id}
                    x={s.rect.x}
                    y={s.rect.y}
                    width={s.rect.w}
                    height={s.rect.h}
                    fill={pending ? "var(--warning-surface)" : "var(--plan-building)"}
                    stroke={hi ? "var(--primary)" : pending ? "var(--warning)" : "var(--foreground)"}
                    strokeOpacity={hi || pending ? 1 : 0.7}
                    strokeWidth={hi ? 2 : 1}
                    strokeDasharray={pending ? "4 3" : undefined}
                    vectorEffect="non-scaling-stroke"
                  />
                )
              })}
              <rect
                {...common}
                className="focus-ring opacity-0"
                fill="none"
                stroke="var(--ring)"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              {selected ? (
                <rect
                  key={`sel-${lot.id}`}
                  {...common}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  pathLength={1}
                  className="draw-in"
                  style={{ ["--len" as string]: 1 }}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </g>
          )
        })}

        {/* Envelope and draft */}
        {envSnap ? (
          <rect
            {...(() => {
              const e = envelope(envSnap)
              return { x: e.x, y: e.y, width: e.w, height: e.h }
            })()}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.7"
            strokeDasharray="2 3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {draft.map((s) => (
          <rect
            key={`draft-${s.id}`}
            x={s.rect.x}
            y={s.rect.y}
            width={s.rect.w}
            height={s.rect.h}
            fill="var(--primary)"
            fillOpacity="0.18"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeDasharray="5 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Overlay labels (fixed pixel size) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 font-mono text-[10px] leading-none text-muted-foreground sm:text-[11px]">
        {showStreetNames
          ? Object.values(STREETS).map((s) => {
              const p = pct(s.label.x, s.label.y)
              if (!inView({ x: s.label.x - 1, y: s.label.y - 1, w: 2, h: 2 })) return null
              return (
                <span
                  key={s.name}
                  className={cn("absolute -translate-x-1/2 -translate-y-1/2 tracking-[0.08em] whitespace-nowrap uppercase", s.label.vertical && "-rotate-90")}
                  style={p}
                >
                  {s.name}
                </span>
              )
            })
          : null}
        {showStreetNames && inView(PARK.rect) ? (
          <span className="absolute -translate-x-1/2 -translate-y-1/2 tracking-[0.08em] uppercase" style={pct(75, 148)}>
            {labels.park}
          </span>
        ) : null}
        {showCivics
          ? snapshots.map((snap) => {
              const r = snap.lot.rect
              if (!inView(r)) return null
              const y = snap.lot.frontage === "north" ? r.y + 3.5 : snap.lot.frontage === "south" ? r.y + r.h - 3.5 : r.y + r.h / 2
              const x = snap.lot.frontage === "west" ? r.x + 3.5 : r.x + r.w / 2
              return (
                <span
                  key={snap.lot.id}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 rounded-[2px] px-0.5 font-medium",
                    selectedId === snap.lot.id ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}
                  style={pct(x, y)}
                >
                  {snap.lot.civic}
                </span>
              )
            })
          : null}
        {!focus ? (
          <>
            <span className="absolute top-2 right-2 flex flex-col items-center gap-0.5 text-foreground">
              <svg viewBox="0 0 10 12" className="h-3 w-2.5">
                <path d="M5 0 10 12 5 9 0 12Z" fill="currentColor" />
              </svg>
              {labels.north}
            </span>
            <span
              className="absolute right-2 bottom-5 block h-1.5 border-x border-b border-foreground"
              style={{ width: `${(20 / vb.w) * 100}%` }}
            />
            <span className="absolute right-2 bottom-1.5 text-foreground">{labels.scale}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function lotAriaLabel(template: string, snap: LotSnapshot, statusLabel: string) {
  return template
    .replace("{address}", lotAddress(snap.lot))
    .replace("{number}", formatLotNumber(snap.lot.id))
    .replace("{status}", statusLabel)
}
