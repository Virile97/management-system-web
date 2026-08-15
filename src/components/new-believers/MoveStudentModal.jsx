"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight, ArrowRightLeft, X } from "lucide-react"

const STATUS_OPTIONS = [
  { value: "ON_TRACK", label: "On Track" },
  { value: "BEHIND", label: "Behind" },
  { value: "ADVANCED", label: "Advanced" },
]

function resolveDefaultLessonId(student, lessons) {
  if (!student || !lessons?.length) return ""
  const currentNumber = Number(student.currentLesson)
  const next = lessons.find(
    (lesson) => Number(lesson.number) === currentNumber + 1
  )
  if (next?.id) return next.id
  const current = lessons.find((lesson) => lesson.id === student.lessonId)
  return current?.id || lessons[0]?.id || ""
}

function MoveStudentModal({
  open,
  onOpenChange,
  student,
  lessons = [],
  onConfirm,
}) {
  const [lessonId, setLessonId] = useState("")
  const [status, setStatus] = useState("ON_TRACK")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const orderedLessons = useMemo(
    () =>
      [...(lessons || [])].sort(
        (a, b) => Number(a.number) - Number(b.number)
      ),
    [lessons]
  )

  const selectedLesson = useMemo(
    () => orderedLessons.find((lesson) => lesson.id === lessonId) || null,
    [orderedLessons, lessonId]
  )

  const initialStatus = student?.status || "ON_TRACK"
  const lessonChanged = Boolean(
    student?.lessonId && lessonId && lessonId !== student.lessonId
  )
  const statusChanged = status !== initialStatus
  const canSubmit = Boolean(lessonId) && (lessonChanged || statusChanged)

  useEffect(() => {
    if (!open || !student) return
    setLessonId(resolveDefaultLessonId(student, orderedLessons))
    setStatus(student.status || "ON_TRACK")
    setNote("")
    setError("")
    setIsSubmitting(false)
  }, [open, student, orderedLessons])

  async function handleConfirm() {
    if (isSubmitting || !student) return
    if (!lessonId) {
      setError("Choose a lesson")
      return
    }
    if (!canSubmit) {
      setError("Pick a different lesson or status")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      await onConfirm?.({
        enrollmentId: student.id,
        lessonId,
        status,
        note: note.trim() || null,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to move student")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(40rem,calc(100vh-2rem))] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 flex-row items-center justify-between gap-0 rounded-t-xl bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <ArrowRightLeft className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Move Student
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="rounded-xl border border-border bg-muted/40 px-3 py-3">
            <p className="text-sm font-medium text-foreground/85">
              {student?.name || "Student"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-background px-2.5 py-1 ring-1 ring-border">
                Lesson {student?.currentLesson}: {student?.lessonTitle}
              </span>
              {selectedLesson ? (
                <>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  <span className="rounded-full bg-[#1e2a4a] px-2.5 py-1 text-white">
                    Lesson {selectedLesson.number}: {selectedLesson.title}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Move to lesson</Label>
            <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-border p-1.5">
              {orderedLessons.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No lessons available.
                </p>
              ) : (
                orderedLessons.map((lesson) => {
                  const isCurrent = lesson.id === student?.lessonId
                  const isSelected = lesson.id === lessonId

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setLessonId(lesson.id)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        isSelected
                          ? "bg-[#1e2a4a] text-white"
                          : "hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full text-[11px] font-semibold",
                          isSelected
                            ? "bg-white/15 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {lesson.number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {lesson.title}
                        </span>
                        {isCurrent ? (
                          <span
                            className={cn(
                              "text-[11px]",
                              isSelected
                                ? "text-white/70"
                                : "text-muted-foreground"
                            )}
                          >
                            Current lesson
                          </span>
                        ) : null}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Status after move</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                    status === option.value
                      ? "bg-[#1e2a4a] text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nbc-move-note">Note (optional)</Label>
            <textarea
              id="nbc-move-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              placeholder="e.g. Completed lesson 4, advancing to lesson 5"
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
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Moving…" : "Confirm Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { MoveStudentModal }
export default MoveStudentModal
