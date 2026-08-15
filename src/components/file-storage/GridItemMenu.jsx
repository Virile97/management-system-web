"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { MoreVertical } from "lucide-react"

function GridItemMenu({ items, onAction, className }) {
  const [open, setOpen] = useState(false)

  if (!items?.length || !onAction) return null

  function handleSelect(actionId, event) {
    event.stopPropagation()
    setOpen(false)
    onAction(actionId)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label="More actions"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        className={cn(
          "absolute top-2.5 right-2.5 z-40 flex h-7 w-7 items-center justify-center",
          "text-foreground/70 transition-opacity duration-150 ease-out",
          "hover:text-foreground focus-visible:opacity-100",
          "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          open && "opacity-100",
          className
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent
        positionerClassName="z-[200]"
        className="w-52 rounded-xl border-[#E5E4E0] p-1.5 shadow-lg"
        align="end"
        sideOffset={6}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={(event) => handleSelect(id, event)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#F3F2EF]"
          >
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            {label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export { GridItemMenu }
export default GridItemMenu
