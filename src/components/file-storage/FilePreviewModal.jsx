"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { GridItemMenu } from "./GridItemMenu"
import { GRID_FILE_MENU_ITEMS } from "./file-storage.constants"
import fileStorageService from "@/services/fileStorage.service"
import { Loader2, X, Download, Play, ChevronLeft, ChevronRight } from "lucide-react"

/** Full-screen image/video slider — modeled on a native chat-app media
 * viewer (X to close, download + overflow menu top-right, arrow nav between
 * siblings). Only IMAGE/VIDEO ever reach this modal (see resolveOpenAction
 * in page.js); everything else opens in a new tab instead. Videos start
 * paused with a tap-to-play overlay rather than autoplaying, matching the
 * reference interaction. */
function FilePreviewModal({ open, onOpenChange, file, files = [], onFileAction }) {
  const mediaItems = useMemo(
    () => files.filter((f) => f.fileType === "IMAGE" || f.fileType === "VIDEO"),
    [files]
  )
  const startIndex = Math.max(
    0,
    mediaItems.findIndex((f) => f.id === file?.id)
  )
  const [index, setIndex] = useState(startIndex)
  const [url, setUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (open) setIndex(startIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset
    // when the modal opens or the clicked file changes, not on every index
  }, [open, file?.id])

  // If the active item is archived/deleted out from under an open preview
  // (e.g. via the overflow menu), mediaItems shrinks — close rather than
  // show a stale file.
  useEffect(() => {
    if (open && mediaItems.length === 0) onOpenChange?.(false)
  }, [open, mediaItems.length, onOpenChange])

  const activeFile = mediaItems[Math.min(index, mediaItems.length - 1)] || file

  useEffect(() => {
    if (!open || !activeFile) return
    let cancelled = false
    setUrl(null)
    setIsPlaying(false)
    setIsLoading(true)
    const controller = new AbortController()

    fileStorageService
      .getDownloadUrl(activeFile.id, { signal: controller.signal })
      .then((data) => {
        if (!cancelled) setUrl(data?.url || null)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, activeFile])

  function goTo(nextIndex) {
    if (nextIndex < 0 || nextIndex >= mediaItems.length) return
    setIndex(nextIndex)
  }

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event) {
      if (event.key === "ArrowLeft") goTo(index - 1)
      if (event.key === "ArrowRight") goTo(index + 1)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- goTo is stable
    // per render and only needs index/open/mediaItems.length as deps
  }, [open, index, mediaItems.length])

  if (!activeFile) return null

  const hasPrev = index > 0
  const hasNext = index < mediaItems.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90" />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className="fixed inset-0 z-50 flex flex-col outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          <div className="flex items-center justify-between p-4">
            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 hover:text-white"
                />
              }
            >
              <X className="size-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>

            <p className="min-w-0 flex-1 truncate px-3 text-center text-sm text-white/90">
              {activeFile.name}
            </p>

            <div className="relative flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => onFileAction?.("download", activeFile)}
              >
                <Download className="size-5" />
                <span className="sr-only">Download</span>
              </Button>
              {onFileAction && (
                <GridItemMenu
                  items={GRID_FILE_MENU_ITEMS}
                  onAction={(action) => onFileAction(action, activeFile)}
                  className="static opacity-100 text-white hover:text-white/80"
                />
              )}
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
            {hasPrev && (
              <Button
                variant="ghost"
                size="icon-lg"
                className="absolute left-2 z-10 text-white hover:bg-white/10 hover:text-white sm:left-4"
                onClick={() => goTo(index - 1)}
              >
                <ChevronLeft className="size-6" />
                <span className="sr-only">Previous</span>
              </Button>
            )}

            {isLoading || !url ? (
              <Loader2 className="size-8 animate-spin text-white/70" />
            ) : activeFile.fileType === "IMAGE" ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed
              // URL is short-lived/opaque and not a static asset next/image
              // can optimize
              <img
                src={url}
                alt={activeFile.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : isPlaying ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption --
              // captions aren't available for arbitrary user-uploaded files
              <video
                src={url}
                controls
                autoPlay
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onContextMenu={(event) => event.preventDefault()}
                className="max-h-full max-w-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group relative flex max-h-full max-w-full items-center justify-center"
              >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption --
                    muted poster frame only; playback happens via the
                    controls-enabled <video> above once isPlaying is true */}
                <video
                  src={url}
                  muted
                  className="max-h-full max-w-full object-contain"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform group-hover:scale-105">
                    <Play className="size-7 fill-current pl-0.5" />
                  </span>
                </span>
              </button>
            )}

            {hasNext && (
              <Button
                variant="ghost"
                size="icon-lg"
                className="absolute right-2 z-10 text-white hover:bg-white/10 hover:text-white sm:right-4"
                onClick={() => goTo(index + 1)}
              >
                <ChevronRight className="size-6" />
                <span className="sr-only">Next</span>
              </Button>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}

export { FilePreviewModal }
export default FilePreviewModal
