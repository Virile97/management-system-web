"use client"

import { Folder } from "lucide-react"
import {
  gridCardClassName,
  GridSelectedOverlay,
} from "./FileStoragePrimitives"
import { GRID_FOLDER_MENU_ITEMS } from "./file-storage.constants"
import { GridItemMenu } from "./GridItemMenu"
import { useGridItemInteraction } from "@/hooks/use-grid-item-interaction"

function FolderCard({ folder, onSelect, onOpen, onMenuAction, selected }) {
  const { handleClick, handleDoubleClick } = useGridItemInteraction({
    onSelect,
    onOpen,
  })

  return (
    <div
      className={gridCardClassName({
        selected,
        className:
          "group relative min-h-[156px] rounded-xl border border-[#E5E4E0] bg-white transition-all hover:border-[#D8D6D0]",
      })}
    >
      <div
        role="button"
        tabIndex={0}
        aria-selected={selected}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleClick()
          }
        }}
        className="relative flex h-full min-h-[156px] w-full cursor-pointer flex-col justify-between gap-3 p-4 text-left outline-none"
      >
        <GridSelectedOverlay selected={selected} />

        <span className="inline-flex h-11 w-12 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#1e2a4a]">
          <Folder className="h-5 w-5" />
        </span>

        <p className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
          {folder.name}
        </p>
      </div>

      <GridItemMenu
        items={GRID_FOLDER_MENU_ITEMS}
        onAction={(action) => onMenuAction?.(action, folder)}
      />
    </div>
  )
}

export { FolderCard }
export default FolderCard
