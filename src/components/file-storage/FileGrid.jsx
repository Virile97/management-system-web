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
}) {
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} onClick={onFolderClick} />
      ))}
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onClick={onFileClick}
          isBusy={busyFileId === file.id}
        />
      ))}
    </div>
  )
}

export { FileGrid }
export default FileGrid
