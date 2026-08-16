"use client"

import { useState } from "react"
import { Folder } from "lucide-react"
import {
  gridCardClassName,
  GridSelectedOverlay,
} from "./FileStoragePrimitives"
import { GRID_FOLDER_MENU_ITEMS } from "./file-storage.constants"
import { GridItemMenu } from "./GridItemMenu"
import { useGridItemInteraction } from "@/hooks/use-grid-item-interaction"

function FolderCard({
  folder,
  onSelect,
  onOpen,
  onMenuAction,
  selected,
  draggable = false,
  onDragStart,
  onDragEnd,
  onDropItem,
}) {
  const { handleClick, handleDoubleClick } = useGridItemInteraction({
    onSelect,
    onOpen,
  })
  const [isDropTarget, setIsDropTarget] = useState(false)
  const acceptsDrop = draggable && Boolean(onDropItem)

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? (event) => onDragStart?.(event, folder) : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      onDragOver={
        acceptsDrop
          ? (event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
            }
          : undefined
      }
      onDragEnter={
        acceptsDrop
          ? (event) => {
              event.preventDefault()
              setIsDropTarget(true)
            }
          : undefined
      }
      onDragLeave={
        acceptsDrop
          ? (event) => {
              if (event.currentTarget.contains(event.relatedTarget)) return
              setIsDropTarget(false)
            }
          : undefined
      }
      onDrop={
        acceptsDrop
          ? (event) => {
              event.preventDefault()
              setIsDropTarget(false)
              onDropItem(folder)
            }
          : undefined
      }
      className={gridCardClassName({
        selected,
        className: `group relative min-h-[156px] border bg-white transition-all ${
          isDropTarget
            ? "border-[#1e2a4a] ring-2 ring-[#1e2a4a]/30"
            : "border-[#E5E4E0] hover:border-[#D8D6D0]"
        }`,
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
        className="relative flex h-full min-h-[156px] w-full cursor-pointer select-none flex-col justify-between gap-3 p-4 text-left outline-none"
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
