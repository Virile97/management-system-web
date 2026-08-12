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
}) {
  function handleClick(period) {
    if (period === "Custom") {
      onCustomClick?.()
    }
    onChange?.(period)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1 overflow-x-auto">
        {periods.map((period) => (
          <button
            key={period}
            type="button"
            onClick={() => handleClick(period)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors",
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
            onClick={onClear}
            aria-label="Clear filter"
            className="ml-1.5 inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear filter
          </button>
        )}
      </div>

      {recordCount != null && (
        <p className="text-sm text-muted-foreground">
          {recordCount} records in period
        </p>
      )}
    </div>
  )
}

export { PeriodTabs }
export default PeriodTabs
