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
  buildAttendanceSlotPatch,
  withDerivedRowStatus,
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

/**
 * Skeleton policy for list loads:
 * - filter: search / date / level / page (or explicit retry)
 * - silent: same query refresh (e.g. after a time upsert)
 * - auto: filter when the query changed, silent when it did not
 */
function shouldShowSkeleton(intent, previousQuery, nextQuery) {
  if (intent === "silent") return false

  if (intent === "filter") return true

  return !previousQuery || !queriesMatch(previousQuery, nextQuery)
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
    setSummary,
    setLevels,
    cacheItems,
    getCachedItems,
    patchItem,
  } = useAttendanceStore(
    useShallow((state) => ({
      items: state.items,
      summary: state.summary,
      levels: state.levels,
      meta: state.meta,
      query: state.query,
      setAttendance: state.setAttendance,
      setSummary: state.setSummary,
      setLevels: state.setLevels,
      cacheItems: state.cacheItems,
      getCachedItems: state.getCachedItems,
      patchItem: state.patchItem,
    }))
  )

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const isFirstRun = useRef(true)
  const lastQueryRef = useRef(null)
  const reloadIntentRef = useRef("filter")
  const summaryRefreshTimer = useRef(null)

  function reload(intent = "auto") {
    reloadIntentRef.current = intent
    setRefreshKey((key) => key + 1)
  }

  function queueSummaryRefresh() {
    if (summaryRefreshTimer.current) clearTimeout(summaryRefreshTimer.current)

    summaryRefreshTimer.current = setTimeout(async () => {
      try {
        const response = await listAttendance({
          from: dateFrom,
          to: dateTo,
          level: activeLevel === DEFAULT_LEVEL ? "" : activeLevel,
          search: debouncedSearch,
          page,
          limit: PAGE_SIZE,
        })
        setSummary(response.summary)
        setLevels(response.levels)
      } catch {
        // Row state is already patched; stats can catch up on the next filter load.
      }
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (summaryRefreshTimer.current) clearTimeout(summaryRefreshTimer.current)
    }
  }, [])

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
        lastQueryRef.current = currentQuery
        reloadIntentRef.current = "auto"
        setIsLoading(false)
        setError("")
        return
      }
    }

    const intent = reloadIntentRef.current
    reloadIntentRef.current = "auto"
    const showSkeleton = shouldShowSkeleton(
      intent,
      lastQueryRef.current,
      currentQuery
    )

    if (showSkeleton) setIsLoading(true)

    const controller = new AbortController()
    const unregister = registerAbortController(controller)
    let active = true

    const load = async () => {
      const searchValue = debouncedSearch.trim()

      if (searchValue) {
        const cached = searchCache(searchValue, activeLevel)

        if (cached) {
          if (!active) return
          lastQueryRef.current = currentQuery
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
        lastQueryRef.current = currentQuery

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
    updateParams({ level, page: 1 })
  }

  function handleSearchChange(value) {
    setSearch(value)
    if (page > 1) updateParams({ page: 1 })
  }

  function handleApplyDateRange(range) {
    const { from, to } = toDateRangeStrings(range)
    updateParams({ from: from || today, to: to || from || today, page: 1 })
  }

  function handleClearDateRange() {
    // Clearing an already-default (today) range doesn't change the URL, so the
    // load effect wouldn't re-run — bump refreshKey instead.
    if (!updateParams({ from: "", to: "", page: 1 })) {
      reload("filter")
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
      const data = await upsertAttendance(memberId, payload)
      const slotPatch = buildAttendanceSlotPatch(field, nextDisplayTime, data)

      // Patch only the written slot(s) so concurrent edits on the same row stay intact.
      patchItem(memberId, (row) => withDerivedRowStatus(row, slotPatch))
      queueSummaryRefresh()

      return slotPatch
    } catch (err) {
      toast.error(err?.message || "Unable to update attendance")
      throw err
    }
  }

  // Cover the debounce window before the effect sees the new search value.
  const isSearchPending = search !== debouncedSearch
  const showListSkeleton = isLoading || isSearchPending

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
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Member Attendance
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track morning and afternoon sessions
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-center sm:gap-3">
            <DateRangeButton
              hasRange
              label={rangeLabel}
              clearable={hasCustomRange}
              onOpen={() => setIsDateRangeOpen(true)}
              onClear={handleClearDateRange}
              className="h-10 w-full justify-start px-3 sm:w-auto sm:px-4"
            />

            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-3 text-white hover:bg-[#1e2a4a]/90 sm:px-4"
              onClick={() => setIsExportOpen(true)}
            >
              <Download className="h-4 w-4" />
              <span className="sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex flex-col gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => reload("filter")}
              className="shrink-0 self-start font-semibold underline underline-offset-2 hover:no-underline sm:self-auto"
            >
              Retry
            </button>
          </div>
        )}

        {showListSkeleton && !summary ? (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-4 sm:mt-6">
              <ListCardSkeleton rows={5} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 sm:mt-6">
              <AttendanceStatsCards stats={summary} />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="relative order-1 w-full sm:order-2 sm:w-64 lg:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search member..."
                  className={cn(
                    "h-10 rounded-lg bg-white pl-9 sm:h-9",
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

              <div className="order-2 min-w-0 sm:order-1 sm:flex-1">
                <AttendanceGroupTabs
                  groups={tabs}
                  active={activeLevel}
                  onChange={handleLevelChange}
                />
              </div>
            </div>

            <div className="mt-3 sm:mt-4">
              <AttendanceTable
                members={items}
                isLoading={showListSkeleton}
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
