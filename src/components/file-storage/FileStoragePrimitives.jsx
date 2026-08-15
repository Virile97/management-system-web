import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getFileTypeBadge } from "./file-storage.constants"

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

function StorageProgressBar({ usedGB = 0, quotaGB = 5, usedPercent = 0 }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#ECEBE7]">
        <div
          className="h-full rounded-full bg-[#1e2a4a]"
          style={{ width: `${Math.min(100, Math.max(0, usedPercent))}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {usedGB.toFixed(1)} GB of {quotaGB.toFixed(1)} GB used
      </p>
    </div>
  )
}

export { FileTypeBadge, TagPill, StorageProgressBar }
