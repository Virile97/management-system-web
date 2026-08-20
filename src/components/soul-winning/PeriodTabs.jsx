import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const DEFAULT_PERIODS = [
  "Today",
  "This Month",
  "This Year",
  "All Time",
  "Custom",
]

function PeriodTabs({
  active,
  onChange,
  recordCount,
  onCustomClick,
  onClear,
  clearable = false,
  periods = DEFAULT_PERIODS,
  disabled = false,
}) {
  function handleClick(period) {
    if (period === "Custom") {
      onCustomClick?.()
    }
    onChange?.(period)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="-mx-3 flex items-center gap-1 overflow-x-auto px-3 pb-0.5 scrollbar-none sm:mx-0 sm:px-0">
        {periods.map((period) => (
          <button
            key={period}
            type="button"
            disabled={disabled}
            onClick={() => handleClick(period)}
            className={cn(
              "h-9 shrink-0 rounded-lg px-3 text-sm transition-colors sm:h-auto sm:py-1.5 disabled:cursor-not-allowed disabled:opacity-50",
              active === period
                ? "bg-[#1e2a4a] font-medium text-white"
                : "font-normal text-muted-foreground hover:text-foreground"
            )}
          >
            {period}
          </button>
        ))}

        {clearable && (
          <button
            type="button"
            disabled={disabled}
            onClick={onClear}
            aria-label="Clear filter"
            className="ml-1.5 inline-flex h-9 shrink-0 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:py-1.5"
          >
            <X className="h-3 w-3" />
            Clear filter
          </button>
        )}
      </div>

      {recordCount != null && (
        <p className="text-xs text-muted-foreground sm:text-sm">
          {recordCount} records in period
        </p>
      )}
    </div>
  )
}

export { PeriodTabs }
export default PeriodTabs
