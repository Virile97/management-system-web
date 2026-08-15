"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

/** Full-size in-app preview for images and video. Everything else (PDF,
 * Google-viewer docs, generic downloads) opens in a new tab instead — see
 * page.js's handleFileClick dispatch. */
function FilePreviewModal({ open, onOpenChange, file, url, isLoading }) {
  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-[90vw] flex-col gap-3 overflow-hidden p-4 sm:max-w-4xl">
        <DialogTitle className="truncate pr-6 text-sm font-medium text-foreground">
          {file.name}
        </DialogTitle>

        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/5">
          {isLoading || !url ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : file.fileType === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element -- signed URL
            // is short-lived/opaque and not a static asset next/image can optimize
            <img
              src={url}
              alt={file.name}
              className="max-h-[80vh] max-w-full object-contain"
            />
          ) : file.fileType === "VIDEO" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption -- captions
            // aren't available for arbitrary user-uploaded files
            <video
              src={url}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full"
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { FilePreviewModal }
export default FilePreviewModal
