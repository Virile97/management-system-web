"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCardSkeleton, ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { AttendanceStatsCards } from "@/components/attendance/AttendanceStatsCards"
import { AttendanceGroupTabs } from "@/components/attendance/AttendanceGroupTabs"
import { AttendanceTable } from "@/components/attendance/AttendanceTable"
import { listAttendance, upsertAttendance, toAttendanceDateTime } from "@/services/attendance.service"
import { useAttendanceStore } from "@/stores/attendance.store"
import { ExportAttendanceReportModal } from "@/components/attendance/ExportAttendanceReportModal"
import { useDebounce } from "@/hooks/use-debounce"
import { toDateInputValue } from "@/utils/helpers"
import { register as registerAbortController } from "@/lib/abort-registry"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Download, Search, X, Calendar } from "lucide-react"

const PAGE_SIZE = 20
const DEFAULT_LEVEL = "All"

export default function AttendancePage() {
  return (
    <Suspense fallback={null}>
      <AttendancePageContent />
    </Suspense>
  )
}

function queriesMatch(a, b) {
  return (
    a.date === b.date &&
    a.level === b.level &&
    a.search === b.search &&
    a.page === b.page
  )
}

function AttendancePageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const today = toDateInputValue()
  const date = searchParams.get("date") || today
  const activeLevel = searchParams.get("level") || DEFAULT_LEVEL
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const {
    items,
    summary,
    levels,
    meta,
    query,
    setAttendance,
    cacheItems,
    getCachedItems,
  } = useAttendanceStore(
    useShallow((state) => ({
      items: state.items,
      summary: state.summary,
      levels: state.levels,
      meta: state.meta,
      query: state.query,
      setAttendance: state.setAttendance,
      cacheItems: state.cacheItems,
      getCachedItems: state.getCachedItems,
    }))
  )

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const isFirstRun = useRef(true)

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)
  
    for (const [key, value] of Object.entries(updates)) {
      const isDefault =
        !value ||
        (key === "level" && value === DEFAULT_LEVEL) ||
        (key === "page" && Number(value) <= 1) ||
        (key === "date" && value === today)
  
      isDefault ? params.delete(key) : params.set(key, String(value))
    }
  
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
  }

  /**
   * Search fast-path: filter rows already cached for this date (and level).
   * Returns null when nothing matches so the caller can fall through to the API.
   */
  function searchCache(needle, level) {
    const trimmed = needle.trim().toLowerCase()
    if (!trimmed) return null

    const matches = []
    for (const item of getCachedItems(date)) {
      if (level !== DEFAULT_LEVEL && item.level !== level) continue
      if (String(item.name || "").toLowerCase().includes(trimmed)) {
        matches.push(item)
      }
    }

    return matches.length > 0 ? matches : null
  }

  useEffect(() => {
    const currentQuery = {
      date,
      level: activeLevel,
      search: debouncedSearch,
      page,
    }
  
    if (isFirstRun.current) {
      isFirstRun.current = false
  
      if (query && items.length && queriesMatch(query, currentQuery)) {
        setIsLoading(false)
        setError("")
        return
      }
    }
  
    const controller = new AbortController()
    const unregister = registerAbortController(controller)
  
    const load = async () => {
      const search = debouncedSearch.trim()
  
      if (search) {
        const cached = searchCache(search, activeLevel)
  
        if (cached) {
          setAttendance(
            cached,
            { page: 1, limit: PAGE_SIZE, total: cached.length, totalPages: 1 },
            currentQuery
          )
          setIsLoading(false)
          setError("")
          return
        }
      }
  
      setIsLoading(true)
      setError("")
  
      try {
        const response = await listAttendance(
          {
            date,
            level: activeLevel === DEFAULT_LEVEL ? "" : activeLevel,
            search: debouncedSearch,
            page,
            limit: PAGE_SIZE,
          },
          controller.signal
        )
  
        if (controller.signal.aborted) return
  
        if (page > 1 && page > response.meta.totalPages) {
          updateParams({ page: Math.max(1, response.meta.totalPages) })
          return
        }
  
        cacheItems(response.items, date)
  
        setAttendance(response.items, response.meta, currentQuery, {
          summary: response.summary,
          levels: response.levels,
        })
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err?.message || "Unable to load attendance")
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
  
    load()
  
    return () => {
      controller.abort()
      unregister()
    }
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, activeLevel, debouncedSearch, page, refreshKey])

  function handleLevelChange(level) {
    updateParams({ level, page: 1 })
  }

  function handleSearchChange(value) {
    setSearch(value)
    if (page > 1) updateParams({ page: 1 })
  }

  function handleDateChange(value) {
    updateParams({ date: value || today, page: 1 })
  }

  async function handleSlotChange(memberId, field, nextDisplayTime) {
    const payload = {
      date,
      [field]: nextDisplayTime ? toAttendanceDateTime(date, nextDisplayTime) : null,
    }
  
    if (!nextDisplayTime) {
      const outField = {
        morningIn: "morningOut",
        afternoonIn: "afternoonOut",
      }[field]
  
      if (outField) payload[outField] = null
    }
  
    try {
      await upsertAttendance(memberId, payload)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      toast.error(err?.message || "Unable to update attendance")
      throw err
    }
  }

  const tabs =
    levels.length > 0
      ? levels
      : [{ name: "All", label: "All Members", count: meta.total ?? 0 }]

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Member Attendance
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track morning and afternoon sessions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative flex h-10 items-center rounded-lg border border-input bg-white px-3 text-sm">
              <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="date"
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                className="bg-transparent text-sm text-foreground outline-none"
              />
            </label>

            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
              onClick={() => setIsExportOpen(true)}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading && !summary ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-6">
              <ListCardSkeleton rows={5} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6">
              <AttendanceStatsCards stats={summary} />
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <AttendanceGroupTabs
                groups={tabs}
                active={activeLevel}
                onChange={handleLevelChange}
              />

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search member..."
                  className={cn("h-9 rounded-lg bg-white pl-9", search && "pr-9")}
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-4">
              <AttendanceTable
                members={items}
                isLoading={isLoading}
                page={page}
                totalPages={meta.totalPages || 1}
                total={meta.total || 0}
                pageSize={PAGE_SIZE}
                onPageChange={(nextPage) => updateParams({ page: nextPage })}
                onSlotChange={handleSlotChange}
              />
            </div>
          </>
        )}
      </div>

      <ExportAttendanceReportModal
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        date={date}
        levelFilter={activeLevel}
        search={debouncedSearch}
      />
    </div>
  )
}
