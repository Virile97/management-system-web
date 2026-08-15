"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MemberSearchModal } from "@/components/finances/MemberPickerField"
import { searchAssignableStudents } from "@/services/newBelievers.service"
import { ClipboardList, Search, X } from "lucide-react"

function AssignEnrollmentModal({
  open,
  onOpenChange,
  suggestions = [],
  teachers = [],
  lessons = [],
  onConfirm,
}) {
  const [student, setStudent] = useState(null)
  const [teacherId, setTeacherId] = useState("")
  const [lessonId, setLessonId] = useState("")
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const orderedLessons = useMemo(
    () =>
      [...(lessons || [])].sort(
        (a, b) => Number(a.number) - Number(b.number)
      ),
    [lessons]
  )

  useEffect(() => {
    if (!open) return
    setStudent(null)
    setTeacherId(teachers[0]?.id || "")
    setLessonId(orderedLessons[0]?.id || "")
    setIsStudentPickerOpen(false)
    setError("")
    setIsSubmitting(false)
  }, [open, teachers, orderedLessons])

  function handleDialogOpenChange(nextOpen) {
    if (!nextOpen && isStudentPickerOpen) return
    onOpenChange(nextOpen)
  }

  function handleStudentSelect(next) {
    setError("")
    setStudent(next)
  }

  const canSubmit =
    Boolean(student?.id) && Boolean(teacherId) && Boolean(lessonId)

  async function handleConfirm() {
    if (isSubmitting || !canSubmit) return
    if (student.id === teacherId) {
      setError("Student and teacher must be different members")
      return
    }

    setIsSubmitting(true)
    setError("")
    try {
      await onConfirm?.({
        studentId: student.id,
        teacherId,
        lessonId,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || "Unable to assign student")
    } finally {
      setIsSubmitting(false)
    }
  }

  const searchStudents = useCallback(async (query, signal) => {
    return searchAssignableStudents({ search: query, limit: 20 }, signal)
  }, [])

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="flex max-w-md flex-col gap-0 overflow-hidden border border-border bg-card p-0 text-card-foreground shadow-lg sm:max-w-md"
          showCloseButton={false}
          onPointerDownOutside={(event) => {
            if (isStudentPickerOpen) event.preventDefault()
          }}
          onInteractOutside={(event) => {
            if (isStudentPickerOpen) event.preventDefault()
          }}
          onFocusOutside={(event) => {
            if (isStudentPickerOpen) event.preventDefault()
          }}
        >
          <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <ClipboardList className="h-5 w-5 text-white" />
              <DialogTitle className="font-heading text-lg font-normal text-white">
                Assign Student
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <div className="flex flex-col gap-5 px-4 py-5 sm:px-6">
            <div className="space-y-1.5">
              <Label>
                Student <span className="text-red-500">*</span>
              </Label>
              {student ? (
                <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-input bg-card px-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-sm text-foreground/85"
                    onClick={() => setIsStudentPickerOpen(true)}
                    disabled={isSubmitting}
                  >
                    {student.name}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setStudent(null)}
                    disabled={isSubmitting}
                    aria-label="Clear selected student"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsStudentPickerOpen(true)}
                  disabled={isSubmitting}
                  className="relative flex h-10 w-full items-center rounded-lg border border-input bg-card px-3 text-left text-sm text-muted-foreground hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Search className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">Search new believers…</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>
                Teacher <span className="text-red-500">*</span>
              </Label>
              <Select
                value={teacherId}
                onValueChange={setTeacherId}
                disabled={isSubmitting || teachers.length === 0}
              >
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue placeholder="Select teacher">
                    {(val) =>
                      teachers.find((teacher) => teacher.id === val)?.name ||
                      "Select teacher"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {teachers.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  Add members to the New Believers Teachers ministry first.
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>
                Starting lesson <span className="text-red-500">*</span>
              </Label>
              <Select
                value={lessonId}
                onValueChange={setLessonId}
                disabled={isSubmitting || orderedLessons.length === 0}
              >
                <SelectTrigger className="h-10 w-full rounded-lg">
                  <SelectValue placeholder="Select lesson">
                    {(val) => {
                      const lesson = orderedLessons.find((row) => row.id === val)
                      return lesson
                        ? `Lesson ${lesson.number}: ${lesson.title}`
                        : "Select lesson"
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {orderedLessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      Lesson {lesson.number}: {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              className="h-10 rounded-lg px-5"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
              onClick={handleConfirm}
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MemberSearchModal
        open={isStudentPickerOpen}
        onOpenChange={setIsStudentPickerOpen}
        onSelect={handleStudentSelect}
        title="Search New Believer"
        placeholder="Search by name or email…"
        emptyHint="Mark a member as a new believer to assign them here."
        noResultsHint="No unassigned new believers match that search."
        suggestions={suggestions}
        suggestionsLabel="Suggested"
        searchFn={searchStudents}
      />
    </>
  )
}

export { AssignEnrollmentModal }
export default AssignEnrollmentModal
