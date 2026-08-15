import { FileTypeBadge, TagPill } from "./FileStoragePrimitives"
import { formatBytes } from "./file-storage.constants"

function formatDate(value) {
  if (!value) return ""
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function FileCard({ file, onClick, isBusy }) {
  const visibleTags = file.tags?.slice(0, 3) || []

  return (
    <button
      type="button"
      onClick={() => onClick?.(file)}
      disabled={isBusy}
      className="group flex min-h-[156px] flex-col gap-3 rounded-xl border border-[#E5E4E0] bg-white p-4 text-left transition-colors hover:border-[#D8D6D0] disabled:pointer-events-none disabled:opacity-60"
    >
      <FileTypeBadge fileType={file.fileType} originalName={file.originalName} />

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
          {file.name}
        </p>

        <p className="text-xs text-muted-foreground">
          {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
        </p>
      </div>

      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>
      )}
    </button>
  )
}

export { FileCard, formatDate }
export default FileCard
