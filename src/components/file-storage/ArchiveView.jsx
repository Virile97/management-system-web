"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileTypeBadge } from "./FileStoragePrimitives"
import { formatBytes, FILE_TYPE_LABELS } from "./file-storage.constants"
import { formatDate } from "./FileCard"
import { Archive, Folder, RotateCcw, Trash2 } from "lucide-react"

const HEADER_CLASS =
  "text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"

function ArchiveRowSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_auto] items-center gap-4 border-t border-border px-4 py-3.5 first:border-t-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 min-w-[2.25rem] rounded-lg" />
        <Skeleton className="h-4 w-40 max-w-full" />
      </div>
      <Skeleton className="h-3 w-14" />
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-20 rounded-lg" />
    </div>
  )
}

function ArchiveView({ items, isLoading, busyKey, onRestore, onPermanentDelete }) {
  if (isLoading) {
    return (
      <Card className="gap-0 overflow-hidden p-0">
        {Array.from({ length: 6 }).map((_, index) => (
          <ArchiveRowSkeleton key={index} />
        ))}
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E4E0] bg-white py-16 text-center">
        <Archive className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">Archive is empty</p>
      </div>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_auto] items-center gap-4 border-b border-border px-4 py-3">
        <span className={HEADER_CLASS}>Name</span>
        <span className={HEADER_CLASS}>Type</span>
        <span className={HEADER_CLASS}>Size</span>
        <span className={HEADER_CLASS}>Archived</span>
        <span className="w-[9.5rem]" />
      </div>

      {items.map((item, index) => {
        const key = `${item.itemType}:${item.id}`
        const isBusy = busyKey === key
        return (
          <div
            key={key}
            className={`grid grid-cols-[minmax(0,2.5fr)_1fr_1fr_1fr_auto] items-center gap-4 px-4 py-3.5 text-sm ${
              index > 0 ? "border-t border-border" : ""
            } ${isBusy ? "opacity-60" : ""}`}
          >
            <span className="flex min-w-0 items-center gap-3">
              {item.itemType === "folder" ? (
                <span className="inline-flex h-8 min-w-[2.25rem] items-center justify-center rounded-lg bg-[#F1F5F9] px-2 text-[#1e2a4a]">
                  <Folder className="h-4 w-4" />
                </span>
              ) : (
                <FileTypeBadge
                  fileType={item.fileType}
                  originalName={item.originalName}
                  size="list"
                />
              )}
              <span className="truncate font-medium text-foreground/90">
                {item.name}
              </span>
            </span>

            <span className="text-muted-foreground">
              {item.itemType === "folder"
                ? "Folder"
                : FILE_TYPE_LABELS[item.fileType] || "Other"}
            </span>
            <span className="text-muted-foreground">
              {item.itemType === "file" ? formatBytes(item.sizeBytes) : "—"}
            </span>
            <span className="text-muted-foreground">
              {formatDate(item.deletedAt)}
            </span>

            <span className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isBusy}
                onClick={() => onRestore?.(item)}
                className="h-7 rounded-lg border-[#E5E4E0] px-2 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                Restore
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isBusy}
                onClick={() => onPermanentDelete?.(item)}
                aria-label="Delete permanently"
                className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </span>
          </div>
        )
      })}
    </Card>
  )
}

export { ArchiveView }
export default ArchiveView
