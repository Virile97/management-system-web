"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  StatCardSkeleton,
  ListCardSkeleton,
} from "@/components/dashboard/DashboardSkeletons"
import { AttendanceStatsCards } from "@/components/attendance/AttendanceStatsCards"
import { AttendanceGroupTabs } from "@/components/attendance/AttendanceGroupTabs"
import { AttendanceTable } from "@/components/attendance/AttendanceTable"
import {
  listAttendance,
  upsertAttendance,
  toAttendanceDateTime,
} from "@/services/attendance.service"
import { useAttendanceStore } from "@/stores/attendance.store"
import { ExportAttendanceReportModal } from "@/components/attendance/ExportAttendanceReportModal"
import { DateRangeButton } from "@/components/common/DateRangeButton"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { useDebounce } from "@/hooks/use-debounce"
import {
  formatDateRangeLabel,
  toDateInputValue,
  toDatePoint,
  toDateRangeStrings,
} from "@/utils/helpers"
import { register as registerAbortController } from "@/lib/abort-registry"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Download, Search, X } from "lucide-react"

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
    a.from === b.from &&
    a.to === b.to &&
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
  const dateFrom = searchParams.get("from") || today
  const dateTo = searchParams.get("to") || dateFrom
  // Check-in edits still target one calendar day — the range end.
  const activeDate = dateTo || dateFrom || today
  const activeLevel = searchParams.get("level") || DEFAULT_LEVEL
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)
  const cacheKey = `${dateFrom}|${dateTo}`

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)

  const hasCustomRange = Boolean(
    searchParams.get("from") || searchParams.get("to")
  )
  const dateRange = {
    year: toDatePoint(dateFrom)?.year ?? new Date().getFullYear(),
    month: toDatePoint(dateFrom)?.month ?? new Date().getMonth(),
    start: toDatePoint(dateFrom),
    end: toDatePoint(dateTo),
    startTime: "12:00 AM",
    endTime: "11:59 PM",
    utc: true,
  }

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
        ((key === "from" || key === "to") && value === today)

      isDefault ? params.delete(key) : params.set(key, String(value))
    }

    // Keep from/to paired — if one side is today-defaulted away, drop both so
    // the page falls back to today's single-day window.
    if (!params.get("from") && !params.get("to")) {
      params.delete("from")
      params.delete("to")
    }

    const queryString = params.toString()
    if (queryString === searchParams.toString()) return false

    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    })
    return true
  }

  /**
   * Search fast-path: filter rows already cached for this range (and level).
   * Returns null when nothing matches so the caller can fall through to the API.
   */
  function searchCache(needle, level) {
    const trimmed = needle.trim().toLowerCase()
    if (!trimmed) return null

    const matches = []
    for (const item of getCachedItems(cacheKey)) {
      if (level !== DEFAULT_LEVEL && item.level !== level) continue
      if (
        String(item.name || "")
          .toLowerCase()
          .includes(trimmed)
      ) {
        matches.push(item)
      }
    }

    return matches.length > 0 ? matches : null
  }

  useEffect(() => {
    const currentQuery = {
      from: dateFrom,
      to: dateTo,
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
    let active = true

    const load = async () => {
      const searchValue = debouncedSearch.trim()

      if (searchValue) {
        const cached = searchCache(searchValue, activeLevel)

        if (cached) {
          if (!active) return
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
            from: dateFrom,
            to: dateTo,
            level: activeLevel === DEFAULT_LEVEL ? "" : activeLevel,
            search: debouncedSearch,
            page,
            limit: PAGE_SIZE,
          },
          controller.signal
        )

        if (!active) return

        if (page > 1 && page > response.meta.totalPages) {
          updateParams({ page: Math.max(1, response.meta.totalPages) })
          return
        }

        cacheItems(response.items, cacheKey)

        setAttendance(response.items, response.meta, currentQuery, {
          summary: response.summary,
          levels: response.levels,
        })
      } catch (err) {
        if (!active) return
        if (err?.name !== "AbortError") {
          setError(err?.message || "Unable to load attendance")
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()

    return () => {
      active = false
      controller.abort()
      unregister()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, activeLevel, debouncedSearch, page, refreshKey])

  function handleLevelChange(level) {
    setIsLoading(true)
    if (!updateParams({ level, page: 1 })) setIsLoading(false)
  }

  function handleSearchChange(value) {
    setSearch(value)
    // Show the table skeleton immediately (including the debounce window),
    // not only after the API request starts.
    setIsLoading(true)
    if (page > 1 && !updateParams({ page: 1 })) {
      // Page already 1 — effect will re-run when debouncedSearch updates.
    }
  }

  function handleApplyDateRange(range) {
    const { from, to } = toDateRangeStrings(range)
    setIsLoading(true)
    if (
      !updateParams({ from: from || today, to: to || from || today, page: 1 })
    ) {
      setIsLoading(false)
    }
  }

  function handleClearDateRange() {
    setIsLoading(true)
    // Clearing an already-default (today) range doesn't change the URL, so the
    // load effect wouldn't re-run — bump refreshKey (or drop loading) instead.
    if (!updateParams({ from: "", to: "", page: 1 })) {
      setRefreshKey((key) => key + 1)
    }
  }

  async function handleSlotChange(memberId, field, nextDisplayTime) {
    const payload = {
      date: activeDate,
      [field]: nextDisplayTime
        ? toAttendanceDateTime(activeDate, nextDisplayTime)
        : null,
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

  const rangeLabel =
    formatDateRangeLabel({
      start: toDatePoint(dateFrom),
      end: toDatePoint(dateTo),
    }) || today

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
            <DateRangeButton
              hasRange
              label={rangeLabel}
              clearable={hasCustomRange}
              onOpen={() => setIsDateRangeOpen(true)}
              onClear={handleClearDateRange}
              className="h-10 px-4"
            />

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
                  className={cn(
                    "h-9 rounded-lg bg-white pl-9",
                    search && "pr-9"
                  )}
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
                onPageChange={(nextPage) => {
                  setIsLoading(true)
                  updateParams({ page: nextPage })
                }}
                onSlotChange={handleSlotChange}
              />
            </div>
          </>
        )}
      </div>

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={dateRange}
        hasSelection={Boolean(dateFrom && dateTo)}
        onApply={handleApplyDateRange}
        onReset={handleClearDateRange}
        resetEnabled
      />

      <ExportAttendanceReportModal
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        dateFrom={dateFrom}
        dateTo={dateTo}
        levelFilter={activeLevel}
        search={debouncedSearch}
      />
    </div>
  )
}
