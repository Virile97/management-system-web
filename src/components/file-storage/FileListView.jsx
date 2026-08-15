import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FileTypeBadge, TagPill } from "./FileStoragePrimitives"
import { formatBytes, FILE_TYPE_LABELS } from "./file-storage.constants"
import { formatDate } from "./FileCard"
import { FileListSkeleton } from "./FileStorageSkeletons"
import { Folder, FolderOpen } from "lucide-react"

const HEADER_CLASS =
  "text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"

function FileListView({
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
}) {
  if (isLoading) return <FileListSkeleton />

  if (files.length === 0 && folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No files here yet</p>
      </div>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="grid grid-cols-[auto_minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-border px-4 py-3">
        <span className="flex w-4 items-center">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onCheckedChange={() => onToggleSelectAll?.()}
            aria-label="Select all"
          />
        </span>
        <span className={HEADER_CLASS}>Name</span>
        <span className={HEADER_CLASS}>Type</span>
        <span className={HEADER_CLASS}>Size</span>
        <span className={HEADER_CLASS}>Uploaded By</span>
        <span className={HEADER_CLASS}>Date</span>
      </div>

      {folders.map((folder, index) => {
        const key = `folder:${folder.id}`
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFolderClick?.(folder)}
            className={`grid w-full grid-cols-[auto_minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <span
              className="flex w-4 items-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                checked={selectedKeys?.has(key)}
                onCheckedChange={() => onToggleSelect?.(key)}
                aria-label={`Select ${folder.name}`}
              />
            </span>
            <span className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#1e2a4a]">
                <Folder className="h-4 w-4" />
              </span>
              <span className="truncate font-medium text-foreground/90">
                {folder.name}
              </span>
            </span>
            <span className="text-sm text-muted-foreground">Folder</span>
            <span />
            <span />
            <span />
          </button>
        )
      })}

      {files.map((file, index) => {
        const key = `file:${file.id}`
        return (
          <button
            key={key}
            type="button"
            onClick={() => onFileClick?.(file)}
            disabled={busyFileId === file.id}
            className={`grid w-full grid-cols-[auto_minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3.5 text-left text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60 ${
              folders.length + index > 0 ? "border-t border-border" : ""
            }`}
          >
            <span
              className="flex w-4 items-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Checkbox
                checked={selectedKeys?.has(key)}
                onCheckedChange={() => onToggleSelect?.(key)}
                aria-label={`Select ${file.name}`}
              />
            </span>

            <span className="flex min-w-0 items-center gap-3">
              <FileTypeBadge
                fileType={file.fileType}
                originalName={file.originalName}
                size="list"
              />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-medium text-foreground/90">
                  {file.name}
                </span>
                {file.tags?.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {file.tags.map((tag) => (
                      <TagPill key={tag} tag={tag} />
                    ))}
                  </span>
                )}
              </span>
            </span>

            <span className="text-sm text-muted-foreground">
              {FILE_TYPE_LABELS[file.fileType] || "Other"}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatBytes(file.sizeBytes)}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {file.uploadedByName || "—"}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(file.createdAt)}
            </span>
          </button>
        )
      })}
    </Card>
  )
}

export { FileListView }
export default FileListView
