"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, LayoutGrid, List, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddMenu } from "./AddMenu"
import { SORT_OPTIONS } from "./file-storage.constants"

function FileStorageToolbar({
  search,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  onToggleSortOrder,
  viewMode,
  onViewModeChange,
  onNewFolder,
  onUploadType,
  canManage,
}) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:flex-nowrap xl:justify-end">
      <div className="relative min-w-[180px] flex-1 xl:min-w-[280px] xl:max-w-[420px]">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search files or tags..."
          className="h-10 rounded-lg border-[#E5E4E0] bg-white pl-9 shadow-none"
        />
      </div>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="h-10 w-auto min-w-[7.25rem] rounded-lg border-[#E5E4E0] bg-white py-0 shadow-none data-[size=default]:h-10">
          <SelectValue>
            {(value) =>
              `Sort: ${SORT_OPTIONS.find((o) => o.value === value)?.label || "Date"}`
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={sortOrder === "asc" ? "Sort ascending" : "Sort descending"}
        onClick={onToggleSortOrder}
        className="h-10 w-10 shrink-0 rounded-lg border-[#E5E4E0] bg-white shadow-none"
      >
        <ArrowUpDown
          className={cn(
            "h-4 w-4 transition-transform",
            sortOrder === "asc" && "scale-y-[-1]"
          )}
        />
      </Button>

      <div className="flex h-10 items-center rounded-lg border border-[#E5E4E0] bg-white p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={viewMode === "grid"}
          aria-label="Grid view"
          onClick={() => onViewModeChange("grid")}
          className={cn(
            "h-8 w-8 rounded-md",
            viewMode === "grid"
              ? "bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90 hover:text-white"
              : "text-muted-foreground hover:bg-transparent hover:text-foreground"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={viewMode === "list"}
          aria-label="List view"
          onClick={() => onViewModeChange("list")}
          className={cn(
            "h-8 w-8 rounded-md",
            viewMode === "list"
              ? "bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90 hover:text-white"
              : "text-muted-foreground hover:bg-transparent hover:text-foreground"
          )}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {canManage && (
        <AddMenu onNewFolder={onNewFolder} onUploadType={onUploadType} />
      )}
    </div>
  )
}

export { FileStorageToolbar }
export default FileStorageToolbar
