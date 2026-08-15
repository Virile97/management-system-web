import { Card } from "@/components/ui/card"
import { FileTypeBadge } from "./FileStoragePrimitives"
import { formatBytes } from "./file-storage.constants"
import { formatDate } from "./FileCard"
import { FileGridSkeleton } from "./FileStorageSkeletons"
import { FolderOpen } from "lucide-react"

function FileListView({ files, onFileClick, isLoading, busyFileId }) {
  if (isLoading) return <FileGridSkeleton count={6} />

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <FolderOpen className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No files here yet</p>
      </div>
    )
  }

  return (
    <Card className="gap-0 p-0">
      {files.map((file, index) => (
        <button
          key={file.id}
          type="button"
          onClick={() => onFileClick?.(file)}
          disabled={busyFileId === file.id}
          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-60 ${
            index > 0 ? "border-t border-border" : ""
          }`}
        >
          <FileTypeBadge
            fileType={file.fileType}
            originalName={file.originalName}
            size="list"
          />
          <span className="min-w-0 flex-1 truncate font-medium text-foreground/90">
            {file.name}
          </span>
          <span className="w-24 shrink-0 text-xs text-muted-foreground">
            {formatBytes(file.sizeBytes)}
          </span>
          <span className="w-28 shrink-0 text-xs text-muted-foreground">
            {formatDate(file.createdAt)}
          </span>
        </button>
      ))}
    </Card>
  )
}

export { FileListView }
export default FileListView
