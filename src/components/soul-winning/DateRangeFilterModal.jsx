"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react"

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// Calendar jump list: a couple of years ahead for planning, and far enough
// back to cover typical historical filters without an endless scroll.
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 22 }, (_, index) => CURRENT_YEAR + 1 - index)

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function isToday(year, month, day) {
  const now = new Date()
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
}

// Comparable ordinal for a { year, month, day } point, so start/end can be
// compared and range-membership tested even when they fall in different
// months (a plain day-of-month number can't do that on its own).
function toOrdinal(point) {
  return new Date(point.year, point.month, point.day).getTime()
}

function samePoint(a, b) {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

// range.start/range.end come in as either full { year, month, day } points
// or (for back-compat with older callers) a bare day number paired with
// range.year/range.month.
function normalizePoint(range, key) {
  const value = range?.[key]
  if (value == null) return null
  if (typeof value === "object") return value

  return { year: range.year, month: range.month, day: value }
}

function DateRangeFilterModal({ open, onOpenChange, range, hasSelection = true, onApply }) {
  const initialStart = normalizePoint(range, "start")
  const initialEnd = normalizePoint(range, "end")

  const [viewYear, setViewYear] = useState(initialStart?.year ?? range.year)
  const [viewMonth, setViewMonth] = useState(initialStart?.month ?? range.month)
  const [selection, setSelection] = useState(
    hasSelection ? { start: initialStart, end: initialEnd } : { start: null, end: null }
  )
  const [startTime, setStartTime] = useState(range.startTime ?? "12:00 AM")
  const [endTime, setEndTime] = useState(range.endTime ?? "11:59 PM")
  const [useUtc, setUseUtc] = useState(range.utc ?? true)

  // The modal stays mounted between opens (only `open` toggles), so its
  // internal state otherwise only ever reflects the very first `range` it
  // was mounted with. Re-derive on every open so a reset on the parent
  // (range cleared to null, hasSelection false) is actually reflected
  // instead of showing whatever was left selected from last time.
  useEffect(() => {
    if (!open) return

    const start = normalizePoint(range, "start")
    const end = normalizePoint(range, "end")

    setViewYear(start?.year ?? range.year)
    setViewMonth(start?.month ?? range.month)
    setSelection(hasSelection ? { start, end } : { start: null, end: null })
    setStartTime(range.startTime ?? "12:00 AM")
    setEndTime(range.endTime ?? "11:59 PM")
    setUseUtc(range.utc ?? true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Keep the open view selectable even if it falls outside the default jump
  // list (e.g. a saved range from further back than YEAR_OPTIONS covers).
  const yearOptions = YEAR_OPTIONS.includes(viewYear)
    ? YEAR_OPTIONS
    : [...YEAR_OPTIONS, viewYear].sort((a, b) => b - a)

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((year) => year - 1)
    } else {
      setViewMonth((month) => month - 1)
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((year) => year + 1)
    } else {
      setViewMonth((month) => month + 1)
    }
  }

  function handleDayClick(day) {
    const point = { year: viewYear, month: viewMonth, day }

    if (!selection.start || (selection.start && selection.end)) {
      setSelection({ start: point, end: null })
    } else if (toOrdinal(point) < toOrdinal(selection.start)) {
      setSelection({ start: point, end: selection.start })
    } else {
      setSelection({ start: selection.start, end: point })
    }
  }

  function isInRange(day) {
    if (!selection.start) return false

    const point = { year: viewYear, month: viewMonth, day }
    const end = selection.end ?? selection.start
    const ordinal = toOrdinal(point)

    return ordinal >= toOrdinal(selection.start) && ordinal <= toOrdinal(end)
  }

  function isRangeStart(day) {
    return selection.start && samePoint(selection.start, { year: viewYear, month: viewMonth, day })
  }

  function isRangeEnd(day) {
    const end = selection.end ?? selection.start
    return end && samePoint(end, { year: viewYear, month: viewMonth, day })
  }

  function handleApply() {
    onApply({
      start: selection.start,
      end: selection.end ?? selection.start,
      startTime,
      endTime,
      utc: useUtc,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] w-96 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-96"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Filter Time Range
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              <Select value={String(viewMonth)} onValueChange={(value) => setViewMonth(Number(value))}>
                <SelectTrigger className="h-8 w-34 rounded-lg">
                  <SelectValue>{(value) => monthNames[Number(value)]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, index) => (
                    <SelectItem key={name} value={String(index)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={String(viewYear)} onValueChange={(value) => setViewYear(Number(value))}>
                <SelectTrigger className="h-8 w-22 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {selection.start && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              {monthNames[selection.start.month]} {selection.start.day}, {selection.start.year}
              {" – "}
              {selection.end
                ? `${monthNames[selection.end.month]} ${selection.end.day}, ${selection.end.year}`
                : "…"}
            </p>
          )}

          <div className="mt-4 grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const inRange = isInRange(day)
              const isStart = isRangeStart(day)
              const isEnd = isRangeEnd(day)
              const today = isToday(viewYear, viewMonth, day)

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "flex h-9 w-full min-w-0 items-center justify-center text-sm text-foreground/85 transition-colors",
                    inRange && "bg-[#1e2a4a] font-medium text-white",
                    isStart && "rounded-l-full",
                    isEnd && "rounded-r-full",
                    !inRange && "rounded-full hover:bg-muted",
                    // Today gets a soft tint in the same navy family as the
                    // solid selected/range fill, so it reads as related but
                    // distinct — findable at a glance without being mistaken
                    // for an actual selection.
                    !inRange && today && "bg-[#1e2a4a]/10 font-medium text-[#1e2a4a]"
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border px-5 py-4">
          <input
            type="text"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2 text-center text-sm text-foreground/85 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <input
            type="text"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2 text-center text-sm text-foreground/85 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <label className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-input px-2.5 text-sm text-foreground/85">
            <input
              type="checkbox"
              checked={useUtc}
              onChange={(event) => setUseUtc(event.target.checked)}
              className="h-4 w-4 shrink-0 rounded border-input accent-[#1e2a4a]"
            />
            UTC
          </label>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!selection.start}
            className="rounded-lg bg-[#1e2a4a] px-5 py-2 text-sm font-medium text-white hover:bg-[#1e2a4a]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { DateRangeFilterModal }
export default DateRangeFilterModal
