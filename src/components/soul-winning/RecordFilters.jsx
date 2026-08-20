"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MemberPickerField } from "@/components/finances/MemberPickerField"
import { cn } from "@/lib/utils"
import { Search, Filter, X } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "New Convert", label: "New Convert" },
  { value: "Active Member", label: "Active Member" },
  { value: "Inactive", label: "Inactive" },
]

function RecordFilters({
  search,
  onSearchChange,
  onSearchSubmit,
  status = "all",
  onStatusChange,
  winner = null,
  onWinnerChange,
  resultCount,
  disabled = false,
}) {
  function handleClear() {
    onSearchChange("")
    onSearchSubmit?.("")
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center sm:gap-3">
        <form
          className="relative w-full sm:max-w-xs sm:flex-1"
          onSubmit={(event) => {
            event.preventDefault()
            onSearchSubmit?.()
          }}
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            className={cn(
              "h-10 rounded-lg bg-card pl-9",
              search && "pr-9"
            )}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            disabled={disabled}
          />
          {search ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              disabled={disabled}
              className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </form>

        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3">
          <Select value={status} onValueChange={onStatusChange} disabled={disabled}>
            <SelectTrigger className="w-full rounded-lg bg-card data-[size=default]:h-10 sm:w-44">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue>
                {() =>
                  STATUS_OPTIONS.find((option) => option.value === status)
                    ?.label || "All Statuses"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-full sm:w-56">
            <MemberPickerField
              member={winner}
              onChange={onWinnerChange}
              placeholder="Filter by soul winner..."
              className="bg-card hover:bg-card"
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground sm:shrink-0 sm:text-sm">
        {resultCount} results
      </p>
    </div>
  )
}

export { RecordFilters }
export default RecordFilters
