import { Checkbox } from "@/components/ui/checkbox"
import { FileGridSkeleton } from "./FileStorageSkeletons"
import { FileCard } from "./FileCard"
import { FolderCard } from "./FolderCard"
import { FolderOpen } from "lucide-react"

function FileGrid({
  files,
  folders = [],
  onFileClick,
  onFolderClick,
  isLoading,
  busyFileId,
  selectedKeys,
  onToggleSelect,
  allSelected = false,
  someSelected = false,
  onToggleSelectAll,
  onFileAction,
  onFolderAction,
  canMove = false,
  onDragItemStart,
  onDragItemEnd,
  onDropItemInFolder,
}) {
  const selectionActive = (selectedKeys?.size ?? 0) > 0

  if (isLoading) return <FileGridSkeleton />

  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#E5E4E0] bg-white py-16 text-center">
        <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No files here yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {onToggleSelectAll && !selectionActive && (
        <label className="flex w-fit items-center gap-2 rounded-lg px-1 py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={() => onToggleSelectAll()}
          />
          Select all
        </label>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {folders.map((folder) => {
          const key = `folder:${folder.id}`
          return (
            <FolderCard
              key={key}
              folder={folder}
              selected={selectedKeys?.has(key)}
              onSelect={onToggleSelect && (() => onToggleSelect(key))}
              onOpen={() => onFolderClick?.(folder)}
              onMenuAction={onFolderAction}
              draggable={canMove}
              onDragStart={onDragItemStart}
              onDragEnd={onDragItemEnd}
              onDropItem={
                onDropItemInFolder && ((target) => onDropItemInFolder(target))
              }
            />
          )
        })}
        {files.map((file) => {
          const key = `file:${file.id}`
          return (
            <FileCard
              key={key}
              file={file}
              isBusy={busyFileId === file.id}
              selected={selectedKeys?.has(key)}
              onSelect={onToggleSelect && (() => onToggleSelect(key))}
              onOpen={() => onFileClick?.(file)}
              onMenuAction={onFileAction}
              draggable={canMove}
              onDragStart={onDragItemStart}
              onDragEnd={onDragItemEnd}
            />
          )
        })}
      </div>
    </div>
  )
}

export { FileGrid }
export default FileGrid
