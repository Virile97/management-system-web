import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, X } from "lucide-react"

/**
 * Trigger button for opening a DateRangeFilterModal. Shows a placeholder
 * until a range is active, at which point a clear (X) affordance appears
 * inside the button itself — not as a separate control next to it.
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
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onOpen}
      className={cn(
        "h-9 shrink-0 gap-1.5 rounded-lg bg-white px-3 text-sm hover:bg-white",
        hasRange && "border-[#1e2a4a] text-[#1e2a4a]",
        className
      )}
    >
      <Calendar className="h-3.5 w-3.5" />
      {hasRange ? label : "Date Range"}
      {hasRange && clearable && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Clear date range"
          onClick={(event) => {
            event.stopPropagation()
            onClear()
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              event.stopPropagation()
              onClear()
            }
          }}
          className="-mr-1 ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-muted-foreground/20"
        >
          <X className="h-3 w-3" />
        </span>
      )}
    </Button>
  )
}

export { DateRangeButton }
export default DateRangeButton
