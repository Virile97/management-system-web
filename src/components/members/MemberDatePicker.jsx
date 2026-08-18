"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchableCombobox } from "@/components/common/SearchableCombobox"
import { cn } from "@/lib/utils"
import { formatDatePoint, toDatePoint, toDateString } from "@/utils/helpers"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const WEEKDAY_LABELS = ["S", "M", "T", "W", "Th", "F", "S"]

const CURRENT_YEAR = new Date().getFullYear()
const DEFAULT_MIN_YEAR = CURRENT_YEAR - 120

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function isSamePoint(a, b) {
  if (!a || !b) return false
  return a.year === b.year && a.month === b.month && a.day === b.day
}

function isToday(year, month, day) {
  const now = new Date()
  return (
    now.getFullYear() === year &&
    now.getMonth() === month &&
    now.getDate() === day
  )
}

function isFutureDate(year, month, day) {
  const candidate = new Date(year, month, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return candidate.getTime() > today.getTime()
}

function buildYearOptions(minYear, maxYear, viewYear) {
  const years = []

  for (let year = maxYear; year >= minYear; year -= 1) {
    years.push(year)
  }

  if (!years.includes(viewYear)) {
    years.push(viewYear)
    years.sort((a, b) => b - a)
  }

  return years
}

function MemberDatePicker({
  id,
  value = "",
  onChange,
  onBlur,
  disabled = false,
  clearable = true,
  placeholder = "Select date",
  minYear = DEFAULT_MIN_YEAR,
  maxYear = CURRENT_YEAR,
  "aria-invalid": ariaInvalid,
  className,
}) {
  const selected = toDatePoint(value)
  const now = new Date()

  const [open, setOpen] = useState(false)
  const skipCloseBlurRef = useRef(false)
  const [viewYear, setViewYear] = useState(selected?.year ?? now.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected?.month ?? now.getMonth())

  useEffect(() => {
    if (!open) return

    const point = toDatePoint(value)
    setViewYear(point?.year ?? now.getFullYear())
    setViewMonth(point?.month ?? now.getMonth())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const yearOptions = useMemo(
    () => buildYearOptions(minYear, maxYear, viewYear),
    [minYear, maxYear, viewYear]
  )

  const yearComboboxOptions = useMemo(
    () => yearOptions.map((year) => ({ value: String(year), label: String(year) })),
    [yearOptions]
  )

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1)

  const displayValue = selected ? formatDatePoint(selected) : ""

  function handleDaySelect(day) {
    if (isFutureDate(viewYear, viewMonth, day)) return

    const next = toDateString({ year: viewYear, month: viewMonth, day })
    onChange?.(next)
    onBlur?.(next)
    skipCloseBlurRef.current = true
    setOpen(false)
  }

  function handleClear(event) {
    event.preventDefault()
    event.stopPropagation()
    onChange?.("")
    onBlur?.("")
    skipCloseBlurRef.current = true
    setOpen(false)
  }

  function handleOpenChange(next) {
    if (disabled) return
    setOpen(next)

    if (!next) {
      if (skipCloseBlurRef.current) {
        skipCloseBlurRef.current = false
        return
      }

      onBlur?.(value)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={ariaInvalid}
        className={cn(
          "relative flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30",
          !displayValue && "text-muted-foreground",
          clearable && displayValue && "pr-9",
          className
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">
          {displayValue || placeholder}
        </span>
        {clearable && displayValue && !disabled ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            onClick={handleClear}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                handleClear(event)
              }
            }}
            className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent className="w-[min(100vw-2rem,18rem)] p-3" align="start">
        <div className="flex items-center gap-2">
          <SearchableCombobox
            options={yearComboboxOptions}
            value={String(viewYear)}
            onChange={(next) => {
              const year = Number(next)
              if (!Number.isFinite(year)) return
              setViewYear(Math.min(maxYear, Math.max(minYear, year)))
            }}
            allowCreate={false}
            clearable={false}
            placeholder="Year"
            searchPlaceholder="Search year…"
            emptyText="No years found"
            className="min-w-0 flex-1 [&_button]:h-9 [&_button]:bg-card"
          />

          <Select
            value={String(viewMonth)}
            onValueChange={(next) => setViewMonth(Number(next))}
          >
            <SelectTrigger className="h-9 min-w-0 flex-1 rounded-lg bg-card">
              <SelectValue>{(val) => MONTH_NAMES[Number(val)]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MONTH_NAMES.map((name, index) => (
                <SelectItem key={name} value={String(index)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-y-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}

          {Array.from({ length: leadingBlanks }).map((_, index) => (
            <div key={`blank-${index}`} aria-hidden="true" />
          ))}

          {days.map((day) => {
            const point = { year: viewYear, month: viewMonth, day }
            const isSelected = isSamePoint(selected, point)
            const today = isToday(viewYear, viewMonth, day)
            const isDisabled = isFutureDate(viewYear, viewMonth, day)

            return (
              <button
                key={day}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDaySelect(day)}
                className={cn(
                  "flex h-8 w-full items-center justify-center rounded-full text-sm transition-colors",
                  isSelected &&
                    "bg-[#1e2a4a] font-medium text-white hover:bg-[#1e2a4a]/90",
                  !isSelected &&
                    !isDisabled &&
                    "text-foreground/85 hover:bg-muted",
                  !isSelected &&
                    today &&
                    !isDisabled &&
                    "bg-[#1e2a4a]/10 font-medium text-[#1e2a4a]",
                  isDisabled && "cursor-not-allowed text-muted-foreground/40"
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MemberDateFormField({ field, value, error, onChange, onBlur }) {
  const { name, label, required } = field

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`member-${name}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <MemberDatePicker
        id={`member-${name}`}
        value={value}
        onChange={(next) => onChange(name, next)}
        onBlur={(next) => onBlur(name, next)}
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export { MemberDatePicker, MemberDateFormField }
export default MemberDatePicker
