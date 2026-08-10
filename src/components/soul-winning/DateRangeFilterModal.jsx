"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Calendar, X, ChevronLeft, ChevronRight } from "lucide-react"

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function isToday(year, month, day) {
  const now = new Date()
  return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day
}

function DateRangeFilterModal({ open, onOpenChange, range, hasSelection = true, onApply }) {
  const [viewYear, setViewYear] = useState(range.year)
  const [viewMonth, setViewMonth] = useState(range.month)
  const [selection, setSelection] = useState(
    hasSelection ? { start: range.start, end: range.end } : { start: null, end: null }
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

    setViewYear(range.year)
    setViewMonth(range.month)
    setSelection(hasSelection ? { start: range.start, end: range.end } : { start: null, end: null })
    setStartTime(range.startTime ?? "12:00 AM")
    setEndTime(range.endTime ?? "11:59 PM")
    setUseUtc(range.utc ?? true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

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
    if (!selection.start || (selection.start && selection.end)) {
      setSelection({ start: day, end: null })
    } else if (day < selection.start) {
      setSelection({ start: day, end: selection.start })
    } else {
      setSelection({ start: selection.start, end: day })
    }
  }

  function isInRange(day) {
    if (!selection.start) return false

    const end = selection.end ?? selection.start
    return day >= selection.start && day <= end
  }

  function isRangeStart(day) {
    return day === selection.start
  }

  function isRangeEnd(day) {
    return day === (selection.end ?? selection.start)
  }

  function handleApply() {
    onApply({
      year: viewYear,
      month: viewMonth,
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
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium text-foreground/85">
              {monthNames[viewMonth]} <span className="text-muted-foreground">{viewYear}</span>
            </p>
            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

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
            className="rounded-lg bg-[#1e2a4a] px-5 py-2 text-sm font-medium text-white hover:bg-[#1e2a4a]/90"
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
