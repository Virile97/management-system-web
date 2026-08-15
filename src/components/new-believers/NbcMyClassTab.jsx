"use client"

import { useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BookOpen, Search, Users, X, ArrowRightLeft } from "lucide-react"
import {
  NbcAvatar,
  NbcProgressBar,
  NbcStatusBadge,
} from "@/components/new-believers/NbcPrimitives"
import {
  NBC_ENROLLMENT_STATUS,
  NBC_STATUS_FILTERS,
  NBC_STATUS_RANK,
} from "@/components/new-believers/nbc.constants"

function NbcMyClassTab({
  teachingLessons = [],
  students = [],
  lessonCount = 12,
  statusFilter = "all",
  onStatusFilterChange,
  onOpenLesson,
  onMoveStudent,
}) {
  const [query, setQuery] = useState("")

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase()
    return students
      .filter((student) => {
        if (statusFilter !== "all" && student.status !== statusFilter) {
          return false
        }
        if (!q) return true
        return (
          student.name.toLowerCase().includes(q) ||
          student.lessonTitle.toLowerCase().includes(q) ||
          String(student.currentLesson).includes(q)
        )
      })
      .sort((a, b) => {
        const byStatus =
          (NBC_STATUS_RANK[a.status] ?? 9) - (NBC_STATUS_RANK[b.status] ?? 9)
        if (byStatus !== 0) return byStatus
        return a.name.localeCompare(b.name)
      })
  }, [students, query, statusFilter])

  const behindCount = students.filter(
    (s) => s.status === NBC_ENROLLMENT_STATUS.BEHIND
  ).length

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card className="rounded-2xl p-4 sm:p-6">
        <CardHeader className="flex-row items-center justify-between gap-2 px-0 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="font-heading text-base font-normal text-foreground/80">
              Lessons I&apos;m Teaching
            </CardTitle>
          </div>
          {teachingLessons.length > 0 ? (
            <span className="text-xs text-muted-foreground">
              Tap to open in Lessons
            </span>
          ) : null}
        </CardHeader>
        <CardContent className="px-0">
          {teachingLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active lessons assigned yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teachingLessons.map((lesson) => (
                <button
                  key={lesson.number}
                  type="button"
                  onClick={() => onOpenLesson?.(lesson.number)}
                  className="inline-flex max-w-full items-center rounded-full bg-[#1e2a4a] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 dark:bg-white/10"
                >
                  <span className="truncate">
                    Lesson {lesson.number} — {lesson.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl p-4 sm:p-6">
        <CardHeader className="flex flex-col gap-3 px-0 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="font-heading text-base font-normal text-foreground/80">
              My Students
            </CardTitle>
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
              {students.length}
            </span>
            {behindCount > 0 ? (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
                {behindCount} behind
              </span>
            ) : null}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students…"
              className={cn(
                "h-9 rounded-lg bg-background pl-9 text-sm",
                query && "pr-9"
              )}
              aria-label="Search my students"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </CardHeader>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {NBC_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onStatusFilterChange?.(filter.key)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === filter.key
                  ? "bg-[#1e2a4a] text-white dark:bg-white/15"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <CardContent className="px-0">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students assigned to you yet.
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="rounded-xl bg-muted/50 px-3 py-8 text-center text-sm text-muted-foreground">
              No students match this filter.
            </p>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(0,1.3fr)_5rem_minmax(0,1.1fr)_minmax(6.5rem,0.85fr)_5rem_4.5rem] gap-3 border-b border-border pb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase md:grid">
                <span>Student</span>
                <span>Current</span>
                <span>Lesson Title</span>
                <span>Progress</span>
                <span className="text-right">Status</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y divide-border">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={cn(
                      "flex flex-col gap-3 py-4 first:pt-3 last:pb-0 md:grid md:grid-cols-[minmax(0,1.3fr)_5rem_minmax(0,1.1fr)_minmax(6.5rem,0.85fr)_5rem_4.5rem] md:items-center md:gap-3",
                      student.status === NBC_ENROLLMENT_STATUS.BEHIND &&
                        "bg-red-50/40 dark:bg-red-500/5"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <NbcAvatar initials={student.initials} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground/85">
                          {student.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenLesson?.(student.currentLesson)}
                          className="text-left text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline md:hidden"
                        >
                          Lesson {student.currentLesson} / {lessonCount} ·{" "}
                          {student.lessonTitle}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenLesson?.(student.currentLesson)}
                      className="hidden text-left text-sm font-medium tabular-nums text-foreground/80 underline-offset-2 hover:underline md:block"
                    >
                      {student.currentLesson} / {lessonCount}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenLesson?.(student.currentLesson)}
                      className="hidden truncate text-left text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline md:block"
                    >
                      {student.lessonTitle}
                    </button>

                    <NbcProgressBar value={student.progress} />

                    <div className="flex md:justify-end">
                      <NbcStatusBadge status={student.status} />
                    </div>

                    <div className="flex md:justify-end">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onMoveStudent?.(student)
                        }}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Move
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { NbcMyClassTab }
export default NbcMyClassTab
