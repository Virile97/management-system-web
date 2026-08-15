import { cn } from "@/lib/utils"
import {
  NBC_ENROLLMENT_STATUS,
  NBC_STATUS_LABELS,
} from "@/components/new-believers/nbc.constants"

const STATUS_STYLES = {
  [NBC_ENROLLMENT_STATUS.ON_TRACK]:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  [NBC_ENROLLMENT_STATUS.BEHIND]:
    "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  [NBC_ENROLLMENT_STATUS.ADVANCED]:
    "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
}

function NbcStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
        STATUS_STYLES[status] || STATUS_STYLES[NBC_ENROLLMENT_STATUS.ON_TRACK]
      )}
    >
      {NBC_STATUS_LABELS[status] || status}
    </span>
  )
}

function NbcProgressBar({ value = 0, className }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <div className="h-1.5 min-w-[4.5rem] flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-600 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {pct}%
      </span>
    </div>
  )
}

function NbcAvatar({ initials, className }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold text-foreground/70",
        className
      )}
    >
      {initials || "?"}
    </div>
  )
}

export { NbcStatusBadge, NbcProgressBar, NbcAvatar }
