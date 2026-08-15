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
import { BookOpen, X } from "lucide-react"

function AddLessonModal({ open, onOpenChange, nextSortOrder = 1, onConfirm }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(String(nextSortOrder))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    setTitle("")
    setDescription("")
    setSortOrder(String(nextSortOrder))
    setError("")
    setIsSubmitting(false)
  }, [open, nextSortOrder])

  async function handleConfirm() {
    if (isSubmitting) return
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      await onConfirm?.({
        title: title.trim(),
        description: description.trim() || null,
        sortOrder: sortOrder ? Number(sortOrder) : undefined,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to create lesson")
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
            <BookOpen className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Add Lesson
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
            <Label htmlFor="nbc-lesson-number">Lesson number</Label>
            <Input
              id="nbc-lesson-number"
              type="number"
              min={1}
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="h-10 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nbc-lesson-title">Title</Label>
            <Input
              id="nbc-lesson-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Assurance of Salvation"
              className="h-10 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nbc-lesson-description">Description</Label>
            <textarea
              id="nbc-lesson-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="Short summary of the lesson"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1e2a4a]/30"
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
            {isSubmitting ? "Saving…" : "Add Lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddLessonModal }
export default AddLessonModal
