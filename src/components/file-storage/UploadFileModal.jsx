"use client"

import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UploadCloud, X, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  UPLOAD_MENU_ITEMS,
  MAX_UPLOAD_MB,
  ALLOWED_UPLOAD_MIME_TYPES,
  formatBytes,
} from "./file-storage.constants"

function UploadFileModal({
  open,
  onOpenChange,
  initialType,
  initialFile,
  currentFolderId,
  onConfirm,
}) {
  const [file, setFile] = useState(null)
  const [tags, setTags] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  // Drag-depth counter, not a boolean — dragenter/dragleave fire on every
  // nested child element too, so a boolean flickers when the cursor crosses
  // an inner element's border while still inside the dropzone.
  const [dragDepth, setDragDepth] = useState(0)
  const inputRef = useRef(null)

  const menuItem = UPLOAD_MENU_ITEMS.find((item) => item.type === initialType)
  const accept = menuItem?.accept

  useEffect(() => {
    if (!open) return
    setFile(initialFile || null)
    setTags("")
    setError("")
    setIsSubmitting(false)
    setDragDepth(0)
  }, [open, initialFile])

  function validateFile(candidate) {
    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(candidate.type)) {
      return `File type "${candidate.type || "unknown"}" is not allowed`
    }
    if (candidate.size > MAX_UPLOAD_MB * 1024 * 1024) {
      return `File exceeds the ${MAX_UPLOAD_MB}MB limit`
    }
    return ""
  }

  function selectFile(candidate) {
    if (!candidate) return
    const validationError = validateFile(candidate)
    if (validationError) {
      setError(validationError)
      return
    }
    setError("")
    setFile(candidate)
  }

  function handleInputChange(event) {
    selectFile(event.target.files?.[0])
  }

  function handleDragEnter(event) {
    event.preventDefault()
    event.stopPropagation()
    setDragDepth((depth) => depth + 1)
  }

  function handleDragLeave(event) {
    event.preventDefault()
    event.stopPropagation()
    setDragDepth((depth) => Math.max(0, depth - 1))
  }

  function handleDragOver(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  function handleDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    setDragDepth(0)
    selectFile(event.dataTransfer?.files?.[0])
  }

  async function handleConfirm() {
    if (isSubmitting) return
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
      await onConfirm?.({ file, folderId: currentFolderId, tags: tagList })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to upload file")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-w-md flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Upload File
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6">
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
              dragDepth > 0
                ? "border-[#1e2a4a] bg-[#1e2a4a]/5 dark:border-amber-400 dark:bg-amber-400/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
            />

            {file ? (
              <>
                <FileIcon className="h-6 w-6 text-muted-foreground" />
                <p className="max-w-full truncate text-sm font-medium text-foreground/90">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    setFile(null)
                    if (inputRef.current) inputRef.current.value = ""
                  }}
                  className="mt-1 text-xs text-muted-foreground underline"
                >
                  Choose a different file
                </button>
              </>
            ) : (
              <>
                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-foreground/80">
                  Drag and drop a file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Up to {MAX_UPLOAD_MB}MB
                </p>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="upload-tags">Tags</Label>
            <Input
              id="upload-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="e.g. sermon, worship (comma-separated)"
              className="h-10 rounded-lg"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="mx-0 mb-0 gap-2 rounded-none border-t border-border bg-background px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-lg bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { UploadFileModal }
export default UploadFileModal
