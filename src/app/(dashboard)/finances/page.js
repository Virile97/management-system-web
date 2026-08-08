"use client"

import { useEffect, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { Button } from "@/components/ui/button"
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
} from "@/services/finance.service"
import { useFinanceStore } from "@/stores/finance.store"
import { ScanLine, Plus } from "lucide-react"

const PAGE_SIZE = 10

export default function FinancesPage() {
  const [isScanQrOpen, setIsScanQrOpen] = useState(false)
  const [isRecordTransactionOpen, setIsRecordTransactionOpen] = useState(false)

  const {
    stats,
    categoryData,
    trendData,
    isSummaryLoading,
    summaryError,
    transactions,
    meta,
    page,
    activeFilter,
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
      page: state.page,
      activeFilter: state.activeFilter,
      search: state.search,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      isTableLoading: state.isTableLoading,
      tableError: state.tableError,
    }))
  )

  const debouncedSearch = useDebounce(search, 300)

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

        setTransactions(data, responseMeta || { total: data.length, totalPages: 1 })
      } catch (err) {
        if (controller.signal.aborted) return
        setTableError(err?.message || "Unable to load transactions")
      } finally {
        if (!controller.signal.aborted) setTableLoading(false)
      }
    }

    loadTransactions()
    return () => controller.abort()
  }, [page, activeFilter, debouncedSearch, dateFrom, dateTo])

  const {
    setPage,
    setActiveFilter,
    setSearch,
    setDateFrom,
    setDateTo,
    clearDateRange,
  } = useFinanceStore.getState()

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Finances
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track income and expenses for your church
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
            onFilterChange={setActiveFilter}
            search={search}
            onSearchChange={setSearch}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onClearDateRange={clearDateRange}
            page={page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ScanQRModal open={isScanQrOpen} onOpenChange={setIsScanQrOpen} />
      <RecordTransactionModal
        open={isRecordTransactionOpen}
        onOpenChange={setIsRecordTransactionOpen}
      />
    </div>
  )
}
