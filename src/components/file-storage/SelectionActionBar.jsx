"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Download, Trash2, X } from "lucide-react"

function SelectionActionBar({
  count,
  onDownload,
  onDelete,
  onClear,
  onSelectAll,
  allSelected = false,
  isBusy,
}) {
  if (count === 0) return null

  return (
    <div
      role="toolbar"
      aria-label="Selection actions"
      className={cn(
        "fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6",
        "flex items-center gap-1 rounded-2xl bg-[#1e2a4a] p-1.5",
        "shadow-xl shadow-[#1e2a4a]/25 ring-1 ring-white/10",
        "animate-in fade-in slide-in-from-bottom-3 duration-200"
      )}
    >
      <button
        type="button"
        onClick={onClear}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>

      <Divider />

      <p className="shrink-0 px-2 text-sm font-medium whitespace-nowrap text-white">
        {count} selected
      </p>

      {onSelectAll && (
        <>
          <Divider />
          <button
            type="button"
            onClick={onSelectAll}
            className="shrink-0 rounded-xl px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </>
      )}

      <Divider />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDownload}
          disabled={isBusy}
          className="h-9 rounded-xl px-3 text-white hover:bg-white/10 hover:text-white"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDelete}
          disabled={isBusy}
          className="h-9 rounded-xl px-3 text-red-300 hover:bg-red-500/20 hover:text-red-200"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="mx-0.5 hidden h-6 w-px shrink-0 bg-white/15 sm:block" aria-hidden />
}

export { SelectionActionBar }
export default SelectionActionBar
