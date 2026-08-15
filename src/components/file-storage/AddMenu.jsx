"use client"

import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { FolderPlus, Plus, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { UPLOAD_MENU_ITEMS } from "./file-storage.constants"

function AddMenu({ onNewFolder, onUploadType }) {
  const [open, setOpen] = useState(false)

  function handleNewFolder() {
    setOpen(false)
    onNewFolder?.()
  }

  function handleUpload(type) {
    setOpen(false)
    onUploadType?.(type)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className="inline-flex h-10 shrink-0 items-center gap-1 rounded-lg bg-[#1e2a4a] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1e2a4a]/90 data-popup-open:bg-[#1e2a4a]/90"
      >
        <Plus className="h-4 w-4" />
        Add
        <ChevronDown className="h-3.5 w-3.5 opacity-80" />
      </PopoverTrigger>

      <PopoverContent
        className="z-[100] w-[13.5rem] rounded-xl border-[#E5E4E0] p-0 shadow-lg"
        align="end"
      >
        <div className="p-1.5">
          <p className="px-2.5 pt-1.5 pb-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            New
          </p>
          <button
            type="button"
            onClick={handleNewFolder}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-foreground hover:bg-[#F3F2EF]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EFEEEA]">
              <FolderPlus className="h-4 w-4 text-[#6B6960]" />
            </span>
            New Folder
          </button>

          <p className="px-2.5 pt-2.5 pb-1 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Upload File
          </p>
          {UPLOAD_MENU_ITEMS.map(({ type, label, icon: Icon, iconClassName }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleUpload(type)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm text-foreground hover:bg-[#F3F2EF]"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md",
                  iconClassName
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { AddMenu }
export default AddMenu
