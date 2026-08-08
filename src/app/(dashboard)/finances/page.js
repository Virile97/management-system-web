"use client"

import { Suspense, useEffect, useState } from "react"
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
import { CategoryChart } from "@/components/finances/CategoryChart"
import { TransactionTable } from "@/components/finances/TransactionTable"
import { ScanQRModal } from "@/components/finances/ScanQRModal"
import { RecordTransactionModal } from "@/components/finances/RecordTransactionModal"
import { useDebounce } from "@/hooks/useDebounce"
import {
  getFinanceStats,
  getFinanceByCategory,
  getFinanceTrend,
  listTransactions,
  bulkDeleteTransactions,
} from "@/services/finance.service"
import { useFinanceStore } from "@/stores/finance.store"
import { ScanLine, Plus } from "lucide-react"

const PAGE_SIZE = 10
const DEFAULT_FILTER = "All"

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
  const activeFilter = searchParams.get("type") || DEFAULT_FILTER

  const [isScanQrOpen, setIsScanQrOpen] = useState(false)
  const [isRecordTransactionOpen, setIsRecordTransactionOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    stats,
    categoryData,
    trendData,
    isSummaryLoading,
    summaryError,
    transactions,
    meta,
    search,
    dateFrom,
    dateTo,
    isTableLoading,
    tableError,
  } = useFinanceStore(
    useShallow((state) => ({
      stats: state.stats,
      categoryData: state.categoryData,
      trendData: state.trendData,
      isSummaryLoading: state.isSummaryLoading,
      summaryError: state.summaryError,
      transactions: state.transactions,
      meta: state.meta,
      search: state.search,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      isTableLoading: state.isTableLoading,
      tableError: state.tableError,
    }))
  )

  const debouncedSearch = useDebounce(search, 300)

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams)

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === DEFAULT_FILTER || (key === "page" && value <= 1)) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    }

    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false })
  }

  function goToPage(nextPage) {
    updateParams({ page: nextPage })
  }

  // Stats/category/trend rarely change within a visit, so they're fetched
  // once on mount rather than re-fetched alongside the transaction table.
  useEffect(() => {
    const controller = new AbortController()

    const { setStats, setCategoryData, setTrendData, setSummaryLoading, setSummaryError } =
      useFinanceStore.getState()

    async function loadSummary() {
      setSummaryLoading(true)
      setSummaryError("")

      const [statsResult, categoryResult, trendResult] = await Promise.allSettled([
        getFinanceStats(controller.signal),
        getFinanceByCategory(controller.signal),
        getFinanceTrend({ range: "6m" }, controller.signal),
      ])
      if (controller.signal.aborted) return

      if (statsResult.status === "fulfilled") setStats(statsResult.value)
      if (categoryResult.status === "fulfilled") setCategoryData(categoryResult.value)
      if (trendResult.status === "fulfilled") setTrendData(trendResult.value)

      const failed = [statsResult, categoryResult, trendResult].find((r) => r.status === "rejected")
      if (failed) setSummaryError(failed.reason?.message || "Unable to load finance summary")

      setSummaryLoading(false)
    }

    loadSummary()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const { setTransactions, setTableLoading, setTableError } = useFinanceStore.getState()

    async function loadTransactions() {
      setTableLoading(true)
      setTableError("")
      try {
        const { data, meta: responseMeta } = await listTransactions(
          {
            page,
            limit: PAGE_SIZE,
            type: activeFilter === "All" ? "" : activeFilter,
            search: debouncedSearch,
            from: dateFrom,
            to: dateTo,
          },
          controller.signal
        )
        if (controller.signal.aborted) return

        const resolvedMeta = responseMeta || { total: data.length, totalPages: 1 }

        // The current page can outlive its own data (e.g. a filter/date range
        // shrinks the result set) — snap back to a valid page instead of
        // getting stuck on one that no longer exists.
        if (page > 1 && page > resolvedMeta.totalPages) {
          goToPage(Math.max(1, resolvedMeta.totalPages))
          return
        }

        setTransactions(data, resolvedMeta)
      } catch (err) {
        if (controller.signal.aborted) return
        setTableError(err?.message || "Unable to load transactions")
      } finally {
        if (!controller.signal.aborted) setTableLoading(false)
      }
    }

    loadTransactions()
    return () => controller.abort()
  }, [page, activeFilter, debouncedSearch, dateFrom, dateTo, refreshKey])

  const { setSearch, setDateFrom, setDateTo, clearDateRange } = useFinanceStore.getState()

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
    setSelectedIds((prev) => {
      const next = new Set(prev)

      if (next.has(transaction.id)) {
        next.delete(transaction.id)
      } else {
        next.add(transaction.id)
      }

      return next
    })
  }

  function toggleSelectAll(pageRows) {
    setSelectedIds((prev) => {
      const allSelected = pageRows.every((transaction) => prev.has(transaction.id))
      const next = new Set(prev)

      pageRows.forEach((transaction) => {
        if (allSelected) {
          next.delete(transaction.id)
        } else {
          next.add(transaction.id)
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
      setSelectedIds(new Set())
      setIsDeleteSelectedOpen(false)
      setRefreshKey((key) => key + 1)
    } catch (err) {
      setDeleteError(err?.message || "Unable to delete selected transactions")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Finances
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Income and Expenses
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              className="h-10 gap-2 rounded-lg bg-amber-400 px-4 text-[#1e2a4a] hover:bg-amber-400/90"
              onClick={() => setIsScanQrOpen(true)}
            >
              <ScanLine className="h-4 w-4" />
              Scan QR Offering
            </Button>
            <Button
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90"
              onClick={() => setIsRecordTransactionOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Record Transaction
            </Button>
          </div>
        </div>

        {summaryError && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {summaryError}
          </p>
        )}

        <div className="mt-6">
          <FinanceCards stats={stats} isLoading={isSummaryLoading} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[3fr_2fr]">
          <MonthlyTrendChart data={trendData} isLoading={isSummaryLoading} />
          <CategoryChart data={categoryData} isLoading={isSummaryLoading} />
        </div>

        {tableError && (
          <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {tableError}
          </p>
        )}

        <div className="mt-6">
          <TransactionTable
            transactions={transactions}
            isLoading={isTableLoading}
            activeFilter={activeFilter}
            onFilterChange={updateFilter}
            search={search}
            onSearchChange={updateSearch}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={updateDateFrom}
            onDateToChange={updateDateTo}
            onClearDateRange={updateClearDateRange}
            selected={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onDeleteSelected={() => setIsDeleteSelectedOpen(true)}
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={PAGE_SIZE}
            onPageChange={goToPage}
          />
        </div>
      </div>

      <ScanQRModal open={isScanQrOpen} onOpenChange={setIsScanQrOpen} />
      <RecordTransactionModal
        open={isRecordTransactionOpen}
        onOpenChange={setIsRecordTransactionOpen}
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
              Delete {selectedIds.size} transaction{selectedIds.size === 1 ? "" : "s"}?
            </DialogTitle>
            <DialogDescription>
              This will permanently remove the selected transaction
              {selectedIds.size === 1 ? "" : "s"} from the system. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
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
