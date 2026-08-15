"use client"

import {
  FileTypeBadge,
  TagPill,
  gridCardClassName,
  GridSelectedOverlay,
} from "./FileStoragePrimitives"
import { ImageCardPreview, PdfCardPreview } from "./FileThumbnail"
import { GRID_FILE_MENU_ITEMS, formatBytes } from "./file-storage.constants"
import { GridItemMenu } from "./GridItemMenu"
import { useGridItemInteraction } from "@/hooks/use-grid-item-interaction"

function formatDate(value) {
  if (!value) return ""
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatFooterDate(value) {
  if (!value) return ""
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getInitials(name) {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function FileMeta({ file, className = "" }) {
  const visibleTags = file.tags?.slice(0, 3) || []

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <p className="line-clamp-2 text-sm leading-snug font-semibold">
        {file.name}
      </p>
      <p className="text-xs opacity-80">
        {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
      </p>
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}

function GridCardSurface({
  selected,
  className,
  surfaceClassName = "",
  handleClick,
  handleDoubleClick,
  isBusy,
  menuItems,
  onMenuAction,
  children,
}) {
  return (
    <div
      className={gridCardClassName({
        selected,
        className: `group relative ${className}`,
      })}
    >
      <div
        role="button"
        tabIndex={isBusy ? -1 : 0}
        aria-selected={selected}
        aria-disabled={isBusy || undefined}
        onClick={isBusy ? undefined : handleClick}
        onDoubleClick={isBusy ? undefined : handleDoubleClick}
        onKeyDown={(event) => {
          if (isBusy) return
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            handleClick()
          }
        }}
        className={`relative h-full w-full text-left outline-none ${surfaceClassName} ${
          isBusy ? "pointer-events-none opacity-60" : "cursor-pointer"
        }`}
      >
        {children}
      </div>

      <GridItemMenu items={menuItems} onAction={onMenuAction} />
    </div>
  )
}

function PreviewCard({
  file,
  handleClick,
  handleDoubleClick,
  isBusy,
  selected,
  onMenuAction,
  bgClassName,
  Preview,
}) {
  return (
    <GridCardSurface
      selected={selected}
      handleClick={handleClick}
      handleDoubleClick={handleDoubleClick}
      isBusy={isBusy}
      menuItems={GRID_FILE_MENU_ITEMS}
      onMenuAction={onMenuAction}
      surfaceClassName="min-h-[156px]"
      className={`overflow-hidden rounded-xl border border-[#E5E4E0] transition-all hover:border-[#D8D6D0] ${bgClassName}`}
    >
      <GridSelectedOverlay selected={selected} />
      <Preview file={file} />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 group-has-[button[data-popup-open]]:opacity-0">
        <FileMeta file={file} />
      </div>
    </GridCardSurface>
  )
}

function PdfGridCard({
  file,
  handleClick,
  handleDoubleClick,
  isBusy,
  selected,
  onMenuAction,
}) {
  const footerDate = formatFooterDate(file.createdAt)
  const footerLabel = file.uploadedByName
    ? `${file.uploadedByName} uploaded`
    : "Uploaded"

  return (
    <GridCardSurface
      selected={selected}
      handleClick={handleClick}
      handleDoubleClick={handleDoubleClick}
      isBusy={isBusy}
      menuItems={GRID_FILE_MENU_ITEMS}
      onMenuAction={onMenuAction}
      surfaceClassName="flex min-h-[240px] flex-col"
      className="overflow-hidden rounded-xl border border-[#E5E4E0] bg-[#F3F2EE] transition-all hover:border-[#D8D6D0]"
    >
      <GridSelectedOverlay selected={selected} />

      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
        <FileTypeBadge
          fileType={file.fileType}
          originalName={file.originalName}
          size="list"
        />
        <p className="min-w-0 flex-1 truncate pr-6 text-sm font-semibold text-foreground">
          {file.name}
        </p>
      </div>

      <div className="flex flex-1 px-3 pb-2">
        <PdfCardPreview file={file} variant="inset" />
      </div>

      <div className="flex items-center gap-2 px-3 pb-3 pt-1">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1e2a4a]/10 text-[10px] font-semibold text-[#1e2a4a]">
          {getInitials(file.uploadedByName)}
        </span>
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          {footerLabel}
          {footerDate ? ` · ${footerDate}` : ""}
        </p>
      </div>
    </GridCardSurface>
  )
}

function FileCard({ file, onSelect, onOpen, onMenuAction, isBusy, selected }) {
  const { handleClick, handleDoubleClick } = useGridItemInteraction({
    onSelect,
    onOpen,
  })

  if (file.fileType === "IMAGE") {
    return (
      <PreviewCard
        file={file}
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        isBusy={isBusy}
        selected={selected}
        onMenuAction={(action) => onMenuAction?.(action, file)}
        bgClassName="bg-[#FEF3C7]"
        Preview={ImageCardPreview}
      />
    )
  }

  if (file.fileType === "PDF") {
    return (
      <PdfGridCard
        file={file}
        handleClick={handleClick}
        handleDoubleClick={handleDoubleClick}
        isBusy={isBusy}
        selected={selected}
        onMenuAction={(action) => onMenuAction?.(action, file)}
      />
    )
  }

  return (
    <GridCardSurface
      selected={selected}
      handleClick={handleClick}
      handleDoubleClick={handleDoubleClick}
      isBusy={isBusy}
      menuItems={GRID_FILE_MENU_ITEMS}
      onMenuAction={(action) => onMenuAction?.(action, file)}
      surfaceClassName="min-h-[156px]"
      className="rounded-xl border border-[#E5E4E0] bg-white transition-all hover:border-[#D8D6D0]"
    >
      <div className="flex min-h-[156px] flex-col gap-3 p-4">
        <GridSelectedOverlay selected={selected} />
        <FileTypeBadge fileType={file.fileType} originalName={file.originalName} />
        <FileMeta file={file} className="flex-1 text-foreground" />
      </div>
    </GridCardSurface>
  )
}

export { FileCard, formatDate }
export default FileCard
