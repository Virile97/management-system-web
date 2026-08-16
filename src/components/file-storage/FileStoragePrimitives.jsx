import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getFileTypeBadge, formatBytes } from "./file-storage.constants"

function gridCardClassName({ className }) {
  return className
}

function GridSelectedOverlay({ selected }) {
  if (!selected) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 bg-blue-500/18 transition-colors duration-150"
      aria-hidden
    />
  )
}

function FileTypeBadge({ fileType, originalName, className, size = "card" }) {
  const { label, className: colorClassName } = getFileTypeBadge({
    fileType,
    originalName,
  })
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-bold tracking-wide",
        size === "card"
          ? "h-11 w-12 text-[11px]"
          : "h-8 min-w-[2.25rem] px-2 text-[10px] rounded-lg",
        colorClassName,
        className
      )}
    >
      {label}
    </span>
  )
}

function TagPill({ tag }) {
  return (
    <span className="inline-flex h-6 items-center rounded-md bg-[#EFEEEA] px-2 text-[11px] text-[#6B6960]">
      {tag}
    </span>
  )
}

function StorageProgressBar({
  usedBytes = 0,
  usedGB = 0,
  quotaGB = 5,
  usedPercent = 0,
  remainingGB,
}) {
  const remaining =
    remainingGB != null ? remainingGB : Math.max(0, quotaGB - usedGB)

  // A handful of small files can round to "0.0 GB" against a multi-GB
  // quota, which looks like the widget isn't updating. Show the used
  // amount in whatever unit actually reflects it (KB/MB/GB) instead of
  // always forcing GB.
  const usedLabel = usedBytes > 0 ? formatBytes(usedBytes) : "0 MB"

  return (
    <div className="flex flex-col gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#ECEBE7]">
        <div
          className="h-full rounded-full bg-[#1e2a4a]"
          style={{ width: `${Math.min(100, Math.max(0, usedPercent))}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {usedLabel} of {quotaGB.toFixed(1)} GB used
      </p>
      <p className="text-xs text-muted-foreground/80">
        {remaining.toFixed(1)} GB remaining
      </p>
    </div>
  )
}

export {
  FileTypeBadge,
  TagPill,
  StorageProgressBar,
  gridCardClassName,
  GridSelectedOverlay,
}
