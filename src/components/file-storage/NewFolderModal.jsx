"use client"

import { useEffect, useState } from "react"
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
import { FolderPlus, X } from "lucide-react"

function NewFolderModal({ open, onOpenChange, onConfirm }) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setName("")
    setError("")
    setIsSubmitting(false)
  }, [open])

  async function handleConfirm() {
    if (isSubmitting) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Folder name is required")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      await onConfirm?.({ name: trimmedName })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to create folder")
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
            <FolderPlus className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              New Folder
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
          <div className="space-y-1.5">
            <Label htmlFor="new-folder-name">
              Folder name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="new-folder-name"
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Sermons"
              className="h-10 rounded-lg"
              onKeyDown={(event) => {
                if (event.key === "Enter") handleConfirm()
              }}
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
            {isSubmitting ? "Creating…" : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { NewFolderModal }
export default NewFolderModal
