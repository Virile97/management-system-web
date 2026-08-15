"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { getCurrentUser } from "@/lib/auth"
import {
  getNewBelieversOverview,
  createNbcLesson,
  moveNbcEnrollment,
  createNbcEnrollment,
  updateNbcEnrollment,
} from "@/services/newBelievers.service"
import { NbcStatsCards } from "@/components/new-believers/NbcStatsCards"
import { NbcSectionTabs } from "@/components/new-believers/NbcSectionTabs"
import { NbcMyClassTab } from "@/components/new-believers/NbcMyClassTab"
import { NbcLessonsTab } from "@/components/new-believers/NbcLessonsTab"
import { NbcAssignmentsTab } from "@/components/new-believers/NbcAssignmentsTab"
import { NbcAvatar } from "@/components/new-believers/NbcPrimitives"
import { NbcPageSkeleton } from "@/components/new-believers/NbcSkeletons"
import { AddLessonModal } from "@/components/new-believers/AddLessonModal"
import { MoveStudentModal } from "@/components/new-believers/MoveStudentModal"
import { AssignEnrollmentModal } from "@/components/new-believers/AssignEnrollmentModal"
import {
  NBC_ENROLLMENT_STATUS,
  NBC_STATUS_FILTERS,
} from "@/components/new-believers/nbc.constants"

const TEACHER_DEFAULT_SECTION = "my-class"
const ADMIN_DEFAULT_SECTION = "lessons"
const VALID_SECTIONS = new Set(["my-class", "lessons", "assignments"])
const VALID_STATUS = new Set([
  "all",
  ...NBC_STATUS_FILTERS.filter((f) => f.key !== "all").map((f) => f.key),
])

const EMPTY_OVERVIEW = {
  stats: {
    totalLessons: 0,
    totalStudents: 0,
    myStudents: 0,
    needAttention: 0,
    unassigned: 0,
  },
  currentTeacher: null,
  myStudents: [],
  teachingLessons: [],
  lessons: [],
  teachers: [],
  teacherOptions: [],
  assignments: [],
  assignableStudents: [],
}

export default function NewBelieversPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background px-3 py-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <NbcPageSkeleton />
          </div>
        </div>
      }
    >
      <NewBelieversPageContent />
    </Suspense>
  )
}

function NewBelieversPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [overview, setOverview] = useState(EMPTY_OVERVIEW)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const [addLessonOpen, setAddLessonOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [moveStudent, setMoveStudent] = useState(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const isAdmin = user?.role === "ADMIN"
  const defaultSection = isAdmin
    ? ADMIN_DEFAULT_SECTION
    : TEACHER_DEFAULT_SECTION

  const loadOverview = useCallback(async (signal) => {
    setIsLoading(true)
    setError("")
    try {
      const data = await getNewBelieversOverview(signal)
      if (!signal?.aborted) setOverview(data || EMPTY_OVERVIEW)
    } catch (err) {
      if (signal?.aborted || err?.name === "AbortError") return
      setError(err?.message || "Unable to load New Believers Class")
      setOverview(EMPTY_OVERVIEW)
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadOverview(controller.signal)
    return () => controller.abort()
  }, [loadOverview, refreshKey])

  const rawSection = searchParams.get("section")
  // Legacy bookmark: teachers → assignments
  const sectionParam =
    rawSection === "teachers" ? "assignments" : rawSection
  const requestedTab = VALID_SECTIONS.has(sectionParam)
    ? sectionParam
    : defaultSection

  let activeTab = requestedTab
  if (isAdmin && activeTab === "my-class") activeTab = ADMIN_DEFAULT_SECTION
  if (!isAdmin && activeTab === "assignments") {
    activeTab = TEACHER_DEFAULT_SECTION
  }

  useEffect(() => {
    if (user == null) return

    const params = new URLSearchParams(searchParams.toString())
    let changed = false

    if (rawSection === "teachers") {
      params.set("section", "assignments")
      changed = true
    }

    if (user.role === "ADMIN" && sectionParam === "my-class") {
      params.set("section", ADMIN_DEFAULT_SECTION)
      params.delete("status")
      changed = true
    } else if (
      user.role !== "ADMIN" &&
      (sectionParam === "assignments" || rawSection === "teachers")
    ) {
      params.delete("section")
      changed = true
    }

    if (!changed) return

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }, [user, sectionParam, rawSection, searchParams, pathname, router])

  const statusParam = searchParams.get("status") || "all"
  const statusFilter = VALID_STATUS.has(statusParam) ? statusParam : "all"

  const lessonParam = Number(searchParams.get("lesson"))
  const selectedLesson =
    Number.isInteger(lessonParam) && lessonParam >= 1 ? lessonParam : null

  const teacher = overview.currentTeacher
  const displayName =
    user?.name || teacher?.shortName || teacher?.name || "Teacher"
  const initials = displayName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")

  const nextSortOrder = useMemo(() => {
    const max = (overview.lessons || []).reduce(
      (acc, lesson) => Math.max(acc, Number(lesson.number) || 0),
      0
    )
    return max + 1
  }, [overview.lessons])

  function updateParams(patch) {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(patch)) {
      if (
        value == null ||
        value === "" ||
        (key === "section" && value === defaultSection) ||
        (key === "status" && value === "all")
      ) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function setActiveTab(next) {
    if (next === "assignments" && !isAdmin) return
    if (next === "my-class" && isAdmin) return
    updateParams({
      section: next,
      ...(next !== "lessons" ? { lesson: null } : {}),
      ...(next !== "my-class" ? { status: null } : {}),
    })
  }

  function openLesson(number) {
    updateParams({ section: "lessons", lesson: number, status: null })
  }

  function handleStatClick(action) {
    if (action === "lessons") {
      updateParams({ section: "lessons", status: null })
      return
    }
    if (action === "assignments") {
      if (!isAdmin) return
      updateParams({ section: "assignments", lesson: null, status: null })
      return
    }
    if (action === "my-class") {
      if (isAdmin) return
      updateParams({ section: "my-class", lesson: null, status: null })
      return
    }
    if (action === "attention") {
      if (isAdmin) return
      updateParams({
        section: "my-class",
        status: NBC_ENROLLMENT_STATUS.BEHIND,
        lesson: null,
      })
    }
  }

  async function handleCreateLesson(payload) {
    await createNbcLesson(payload)
    toast.success("Lesson added")
    setRefreshKey((key) => key + 1)
  }

  async function handleAssignStudent(payload) {
    await createNbcEnrollment(payload)
    toast.success("Student assigned")
    setRefreshKey((key) => key + 1)
  }

  async function handleReassignTeacher(enrollmentId, teacherId) {
    try {
      await updateNbcEnrollment(enrollmentId, { teacherId })
      toast.success("Teacher reassigned")
      setRefreshKey((key) => key + 1)
    } catch (err) {
      toast.error(err?.message || "Unable to reassign teacher")
    }
  }

  async function handleMoveStudent(payload) {
    await moveNbcEnrollment(payload.enrollmentId, {
      lessonId: payload.lessonId,
      status: payload.status,
      note: payload.note,
    })
    toast.success("Student moved")
    setRefreshKey((key) => key + 1)
  }

  const roleLabel = isAdmin ? "Admin" : teacher?.role || "Teacher"

  return (
    <div className="bg-background px-3 py-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-normal text-foreground/85 sm:text-3xl">
              New Believers Class
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Foundation course for every new convert
            </p>
          </div>

          <div className="flex max-w-full items-center gap-2 self-start rounded-full border border-border bg-card py-1.5 pr-3 pl-1.5">
            <NbcAvatar initials={initials} className="h-8 w-8 text-[10px]" />
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground">
                Logged in as{" "}
                <span className="font-medium text-foreground/80">
                  {displayName}
                </span>
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
              {roleLabel}
            </span>
          </div>
        </div>

        {error ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : null}

        {isLoading || user == null ? (
          <div className="mt-5 sm:mt-6">
            <NbcPageSkeleton isAdmin={isAdmin} />
          </div>
        ) : (
          <>
            <div className="mt-5 sm:mt-6">
              <NbcStatsCards
                stats={overview.stats}
                onStatClick={handleStatClick}
                isAdmin={isAdmin}
              />
              <p className="mt-2 text-[11px] text-muted-foreground">
                Teachers come from the New Believers Teachers ministry. Only
                unassigned members marked as new believers can be assigned.
              </p>
            </div>

            <div className="sticky top-0 z-10 -mx-3 mt-4 border-b border-border/60 bg-background px-3 py-3 sm:-mx-0 sm:mt-6 sm:px-0">
              <NbcSectionTabs
                active={activeTab}
                onChange={setActiveTab}
                isAdmin={isAdmin}
              />
            </div>

            <div className="mt-4 sm:mt-5">
              {!isAdmin && activeTab === "my-class" ? (
                <NbcMyClassTab
                  teachingLessons={overview.teachingLessons}
                  students={overview.myStudents}
                  lessonCount={overview.stats.totalLessons || 12}
                  statusFilter={statusFilter}
                  onStatusFilterChange={(status) => updateParams({ status })}
                  onOpenLesson={openLesson}
                  onMoveStudent={setMoveStudent}
                />
              ) : null}

              {activeTab === "lessons" ? (
                <NbcLessonsTab
                  lessons={overview.lessons}
                  selectedLesson={selectedLesson}
                  onSelectLesson={(lesson) =>
                    updateParams({ lesson, section: "lessons" })
                  }
                  isAdmin={isAdmin}
                  onAddLesson={() => setAddLessonOpen(true)}
                />
              ) : null}

              {activeTab === "assignments" && isAdmin ? (
                <NbcAssignmentsTab
                  assignments={overview.assignments}
                  teachers={overview.teacherOptions}
                  onAssign={() => setAssignOpen(true)}
                  onOpenLesson={openLesson}
                  onReassignTeacher={handleReassignTeacher}
                />
              ) : null}
            </div>
          </>
        )}
      </div>

      <AddLessonModal
        open={addLessonOpen}
        onOpenChange={setAddLessonOpen}
        nextSortOrder={nextSortOrder}
        onConfirm={handleCreateLesson}
      />

      <AssignEnrollmentModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        suggestions={overview.assignableStudents}
        teachers={overview.teacherOptions}
        lessons={overview.lessons}
        onConfirm={handleAssignStudent}
      />

      <MoveStudentModal
        open={Boolean(moveStudent)}
        onOpenChange={(open) => {
          if (!open) setMoveStudent(null)
        }}
        student={moveStudent}
        lessons={overview.lessons}
        onConfirm={handleMoveStudent}
      />
    </div>
  )
}
