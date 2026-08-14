import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, X } from "lucide-react"

/**
 * Trigger button for opening a DateRangeFilterModal.
 * Shared toolbar styles: h-10, card surface, rounded-lg — match search /
 * status / export controls across Members, Attendance, and Finances.
 *
 * `hasRange` controls active styling (navy border/text + clear). Display text
 * uses `label` when provided, otherwise the muted "Date Range" placeholder.
 */
function DateRangeButton({
  label,
  hasRange,
  onOpen,
  onClear,
  disabled = false,
  clearable = true,
  className,
}) {
  const displayLabel = label || "Date Range"

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onOpen}
      className={cn(
        "h-10 shrink-0 gap-1.5 rounded-lg bg-card px-4 text-sm hover:bg-card",
        hasRange
          ? "border-[#1e2a4a] text-[#1e2a4a] hover:text-[#1e2a4a] dark:border-amber-400/70 dark:text-amber-300 dark:hover:text-amber-300"
          : "text-muted-foreground hover:text-muted-foreground",
        className
      )}
    >
      <Calendar
        className={cn(
          "h-4 w-4 shrink-0",
          hasRange
            ? "text-[#1e2a4a] dark:text-amber-300"
            : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "truncate",
          hasRange
            ? "text-[#1e2a4a] dark:text-amber-300"
            : "text-muted-foreground"
        )}
      >
        {displayLabel}
      </span>
      {hasRange && clearable ? (
        <span
          role="button"
          tabIndex={0}
          aria-label="Clear date range"
          onClick={(event) => {
            event.stopPropagation()
            onClear?.()
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              event.stopPropagation()
              onClear?.()
            }
          }}
          className="-mr-1 ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[#1e2a4a] hover:bg-muted-foreground/20 dark:text-amber-300"
        >
          <X className="h-3 w-3" />
        </span>
      ) : null}
    </Button>
  )
}

export { DateRangeButton }
export default DateRangeButton
