"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FinanceCards } from "@/components/finances/FinanceCards"
import { MonthlyTrendChart } from "@/components/finances/MonthlyTrendChart"
import { OfferingTypeChart } from "@/components/finances/OfferingTypeChart"
import { TransactionTable } from "@/components/finances/TransactionTable"
import { ScanQRModal } from "@/components/finances/ScanQRModal"
import { RecordTransactionModal } from "@/components/finances/RecordTransactionModal"
import { ExportTransactionsReportModal } from "@/components/finances/ExportTransactionsReportModal"
import { PeriodTabs } from "@/components/soul-winning/PeriodTabs"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { useDebounce } from "@/hooks/use-debounce"
import {
  toDatePoint,
  toDateRangeStrings,
  toPeriodDateRange,
} from "@/utils/helpers"
import { register as registerAbortController } from "@/lib/abort-registry"
import {
  getFinanceStats,
  getFinanceByOfferingType,
  getFinanceTrend,
  getTransactionsConfig,
  listTransactions,
  bulkDeleteTransactions,
} from "@/services/finance.service"
import { useFinanceStore } from "@/stores/finance.store"
import {
  PROCESS_TYPES,
  useProcessQueueStore,
} from "@/stores/processQueue.store"
import {
  DEFAULT_PAGE_SIZE,
  resolvePageSize,
} from "@/utils/constants"
import { ScanLine, Plus, FileDown } from "lucide-react"

const DEFAULT_FILTER = "All"
const DEFAULT_RECORD_TYPE = "income"
const DEFAULT_PERIOD = "This Month"

// Maps PeriodTabs' display labels to the backend's period enum.
const PERIOD_VALUES = {
  Today: "today",
  "This Month": "month",
  "This Year": "year",
  "All Time": "all",
  Custom: "custom",
}

function tableQueriesMatch(a, b) {
  return (
    a.page === b.page &&
    a.limit === b.limit &&
    a.type === b.type &&
    a.search === b.search &&
    a.from === b.from &&
    a.to === b.to
  )
}

function summaryQueriesMatch(a, b) {
  return a.period === b.period && a.from === b.from && a.to === b.to
}

export default function FinancesPage() {
  return (
    <Suspense fallback={null}>
      <FinancesPageContent />
    </Suspense>
  )
}

function FinancesPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1)
  const pageSize = resolvePageSize(searchParams.get("limit"))
  const activeFilter = searchParams.get("type") || DEFAULT_FILTER
  const period = searchParams.get("period") || DEFAULT_PERIOD
  const periodFromParam = searchParams.get("periodFrom") || ""
  const periodToParam = searchParams.get("periodTo") || ""

  // `recordType` is separate from the table's `type` filter so the two don't collide.
  const isRecordingParam = searchParams.get("recording") === "true"
  const recordTypeParam = searchParams.get("recordType") || DEFAULT_RECORD_TYPE
  // Same ?isEdit=true&…Id convention as members.
  const isEditParam = searchParams.get("isEdit") === "true"
  const editTransactionIdParam = searchParams.get("transactionId") || ""
  const isScanParam = searchParams.get("scan") === "true"

  const [selectedById, setSelectedById] = useState(() => new Map())
  const selectedIds = useMemo(
    () => new Set(selectedById.keys()),
    [selectedById]
  )
  const selectedTransactions = useMemo(
    () => Array.from(selectedById.values()),
    [selectedById]
  )
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const lastCompleted = useProcessQueueStore((state) => state.lastCompleted)
  const isFirstCompleted = useRef(true)

  // Refresh finance views when a queued create finishes successfully.
  useEffect(() => {
    if (isFirstCompleted.current) {
      isFirstCompleted.current = false
      return
    }
    if (lastCompleted?.type !== PROCESS_TYPES.FINANCE_CREATE_TRANSACTION) {
      return
    }
    setRefreshKey((key) => key + 1)
  }, [lastCompleted])

  const periodValue = PERIOD_VALUES[period] ?? "month"

  // The URL (periodFrom/periodTo) is the source of truth for the custom
  // range, so it survives a reload — customRange below only reconstructs
  // the modal's display/seed state from it, nothing is kept in local state
  // that the URL doesn't already have.
  const periodFrom = periodValue === "custom" ? periodFromParam : ""
  const periodTo = periodValue === "custom" ? periodToParam : ""

  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  // start/end stay null until the user actually picks a range — seeding
  // them to today's date pre-selects a 1-day range, which the modal's
  // click handler then silently extends from on the user's first click
  // instead of starting a fresh selection. year/month only seed which
  // month the calendar opens to before any selection exists.
  const customRange = {
    year: toDatePoint(periodFromParam)?.year ?? new Date().getFullYear(),
    month: toDatePoint(periodFromParam)?.month ?? new Date().getMonth(),
    start: toDatePoint(periodFromParam),
    end: toDatePoint(periodToParam),
    startTime: "12:00 AM",
    endTime: "11:59 PM",
    utc: true,
  }

  const {
    stats,
    offeringTypeData,
    trendData,
    isSummaryLoading,
    summaryError,
    summaryQuery,
    transactions,
    meta,
    tableQuery,
    search,
    dateFrom,
    dateTo,
    isTableLoading,
    tableError,
    config,
    isConfigLoading,
    configError,
  } = useFinanceStore(
    useShallow((state) => ({
      stats: state.stats,
      offeringTypeData: state.offeringTypeData,
      trendData: state.trendData,
      isSummaryLoading: state.isSummaryLoading,
      summaryError: state.summaryError,
      summaryQuery: state.summaryQuery,
      transactions: state.transactions,
      meta: state.meta,
      tableQuery: state.tableQuery,
      search: state.search,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      isTableLoading: state.isTableLoading,
      tableError: state.tableError,
      config: state.config,
      isConfigLoading: state.isConfigLoading,
      configError: state.configError,
    }))
  )

  const isFirstTableRun = useRef(true)
  const isFirstSummaryRun = useRef(true)

  // Period tabs own the table date bounds whenever a non-default period is
  // active. "This Month" is the default, so it leaves the table's own
  // date-range control enabled and hides the Clear filter affordance.
  const periodDrivesTableDates = period !== DEFAULT_PERIOD
  const periodTableRange = toPeriodDateRange(period, periodFrom, periodTo)
  const tableDateFrom = periodDrivesTableDates
    ? periodTableRange.from
    : dateFrom
  const tableDateTo = periodDrivesTableDates ? periodTableRange.to : dateTo
  const tableDateRangeLabel =
    tableDateFrom || tableDateTo
      ? `${tableDateFrom || "…"} – ${tableDateTo || "…"}`
      : ""

  const debouncedSearch = useDebounce(search, 300)

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      const isDefault = value === DEFAULT_FILTER || value === DEFAULT_PERIOD
      if (
        value === "" ||
        value == null ||
        isDefault ||
        (key === "page" && value <= 1) ||
        (key === "limit" && Number(value) === DEFAULT_PAGE_SIZE)
      ) {
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

  function goToPage(nextPage) {
    updateParams({ page: nextPage })
  }

  function updatePageSize(nextSize) {
    updateParams({ limit: nextSize, page: 1 })
  }

  function openScanQr() {
    updateParams({ scan: "true" })
  }

  function closeScanQr() {
    updateParams({ scan: "" })
  }

  function openRecordTransaction() {
    updateParams({
      recording: "true",
      recordType: DEFAULT_RECORD_TYPE,
      isEdit: "",
      transactionId: "",
    })
  }

  function closeRecordTransaction() {
    updateParams({
      recording: "",
      recordType: "",
      isEdit: "",
      transactionId: "",
    })
  }

  function openEditTransaction(transaction) {
    updateParams({
      isEdit: "true",
      transactionId: transaction.id,
      recording: "",
      recordType: "",
    })
  }

  function closeEditTransaction() {
    updateParams({ isEdit: "", transactionId: "" })
  }

  function updateRecordType(nextType) {
    updateParams({ recordType: nextType })
  }

  // Filters the stats/trend/offering-type summary AND (for non-default
  // periods) the transaction table by time period. Switching away from
  // the default clears the table's own date-range so only one date source
  // is active at a time.
  function updatePeriod(nextPeriod) {
    if (nextPeriod === "Custom") {
      setIsDateRangeOpen(true)
      return
    }

    if (nextPeriod !== DEFAULT_PERIOD) {
      useFinanceStore.getState().clearDateRange()
    }

    updateParams({ period: nextPeriod, periodFrom: "", periodTo: "", page: 1 })
  }

  function clearPeriodFilter() {
    useFinanceStore.getState().clearDateRange()
    updateParams({
      period: DEFAULT_PERIOD,
      periodFrom: "",
      periodTo: "",
      page: 1,
    })
  }

  // Stats/offering-type/trend are independent of the transaction table's own
  // filters — they only refetch when the period (or its custom range) changes.
  useEffect(() => {
    const currentQuery = {
      period: periodValue,
      from: periodFrom,
      to: periodTo,
    }

    if (isFirstSummaryRun.current) {
      isFirstSummaryRun.current = false

      if (
        summaryQuery &&
        stats &&
        summaryQueriesMatch(summaryQuery, currentQuery)
      ) {
        useFinanceStore.getState().setSummaryLoading(false)
        return
      }
    }

    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    const {
      setStats,
      setOfferingTypeData,
      setTrendData,
      setSummary,
      setSummaryLoading,
      setSummaryError,
    } = useFinanceStore.getState()

    async function loadSummary() {
      setSummaryLoading(true)
      setSummaryError("")

      const periodParams = {
        period: periodValue,
        from: periodFrom,
        to: periodTo,
      }

      const [statsResult, offeringTypeResult, trendResult] =
        await Promise.allSettled([
          getFinanceStats(periodParams, controller.signal),
          getFinanceByOfferingType(periodParams, controller.signal),
          getFinanceTrend(periodParams, controller.signal),
        ])
      if (controller.signal.aborted) return

      if (statsResult.status === "fulfilled") setStats(statsResult.value)
      if (offeringTypeResult.status === "fulfilled")
        setOfferingTypeData(offeringTypeResult.value)
      if (trendResult.status === "fulfilled") setTrendData(trendResult.value)

      const anyOk = [statsResult, offeringTypeResult, trendResult].some(
        (result) => result.status === "fulfilled"
      )
      if (anyOk) {
        const state = useFinanceStore.getState()
        setSummary(
          state.stats,
          state.offeringTypeData,
          state.trendData,
          currentQuery
        )
      } else {
        setSummaryLoading(false)
      }

      const failed = [statsResult, offeringTypeResult, trendResult].find(
        (r) => r.status === "rejected"
      )
      if (failed)
        setSummaryError(
          failed.reason?.message || "Unable to load finance summary"
        )
    }

    loadSummary()
    return () => {
      controller.abort()
      unregister()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodValue, periodFrom, periodTo])

  // Type/category/offering-type options rarely change, so fetch them once
  // per session and reuse whatever's already in the store — only call the
  // API when `config` hasn't been loaded yet.
  useEffect(() => {
    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    const {
      config: existingConfig,
      setConfig,
      setConfigLoading,
      setConfigError,
    } = useFinanceStore.getState()

    if (existingConfig) return unregister

    async function loadConfig() {
      setConfigLoading(true)
      setConfigError("")

      try {
        const data = await getTransactionsConfig(controller.signal)
        if (controller.signal.aborted) return
        setConfig(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setConfigError(
          err?.message || "Unable to load transaction form options"
        )
      } finally {
        if (!controller.signal.aborted) setConfigLoading(false)
      }
    }

    loadConfig()
    return () => {
      controller.abort()
      unregister()
    }
  }, [])

  useEffect(() => {
    const currentQuery = {
      page,
      limit: pageSize,
      type: activeFilter,
      search: debouncedSearch,
      from: tableDateFrom,
      to: tableDateTo,
    }

    // On mount only: reuse the persisted table when the query is unchanged.
    if (isFirstTableRun.current) {
      isFirstTableRun.current = false

      if (
        tableQuery &&
        transactions.length > 0 &&
        tableQueriesMatch(tableQuery, currentQuery)
      ) {
        useFinanceStore.getState().setTableLoading(false)
        return
      }
    }

    const controller = new AbortController()
    const unregister = registerAbortController(controller)

    const { setTransactions, setTableLoading, setTableError } =
      useFinanceStore.getState()

    async function loadTransactions() {
      setTableLoading(true)
      setTableError("")
      try {
        const { data, meta: responseMeta } = await listTransactions(
          {
            page,
            limit: pageSize,
            type: activeFilter === "All" ? "" : activeFilter,
            search: debouncedSearch,
            from: tableDateFrom,
            to: tableDateTo,
          },
          controller.signal
        )
        if (controller.signal.aborted) return

        const resolvedMeta = responseMeta || {
          total: data.length,
          totalPages: 1,
        }

        // The current page can outlive its own data (e.g. a filter/date range
        // shrinks the result set) — snap back to a valid page instead of
        // getting stuck on one that no longer exists.
        if (page > 1 && page > resolvedMeta.totalPages) {
          goToPage(Math.max(1, resolvedMeta.totalPages))
          return
        }

        setTransactions(data, resolvedMeta, currentQuery)
      } catch (err) {
        if (controller.signal.aborted) return
        setTableError(err?.message || "Unable to load transactions")
      } finally {
        if (!controller.signal.aborted) setTableLoading(false)
      }
    }

    loadTransactions()
    return () => {
      controller.abort()
      unregister()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    activeFilter,
    debouncedSearch,
    tableDateFrom,
    tableDateTo,
    refreshKey,
  ])

  const { setSearch, setDateFrom, setDateTo, clearDateRange } =
    useFinanceStore.getState()

  function updateFilter(nextFilter) {
    updateParams({ type: nextFilter })
  }

  function updateSearch(nextSearch) {
    setSearch(nextSearch)
    goToPage(1)
  }

  function updateDateFrom(nextDate) {
    setDateFrom(nextDate)
    goToPage(1)
  }

  function updateDateTo(nextDate) {
    setDateTo(nextDate)
    goToPage(1)
  }

  function updateClearDateRange() {
    clearDateRange()
    goToPage(1)
  }

  function toggleSelect(transaction) {
    setSelectedById((prev) => {
      const next = new Map(prev)

      if (next.has(transaction.id)) {
        next.delete(transaction.id)
      } else {
        next.set(transaction.id, transaction)
      }

      return next
    })
  }

  function toggleSelectAll(pageRows) {
    setSelectedById((prev) => {
      const allSelected = pageRows.every((transaction) =>
        prev.has(transaction.id)
      )
      const next = new Map(prev)

      pageRows.forEach((transaction) => {
        if (allSelected) {
          next.delete(transaction.id)
        } else {
          next.set(transaction.id, transaction)
        }
      })

      return next
    })
  }

  async function handleConfirmBulkDelete() {
    setDeleteError("")
    setIsDeleting(true)

    try {
      await bulkDeleteTransactions(Array.from(selectedIds))
      setSelectedById(new Map())
      setIsDeleteSelectedOpen(false)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setDeleteError(err?.message || "Unable to delete selected transactions")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Finances
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Income and Expenses
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 rounded-lg bg-white px-3 text-foreground hover:bg-white sm:px-4 dark:bg-white dark:text-neutral-900 dark:hover:bg-white"
              onClick={() => setIsExportOpen(true)}
              disabled={meta.total === 0 && selectedIds.size === 0}
            >
              <FileDown className="h-4 w-4" />
              <span className="sm:hidden">Export</span>
              <span className="hidden sm:inline">Export Report</span>
            </Button>
            <Button
              className="h-10 gap-2 rounded-lg bg-amber-400 px-3 text-[#1e2a4a] hover:bg-amber-400/90 sm:px-4"
              onClick={openScanQr}
            >
              <ScanLine className="h-4 w-4" />
              <span className="sm:hidden">Scan QR</span>
              <span className="hidden sm:inline">Scan QR Offering</span>
            </Button>
            <Button
              className="col-span-2 h-10 gap-2 rounded-lg bg-[#1e2a4a] px-3 text-white hover:bg-[#1e2a4a]/90 sm:col-span-1 sm:px-4"
              onClick={openRecordTransaction}
            >
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">Record</span>
              <span className="hidden sm:inline">Record Transaction</span>
            </Button>
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <PeriodTabs
            active={period}
            onChange={updatePeriod}
            recordCount={meta.total}
            onCustomClick={() => setIsDateRangeOpen(true)}
            clearable={periodDrivesTableDates}
            onClear={clearPeriodFilter}
          />
        </div>

        {summaryError && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {summaryError}
          </p>
        )}

        <div className="mt-5 sm:mt-6">
          <FinanceCards stats={stats} isLoading={isSummaryLoading} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-6 sm:gap-6 lg:grid-cols-[3fr_2fr]">
          <MonthlyTrendChart data={trendData} isLoading={isSummaryLoading} />
          <OfferingTypeChart
            data={offeringTypeData}
            isLoading={isSummaryLoading}
          />
        </div>

        {tableError && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {tableError}
          </p>
        )}

        <div className="mt-4 sm:mt-6">
          <TransactionTable
            transactions={transactions}
            isLoading={isTableLoading}
            activeFilter={activeFilter}
            onFilterChange={updateFilter}
            search={search}
            onSearchChange={updateSearch}
            dateFrom={tableDateFrom}
            dateTo={tableDateTo}
            dateFilterDisabled={periodDrivesTableDates}
            onDateFromChange={updateDateFrom}
            onDateToChange={updateDateTo}
            onClearDateRange={updateClearDateRange}
            selected={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onDeleteSelected={() => setIsDeleteSelectedOpen(true)}
            onEdit={openEditTransaction}
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={pageSize}
            onPageChange={goToPage}
            onPageSizeChange={updatePageSize}
          />
        </div>
      </div>

      <ScanQRModal
        open={isScanParam}
        onOpenChange={(open) => !open && closeScanQr()}
      />
      <ExportTransactionsReportModal
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        typeFilter={activeFilter}
        search={debouncedSearch}
        dateFrom={tableDateFrom}
        dateTo={tableDateTo}
        dateRangeLabel={tableDateRangeLabel}
        selectedTransactions={selectedTransactions}
      />
      <RecordTransactionModal
        open={
          isRecordingParam || (isEditParam && Boolean(editTransactionIdParam))
        }
        onOpenChange={(open) => {
          if (open) return
          if (isEditParam) closeEditTransaction()
          else closeRecordTransaction()
        }}
        type={recordTypeParam}
        onTypeChange={updateRecordType}
        transactionId={isEditParam ? editTransactionIdParam || null : null}
        onSaved={() => setRefreshKey((key) => key + 1)}
        config={config}
        isConfigLoading={isConfigLoading}
        configError={configError}
      />

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={customRange}
        onApply={(range) => {
          const { from, to } = toDateRangeStrings(range)
          useFinanceStore.getState().clearDateRange()
          updateParams({
            period: "Custom",
            periodFrom: from,
            periodTo: to,
            page: 1,
          })
        }}
      />

      <Dialog
        open={isDeleteSelectedOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteError("")
          setIsDeleteSelectedOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.size} transaction
              {selectedIds.size === 1 ? "" : "s"}?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the selected transaction
              {selectedIds.size === 1 ? "" : "s"} from the system. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteSelectedOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
