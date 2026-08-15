"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileTypeBadge, TagPill } from "./FileStoragePrimitives"
import { FILE_TYPE_LABELS, formatBytes } from "./file-storage.constants"
import { formatDate } from "./FileCard"

function InfoRow({ label, value }) {
  if (!value) return null

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground sm:text-right">{value}</dd>
    </div>
  )
}

function FileInfoModal({ open, onOpenChange, item, kind }) {
  if (!item) return null

  const isFile = kind === "file"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b border-[#E5E4E0] px-5 py-4">
          <DialogTitle className="truncate pr-6">
            {isFile ? "File information" : "Folder information"}
          </DialogTitle>
        </DialogHeader>

        <dl className="flex flex-col gap-4 px-5 py-4">
          <InfoRow label="Name" value={item.name} />

          {isFile && (
            <>
              <div className="flex flex-col gap-2">
                <dt className="text-sm text-muted-foreground">Type</dt>
                <dd>
                  <FileTypeBadge
                    fileType={item.fileType}
                    originalName={item.originalName}
                    size="list"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {FILE_TYPE_LABELS[item.fileType] || "Other"}
                  </span>
                </dd>
              </div>

              <InfoRow label="Size" value={formatBytes(item.sizeBytes)} />
              <InfoRow label="Original file" value={item.originalName} />
              <InfoRow label="Uploaded by" value={item.uploadedByName || "—"} />
              <InfoRow label="Uploaded" value={formatDate(item.createdAt)} />

              {item.tags?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <dt className="text-sm text-muted-foreground">Tags</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <TagPill key={tag} tag={tag} />
                    ))}
                  </dd>
                </div>
              )}
            </>
          )}

          {!isFile && (
            <InfoRow label="Created" value={formatDate(item.createdAt)} />
          )}
        </dl>
      </DialogContent>
    </Dialog>
  )
}

export { FileInfoModal }
export default FileInfoModal
