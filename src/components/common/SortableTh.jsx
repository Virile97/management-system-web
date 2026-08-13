import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

function SortableTh({
  label,
  sortKey,
  activeKey,
  direction = "asc",
  onSort,
  align = "left",
  className,
}) {
  const active = activeKey === sortKey
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown

  return (
    <th
      className={cn(
        "py-3 pr-4 text-xs font-medium tracking-wide text-muted-foreground uppercase",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSort?.(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          align === "right" && "flex-row-reverse",
          active ? "text-foreground/85" : "text-muted-foreground"
        )}
      >
        <span>{label}</span>
        <Icon
          className={cn("h-3.5 w-3.5 shrink-0", active ? "opacity-100" : "opacity-50")}
          aria-hidden
        />
        <span className="sr-only">
          {active
            ? `Sorted ${direction === "asc" ? "ascending" : "descending"}`
            : "Sort"}
        </span>
      </button>
    </th>
  )
}

export { SortableTh }
export default SortableTh
