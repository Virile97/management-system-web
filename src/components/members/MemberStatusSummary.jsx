"use client"

import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_STYLES = {
  Active: {
    bar: "bg-emerald-500",
    soft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  Inactive: {
    bar: "bg-amber-500",
    soft: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  Deceased: {
    bar: "bg-slate-400",
    soft: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  },
}

function MemberStatusSummary({
  total = 0,
  breakdown = [],
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-22 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Total members
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {Number(total).toLocaleString()}
        </p>
      </div>

      {breakdown.map((item) => {
        const style = STATUS_STYLES[item.status] || STATUS_STYLES.Inactive
        const count = Number(item.count) || 0
        const pct =
          typeof item.percentage === "number"
            ? Math.round(item.percentage)
            : total > 0
              ? Math.round((count / total) * 100)
              : 0

        return (
          <div
            key={item.status}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {item.status}
              </p>
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
                  style.soft
                )}
              >
                {pct}%
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {count.toLocaleString()}
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", style.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { MemberStatusSummary }
export default MemberStatusSummary
