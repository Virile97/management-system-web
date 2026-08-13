"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
)
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))
const periods = ["AM", "PM"]

function parseValue(value) {
  const match = /^(\d{2}):(\d{2}) (AM|PM)$/.exec(value ?? "")

  if (!match)
    return {
      hour: null,
      minute: null,
      period: null,
    }

  return { hour: match[1], minute: match[2], period: match[3] }
}

function formatDisplay({ hour, minute, period }) {
  return `${hour ?? "--"}:${minute ?? "--"} ${period ?? "--"}`
}

function formatValue({ hour, minute, period }) {
  if (!hour || !minute || !period) return null

  return `${hour}:${minute} ${period}`
}

function currentHour12() {
  const hour24 = new Date().getHours()
  const hour12 = hour24 % 12 || 12

  return String(hour12).padStart(2, "0")
}

function currentMinute() {
  return String(new Date().getMinutes()).padStart(2, "0")
}

function rotateFrom(options, start) {
  const index = options.indexOf(start)

  if (index <= 0) return options

  return [...options.slice(index), ...options.slice(0, index)]
}

function TimePickerColumn({ options, active, currentValue, onSelect }) {
  return (
    <div className="h-40 w-14 overflow-y-auto">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={cn(
            "flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors",
            active === option
              ? "bg-blue-500 font-medium text-white"
              : "text-foreground/80 hover:bg-muted",

            active !== option &&
              option === currentValue &&
              "bg-blue-50 font-medium text-blue-600"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function clearNextSegment(parts) {
  if (parts.minute) return { ...parts, minute: null }
  if (parts.hour || parts.period) return { ...parts, hour: null, period: null }
  return parts
}

function TimePickerInput({
  value,
  disabled,
  onChange,
  placeholder = "--:-- --",
  className,
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => parseValue(value))

  const lastEmitted = useRef(value)

  useEffect(() => {
    if (value === lastEmitted.current) return

    lastEmitted.current = value
    setDraft(parseValue(value))
  }, [value])

  function commit(nextParts) {
    setDraft(nextParts)
    const nextValue = formatValue(nextParts)
    lastEmitted.current = nextValue
    onChange?.(nextValue)
  }

  function fillMissingSegment(parts) {
    if (!(parts.hour || parts.minute) || (parts.hour && parts.minute))
      return parts

    return {
      ...parts,
      hour: parts.hour ?? currentHour12(),
      minute: parts.minute ?? "00",
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Backspace") {
      event.preventDefault()
      commit(clearNextSegment(draft))
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      commit(fillMissingSegment(draft))
      setOpen(false)
    }
  }

  function handleOpenChange(nextOpen) {
    if (!nextOpen) commit(fillMissingSegment(draft))
    setOpen(nextOpen)
  }

  const hasAnySegment = draft.hour || draft.minute || draft.period
  const display = hasAnySegment ? formatDisplay(draft) : null

  const { hourOptions, minuteOptions, nowHour, nowMinute } = useMemo(() => {
    if (!open)
      return {
        hourOptions: hours,
        minuteOptions: minutes,
        nowHour: null,
        nowMinute: null,
      }

    const hour = currentHour12()
    const minute = currentMinute()
    return {
      hourOptions: rotateFrom(hours, hour),
      minuteOptions: rotateFrom(minutes, minute),
      nowHour: hour,
      nowMinute: minute,
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative block w-full rounded-lg outline-none disabled:opacity-50 sm:w-30",
          className
        )}
      >
        <span
          className={cn(
            "flex h-8 w-full items-center rounded-lg border border-input bg-transparent pr-6 pl-2 text-left text-xs transition-colors",
            "data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50",
            display ? "text-foreground/85" : "text-muted-foreground/60"
          )}
        >
          {display || placeholder}
        </span>
        <Clock className="pointer-events-none absolute top-1/2 right-2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
      </PopoverTrigger>

      <PopoverContent className="w-auto" onKeyDown={handleKeyDown}>
        <div className="flex divide-x divide-border">
          <TimePickerColumn
            options={hourOptions}
            active={draft.hour}
            currentValue={nowHour}
            onSelect={(hour) => commit({ ...draft, hour })}
          />
          <TimePickerColumn
            options={minuteOptions}
            active={draft.minute}
            currentValue={nowMinute}
            onSelect={(minute) => commit({ ...draft, minute })}
          />
          <TimePickerColumn
            options={periods}
            active={draft.period}
            onSelect={(period) => commit({ ...draft, period })}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TimePickerInput }
export default TimePickerInput
