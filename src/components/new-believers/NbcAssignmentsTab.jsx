"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, X } from "lucide-react"
import {
  NbcAvatar,
  NbcProgressBar,
  NbcStatusBadge,
} from "@/components/new-believers/NbcPrimitives"

function NbcAssignmentsTab({
  assignments = [],
  onAssign,
  onOpenLesson,
  onReassignTeacher,
  teachers = [],
}) {
  const [query, setQuery] = useState("")
  const [reassignId, setReassignId] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...assignments]
      .filter((row) => {
        if (!q) return true
        return (
          row.name.toLowerCase().includes(q) ||
          row.teacherName.toLowerCase().includes(q) ||
          row.lessonTitle.toLowerCase().includes(q) ||
          String(row.currentLesson).includes(q)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [assignments, query])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search assignments…"
            className="h-10 rounded-lg border-border bg-card pl-9 pr-9"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <Button
          type="button"
          className="h-10 shrink-0 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
          onClick={() => onAssign?.()}
        >
          <Plus className="h-4 w-4" />
          Assign Student
        </Button>
      </div>

      <Card className="rounded-2xl p-0 sm:p-0">
        <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
          <CardTitle className="font-heading text-base font-normal text-foreground/85">
            {filtered.length}{" "}
            {filtered.length === 1 ? "assignment" : "assignments"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Student · teacher · current lesson
          </p>
        </CardHeader>

        <CardContent className="px-0 py-0">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground sm:px-6">
              {assignments.length === 0
                ? "No assignments yet. Search a member to assign them to a teacher."
                : "No matches for that search."}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filtered.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <NbcAvatar initials={row.initials} />
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium text-foreground/85">
                        {row.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {row.teacherName}
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenLesson?.(row.currentLesson)}
                        className="truncate text-left text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                      >
                        Lesson {row.currentLesson}: {row.lessonTitle}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-12 sm:justify-end sm:pl-0">
                    <NbcProgressBar
                      value={row.progress}
                      className="min-w-[7rem] flex-1 sm:w-36 sm:flex-none"
                    />
                    <NbcStatusBadge status={row.status} />

                    {onReassignTeacher && teachers.length > 0 ? (
                      reassignId === row.id ? (
                        <Select
                          value={row.teacherId}
                          onValueChange={async (nextTeacherId) => {
                            setReassignId(null)
                            if (nextTeacherId === row.teacherId) return
                            await onReassignTeacher?.(row.id, nextTeacherId)
                          }}
                        >
                          <SelectTrigger className="h-8 w-[9.5rem] rounded-lg text-xs">
                            <SelectValue>
                              {(val) =>
                                teachers.find((t) => t.id === val)?.name ||
                                "Teacher"
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
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-lg px-2.5 text-xs"
                          onClick={() => setReassignId(row.id)}
                        >
                          Reassign
                        </Button>
                      )
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { NbcAssignmentsTab }
export default NbcAssignmentsTab
