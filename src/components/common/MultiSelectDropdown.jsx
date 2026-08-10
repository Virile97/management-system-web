"use client"

import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ListFilter, X } from "lucide-react"

function MultiSelectDropdown({ label = "Filter", options, selected, onChange, className }) {
  const [open, setOpen] = useState(false)

  const hasSelection = selected.length > 0 && selected.length < options.length

  function toggleOption(option) {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
  }

  function clearSelection(event) {
    event.stopPropagation()
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-input bg-white px-3 text-sm transition-colors outline-none",
          "data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50",
          hasSelection && "border-[#1e2a4a] text-[#1e2a4a]",
          className
        )}
      >
        <ListFilter className="h-3.5 w-3.5" />
        {hasSelection ? `${label} (${selected.length})` : label}
        {hasSelection && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`Clear ${label.toLowerCase()} filter`}
            onClick={clearSelection}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                clearSelection(event)
              }
            }}
            className="-mr-1 ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent className="w-56" align="start">
        <div className="max-h-70 overflow-y-auto p-1">
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/85 hover:bg-muted"
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelectDropdown }
export default MultiSelectDropdown
