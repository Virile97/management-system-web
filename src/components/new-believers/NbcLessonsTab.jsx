"use client"

import { useEffect, useMemo, useRef } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronDown, Plus, Users } from "lucide-react"
import {
  NbcAvatar,
  NbcStatusBadge,
} from "@/components/new-believers/NbcPrimitives"
import { NBC_ENROLLMENT_STATUS } from "@/components/new-believers/nbc.constants"

function NbcLessonsTab({
  lessons = [],
  selectedLesson,
  onSelectLesson,
  isAdmin = false,
  onAddLesson,
}) {
  const selectedRef = useRef(null)

  const summary = useMemo(() => {
    const withStudents = lessons.filter((lesson) => lesson.studentCount > 0)
    const behindCount = lessons.reduce(
      (sum, lesson) =>
        sum +
        lesson.students.filter(
          (student) => student.status === NBC_ENROLLMENT_STATUS.BEHIND
        ).length,
      0
    )
    return {
      withStudents: withStudents.length,
      behindCount,
    }
  }, [lessons])

  useEffect(() => {
    if (selectedLesson == null || !selectedRef.current) return
    selectedRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [selectedLesson])

  function handleSelect(number) {
    onSelectLesson?.(selectedLesson === number ? null : number)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground/80">Course lessons</p>
          <p className="text-xs text-muted-foreground">
            Tap a lesson to see who is currently on it
            {summary.withStudents
              ? ` · ${summary.withStudents} active`
              : ""}
            {summary.behindCount
              ? ` · ${summary.behindCount} behind`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          {selectedLesson != null ? (
            <button
              type="button"
              onClick={() => onSelectLesson?.(null)}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Clear selection
            </button>
          ) : null}
          {isAdmin ? (
            <button
              type="button"
              onClick={onAddLesson}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1e2a4a] px-3 text-xs font-medium text-white hover:bg-[#1e2a4a]/90"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Lesson
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const isSelected = selectedLesson === lesson.number
          const hasStudents = lesson.studentCount > 0
          const behindOnLesson = lesson.students.some(
            (student) => student.status === NBC_ENROLLMENT_STATUS.BEHIND
          )

          return (
            <div
              key={lesson.number}
              ref={isSelected ? selectedRef : null}
              className="min-w-0"
            >
              <Card
                role="button"
                tabIndex={0}
                aria-expanded={isSelected}
                aria-pressed={isSelected}
                onClick={() => handleSelect(lesson.number)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleSelect(lesson.number)
                  }
                }}
                className={cn(
                  "group flex cursor-pointer flex-col rounded-2xl p-4 sm:p-5 outline-none transition-[box-shadow,background-color,transform]",
                  "hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-[#1e2a4a]/35",
                  isSelected
                    ? "bg-card shadow-md ring-2 ring-[#1e2a4a] dark:ring-white/45"
                    : "hover:shadow-sm",
                  !hasStudents && !isSelected && "opacity-80"
                )}
              >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    Lesson {lesson.number}
                  </span>
                  {behindOnLesson ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-500/15 dark:text-red-400">
                      Needs attention
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                      hasStudents
                        ? "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Users className="h-3 w-3" />
                    {lesson.studentCount}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isSelected && "rotate-180 text-foreground/70"
                    )}
                  />
                </div>
              </div>

              <h3 className="mt-3 font-heading text-base font-normal text-foreground/85 sm:text-lg">
                {lesson.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {lesson.description}
              </p>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isSelected ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                      Currently on this lesson
                    </p>

                    {!hasStudents ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        No students on this lesson yet.
                      </p>
                    ) : (
                      <ul className="mt-2 flex flex-col gap-2">
                        {lesson.students.map((student) => (
                          <li
                            key={student.id}
                            className="flex items-center justify-between gap-2 rounded-xl bg-muted/50 px-2.5 py-2"
                          >
                            <div className="flex min-w-0 items-center gap-2.5">
                              <NbcAvatar
                                initials={student.initials}
                                className="h-8 w-8 text-[10px]"
                              />
                              <span className="truncate text-sm text-foreground/85">
                                {student.name}
                              </span>
                            </div>
                            <NbcStatusBadge status={student.status} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { NbcLessonsTab }
export default NbcLessonsTab
