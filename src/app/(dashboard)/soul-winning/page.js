"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PeriodTabs } from "@/components/soul-winning/PeriodTabs"
import { SoulStatsCards } from "@/components/soul-winning/SoulStatsCards"
import { SoulWinningGoal } from "@/components/soul-winning/SoulWinningGoal"
import { RetentionBar } from "@/components/soul-winning/RetentionBar"
import { SectionTabs } from "@/components/soul-winning/SectionTabs"
import { RecordFilters } from "@/components/soul-winning/RecordFilters"
import { RecordsTable } from "@/components/soul-winning/RecordsTable"
import { Leaderboard } from "@/components/soul-winning/Leaderboard"
import { SoulTrendChart } from "@/components/soul-winning/SoulTrendChart"
import { RecordSoulWonModal } from "@/components/soul-winning/RecordSoulWonModal"
import { BaptizeModal } from "@/components/soul-winning/BaptizeModal"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { useDebounce } from "@/hooks/use-debounce"
import { register as registerAbortController } from "@/lib/abort-registry"
import {
  getSoulWinningOverview,
  setSoulWinningGoal,
  listSoulWinningRecords,
  baptizeSoulWinningRecord,
  listSoulWinningWinners,
  getSoulWinningTrends,
  resolveGoalYear,
} from "@/services/soulWinning.service"
import { toDatePoint, toDateRangeStrings } from "@/utils/helpers"
import {
  DEFAULT_PAGE_SIZE,
  resolvePageSize,
} from "@/utils/constants"
import {
  PROCESS_TYPES,
  useProcessQueueStore,
} from "@/stores/processQueue.store"
import { Plus } from "lucide-react"
import { toast } from "sonner"

const DEFAULT_SECTION = "records"
const DEFAULT_PERIOD = "This Month"
const SOUL_WINNING_PERIODS = [
  "Today",
  "This Week",
  "This Month",
  "This Year",
  "All Time",
  "Custom",
]

export default function SoulWinningPage() {
  return (
    <Suspense fallback={null}>
      <SoulWinningPageContent />
    </Suspense>
  )
}

function SoulWinningPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab = searchParams.get("section") || DEFAULT_SECTION
  const period = searchParams.get("period") || DEFAULT_PERIOD
  const periodFromParam = searchParams.get("periodFrom") || ""
  const periodToParam = searchParams.get("periodTo") || ""
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)
  const pageSize = resolvePageSize(searchParams.get("limit"))
  const status = searchParams.get("status") || "all"
  const winnerMemberId = searchParams.get("winnerMemberId") || ""
  const winnerMemberName = searchParams.get("winnerName") || ""
  const searchParam = searchParams.get("search") || ""

  const periodFrom = period === "Custom" ? periodFromParam : ""
  const periodTo = period === "Custom" ? periodToParam : ""

  const [search, setSearch] = useState(searchParam)
  const debouncedSearch = useDebounce(search, 300)

  const [overview, setOverview] = useState(null)
  const [isOverviewLoading, setIsOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState("")
  const [isSavingGoal, setIsSavingGoal] = useState(false)

  const [records, setRecords] = useState([])
  const [recordsMeta, setRecordsMeta] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })
  const [isRecordsLoading, setIsRecordsLoading] = useState(false)
  const [recordsError, setRecordsError] = useState("")

  const [winners, setWinners] = useState([])
  const [totalSoulsShared, setTotalSoulsShared] = useState(0)
  const [winnersMeta, setWinnersMeta] = useState({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })
  const [isWinnersLoading, setIsWinnersLoading] = useState(false)
  const [winnersError, setWinnersError] = useState("")

  const [trends, setTrends] = useState({
    monthly: [],
    byEvent: [],
    year: null,
  })
  const [isTrendsLoading, setIsTrendsLoading] = useState(false)
  const [trendsError, setTrendsError] = useState("")

  // Scoped refresh tokens — mutations only bump what they change.
  const [overviewKey, setOverviewKey] = useState(0)
  const [recordsKey, setRecordsKey] = useState(0)
  const [winnersKey, setWinnersKey] = useState(0)
  const [trendsKey, setTrendsKey] = useState(0)

  const [isRecordSoulOpen, setIsRecordSoulOpen] = useState(false)
  const [baptizeRecord, setBaptizeRecord] = useState(null)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const lastCompleted = useProcessQueueStore((state) => state.lastCompleted)
  const isFirstCompleted = useRef(true)

  // Refresh overview/records when a queued soul-won create finishes.
  useEffect(() => {
    if (isFirstCompleted.current) {
      isFirstCompleted.current = false
      return
    }
    if (lastCompleted?.type !== PROCESS_TYPES.SOUL_WINNING_CREATE_RECORD) {
      return
    }
    setOverviewKey((key) => key + 1)
    setRecordsKey((key) => key + 1)
    if (activeTab === "leaderboard") setWinnersKey((key) => key + 1)
    if (activeTab === "trend") setTrendsKey((key) => key + 1)
  }, [lastCompleted, activeTab])

  const winnerFilter = winnerMemberId
    ? {
        id: winnerMemberId,
        name: winnerMemberName || "Selected soul winner",
      }
    : null

  const customRange = {
    year: toDatePoint(periodFromParam)?.year ?? new Date().getFullYear(),
    month: toDatePoint(periodFromParam)?.month ?? new Date().getMonth(),
    start: toDatePoint(periodFromParam),
    end: toDatePoint(periodToParam),
    startTime: "12:00 AM",
    endTime: "11:59 PM",
    utc: true,
  }

  const periodOptions = {
    period,
    from: periodFrom,
    to: periodTo,
  }
  // Annual goal year follows the period tabs (Custom range year, else current).
  const goalYear = useMemo(
    () => resolveGoalYear({ period, from: periodFrom, to: periodTo }),
    [period, periodFrom, periodTo]
  )
  const overviewOptions = {
    ...periodOptions,
    year: goalYear,
  }
  const trendsOptions = {
    ...periodOptions,
    year: goalYear,
  }

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      const isDefault =
        (key === "period" && value === DEFAULT_PERIOD) ||
        (key === "section" && value === DEFAULT_SECTION) ||
        (key === "status" && value === "all") ||
        (key === "page" && Number(value) <= 1) ||
        (key === "limit" && Number(value) === DEFAULT_PAGE_SIZE) ||
        (key === "search" && !value) ||
        (key === "winnerMemberId" && !value) ||
        (key === "winnerName" && !value)

      if (value === "" || value == null || isDefault) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }

    router.push(
      `${pathname}${params.toString() ? `?${params.toString()}` : ""}`,
      { scroll: false }
    )
  }

  function setActiveTab(nextSection) {
    updateParams({ section: nextSection, page: 1 })
  }

  function updatePeriod(nextPeriod) {
    if (nextPeriod === "Custom") {
      setIsDateRangeOpen(true)
      return
    }
    updateParams({
      period: nextPeriod,
      periodFrom: "",
      periodTo: "",
      page: 1,
    })
  }

  function clearPeriodFilter() {
    updateParams({
      period: DEFAULT_PERIOD,
      periodFrom: "",
      periodTo: "",
      page: 1,
    })
  }

  function updateWinnerFilter(member) {
    updateParams({
      winnerMemberId: member?.id || "",
      winnerName: member?.name || "",
      page: 1,
    })
  }

  function applyOverviewSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return false

    const hasRetention = snapshot.retention != null
    const hasStats = snapshot.stats != null
    const snapshotGoal = snapshot.goal
    const snapshotGoalYear =
      snapshotGoal?.year != null ? Number(snapshotGoal.year) : null
    const hasGoalForView =
      snapshotGoal != null &&
      (snapshotGoalYear == null || snapshotGoalYear === goalYear)
    if (!hasRetention && !hasStats && !hasGoalForView) return false

    setOverview((prev) => ({
      ...(prev || {}),
      ...(hasGoalForView ? { goal: snapshotGoal } : {}),
      ...(hasStats ? { stats: snapshot.stats } : {}),
      ...(hasRetention ? { retention: snapshot.retention } : {}),
    }))
    return true
  }

  function refreshAfterMutationWithSnapshot(snapshot) {
    const applied = applyOverviewSnapshot(snapshot)
    setRecordsKey((key) => key + 1)
    if (!applied) setOverviewKey((key) => key + 1)
    if (activeTab === "leaderboard") setWinnersKey((key) => key + 1)
    if (activeTab === "trend") setTrendsKey((key) => key + 1)
  }

  // Keep local search input in sync when URL is cleared externally.
  useEffect(() => {
    setSearch(searchParam)
  }, [searchParam])

  // Debounced search → URL.
  useEffect(() => {
    if (debouncedSearch === searchParam) return
    updateParams({ search: debouncedSearch, page: 1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- URL write only on debounce change
  }, [debouncedSearch])

  // Overview (goal / stats / retention) — period for KPIs; year for annual goal.
  useEffect(() => {
    if (period === "Custom" && (!periodFrom || !periodTo)) {
      setIsOverviewLoading(false)
      return
    }

    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    setIsOverviewLoading(true)
    setOverviewError("")

    getSoulWinningOverview(overviewOptions, controller.signal)
      .then((data) => {
        setOverview(data || null)
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
        setOverviewError(err?.message || "Unable to load overview")
        setOverview(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsOverviewLoading(false)
      })

    return () => {
      unregister()
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, periodFrom, periodTo, goalYear, overviewKey])

  // Records list — only while Records tab is active.
  useEffect(() => {
    if (activeTab !== "records") return
    if (period === "Custom" && (!periodFrom || !periodTo)) return

    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    setIsRecordsLoading(true)
    setRecordsError("")

    listSoulWinningRecords(
      {
        ...periodOptions,
        page,
        limit: pageSize,
        search: searchParam,
        status,
        winnerMemberId,
      },
      controller.signal
    )
      .then(({ data, meta }) => {
        setRecords(data || [])
        setRecordsMeta(
          meta || {
            page,
            limit: pageSize,
            total: 0,
            totalPages: 1,
          }
        )
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
        setRecordsError(err?.message || "Unable to load records")
        setRecords([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsRecordsLoading(false)
      })

    return () => {
      unregister()
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    period,
    periodFrom,
    periodTo,
    page,
    pageSize,
    searchParam,
    status,
    winnerMemberId,
    recordsKey,
  ])

  // Soul Winners — only when that tab is open.
  useEffect(() => {
    if (activeTab !== "leaderboard") return
    if (period === "Custom" && (!periodFrom || !periodTo)) return

    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    setIsWinnersLoading(true)
    setWinnersError("")

    listSoulWinningWinners(
      { ...periodOptions, page, limit: pageSize },
      controller.signal
    )
      .then((data) => {
        setWinners(data?.items || [])
        setTotalSoulsShared(Number(data?.totalSoulsShared) || 0)
        setWinnersMeta(
          data?.meta || {
            page,
            limit: pageSize,
            total: 0,
            totalPages: 1,
          }
        )
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
        setWinnersError(err?.message || "Unable to load soul winners")
        setWinners([])
        setTotalSoulsShared(0)
        setWinnersMeta({
          page: 1,
          limit: pageSize,
          total: 0,
          totalPages: 1,
        })
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsWinnersLoading(false)
      })

    return () => {
      unregister()
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, period, periodFrom, periodTo, page, pageSize, winnersKey])

  // Trends — only when that tab is open.
  useEffect(() => {
    if (activeTab !== "trend") return
    if (period === "Custom" && (!periodFrom || !periodTo)) return

    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    setIsTrendsLoading(true)
    setTrendsError("")

    getSoulWinningTrends(trendsOptions, controller.signal)
      .then((data) => {
        setTrends({
          monthly: data?.monthly || [],
          byEvent: data?.byEvent || [],
          year: data?.year ?? goalYear,
        })
      })
      .catch((err) => {
        if (err?.name === "AbortError") return
        setTrendsError(err?.message || "Unable to load trends")
        setTrends({ monthly: [], byEvent: [], year: goalYear })
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsTrendsLoading(false)
      })

    return () => {
      unregister()
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, period, periodFrom, periodTo, goalYear, trendsKey])

  async function handleSaveGoal({ year, targetCount }) {
    setIsSavingGoal(true)
    try {
      const nextYear = Number(year) || goalYear
      await setSoulWinningGoal({ year: nextYear, targetCount })
      toast.success(nextYear === goalYear && overview?.goal ? "Goal updated" : "Goal saved")
      setOverviewKey((key) => key + 1)
    } finally {
      setIsSavingGoal(false)
    }
  }

  async function handleBaptizeConfirm(payload) {
    if (!baptizeRecord?.id) return
    const data = await baptizeSoulWinningRecord(baptizeRecord.id, payload)
    toast.success("Convert marked as baptized — now Active Member")
    setBaptizeRecord(null)
    refreshAfterMutationWithSnapshot(data?.snapshot)
  }

  const goal = overview?.goal || null
  const stats = overview?.stats || null
  const retention = overview?.retention || null
  const periodDrivesFilter = period !== DEFAULT_PERIOD
  const recordCount =
    stats?.totalSoulsWon != null
      ? Number(stats.totalSoulsWon)
      : recordsMeta.total || 0

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Soul Winning
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track soul winning activities
            </p>
          </div>

          <Button
            className="h-10 w-full gap-2 rounded-lg bg-[#1e2a4a] px-3 text-white hover:bg-[#1e2a4a]/90 sm:w-auto sm:px-4"
            onClick={() => setIsRecordSoulOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sm:hidden">Record Soul</span>
            <span className="hidden sm:inline">Record Soul Won</span>
          </Button>
        </div>

        <div className="mt-5 sm:mt-6">
          <PeriodTabs
            active={period}
            onChange={updatePeriod}
            periods={SOUL_WINNING_PERIODS}
            recordCount={recordCount}
            onCustomClick={() => setIsDateRangeOpen(true)}
            clearable={periodDrivesFilter}
            onClear={clearPeriodFilter}
          />
        </div>

        {overviewError ? (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {overviewError}
          </p>
        ) : null}

        <div className="mt-4 sm:mt-6">
          <SoulWinningGoal
            goal={goal}
            year={goalYear}
            onGoalChange={handleSaveGoal}
            isSaving={isSavingGoal}
          />
        </div>

        <div className="mt-4 sm:mt-6">
          <SoulStatsCards
            stats={stats}
            isLoading={isOverviewLoading}
            periodLabel={period === "Custom" ? "custom range" : period.toLowerCase()}
          />
        </div>

        <div className="mt-4 sm:mt-6">
          <RetentionBar
            retention={retention}
            isLoading={isOverviewLoading}
          />
        </div>

        <div className="mt-4 sm:mt-6">
          <SectionTabs active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === "records" && (
          <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4">
            <RecordFilters
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={(next) =>
                updateParams({ status: next, page: 1 })
              }
              winner={winnerFilter}
              onWinnerChange={updateWinnerFilter}
              resultCount={recordsMeta.total || 0}
            />
            {recordsError ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {recordsError}
              </p>
            ) : null}
            <RecordsTable
              records={records}
              isLoading={isRecordsLoading}
              page={recordsMeta.page || page}
              totalPages={recordsMeta.totalPages || 1}
              total={recordsMeta.total || 0}
              pageSize={recordsMeta.limit || pageSize}
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
              onPageSizeChange={(nextSize) =>
                updateParams({ limit: nextSize, page: 1 })
              }
              onBaptize={setBaptizeRecord}
            />
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="mt-4 sm:mt-6">
            {winnersError ? (
              <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {winnersError}
              </p>
            ) : null}
            <Leaderboard
              soulWinners={winners}
              totalSoulsShared={totalSoulsShared}
              isLoading={isWinnersLoading}
              page={winnersMeta.page || page}
              totalPages={winnersMeta.totalPages || 1}
              total={winnersMeta.total || 0}
              pageSize={winnersMeta.limit || pageSize}
              onPageChange={(nextPage) => updateParams({ page: nextPage })}
              onPageSizeChange={(nextSize) =>
                updateParams({ limit: nextSize, page: 1 })
              }
            />
          </div>
        )}

        {activeTab === "trend" && (
          <div className="mt-4 sm:mt-6">
            {trendsError ? (
              <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {trendsError}
              </p>
            ) : null}
            <SoulTrendChart
              monthly={trends.monthly}
              byEvent={trends.byEvent}
              year={trends.year ?? goalYear}
              isLoading={isTrendsLoading}
            />
          </div>
        )}
      </div>

      <RecordSoulWonModal
        open={isRecordSoulOpen}
        onOpenChange={setIsRecordSoulOpen}
      />

      <BaptizeModal
        open={Boolean(baptizeRecord)}
        onOpenChange={(open) => {
          if (!open) setBaptizeRecord(null)
        }}
        record={baptizeRecord}
        onConfirm={handleBaptizeConfirm}
      />

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={customRange}
        hasSelection={Boolean(periodFromParam && periodToParam)}
        onApply={(range) => {
          const { from, to } = toDateRangeStrings(range)
          updateParams({
            period: "Custom",
            periodFrom: from,
            periodTo: to,
            page: 1,
          })
        }}
      />
    </div>
  )
}
