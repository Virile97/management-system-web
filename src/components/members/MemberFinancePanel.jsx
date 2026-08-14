"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common/EmptyState"
import { MultiSelectDropdown } from "@/components/common/MultiSelectDropdown"
import { Pagination } from "@/components/common/Pagination"
import { SortableTh } from "@/components/common/SortableTh"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { useTableSort } from "@/hooks/use-table-sort"
import { Skeleton } from "@/components/ui/skeleton"
import { PeriodTabs } from "@/components/soul-winning/PeriodTabs"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { ExportMonthlyOfferingsModal } from "@/components/members/ExportMonthlyOfferingsModal"
import { getMemberOfferings, PERIODS } from "@/services/memberFinance.service"
import { getTransactionsConfig } from "@/services/finance.service"
import { useFinanceStore } from "@/stores/finance.store"
import { toDateRangeStrings, toDatePoint } from "@/utils/helpers"
import { DEFAULT_PAGE_SIZE } from "@/utils/constants"
import { cn } from "@/lib/utils"
import { Receipt, ShieldCheck, Lock, X, FileDown } from "lucide-react"

// Matches the offerings API default (max 100). Paging is by transaction, so a
// page can return slightly more line items when a txn has a multi-type split.

const OFFERING_SORT_COLUMNS = {
  date: { get: (row) => row.date, type: "date" },
  type: { get: (row) => row.type, type: "string" },
  amount: { get: (row) => row.amount, type: "number" },
  note: { get: (row) => row.note, type: "string" },
}

const typeStyles = {
  Tithe: "bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  "First Fruit":
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  Sacrificial: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  Thanksgiving:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Love: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
}
const defaultTypeStyle = "bg-muted text-muted-foreground"

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// dateFrom/dateTo are "YYYY-MM-DD" strings (or ""); this seeds the modal's
// initial view/selection from whichever bound is set (defaulting to today).
function toModalRange(dateFrom, dateTo) {
  const seed = dateFrom
    ? new Date(dateFrom)
    : dateTo
      ? new Date(dateTo)
      : new Date()

  return {
    year: seed.getFullYear(),
    month: seed.getMonth(),
    start: toDatePoint(dateFrom),
    end: toDatePoint(dateTo),
  }
}

function TypeBadge({ type }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        typeStyles[type] || defaultTypeStyle
      )}
    >
      {type}
    </span>
  )
}

function MemberFinancePanel({
  memberId,
  memberName,
  period,
  dateFrom,
  dateTo,
  offeringTypeIds,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  onPeriodChange,
  onApplyDateRange,
  onOfferingTypesChange,
  onPageChange,
  onPageSizeChange,
  onLock,
}) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // The dropdown's options come from the shared transactions config rather
  // than from the rows on screen: filtering by a type must not shrink the list
  // of types you can switch to.
  const offeringTypes =
    useFinanceStore((state) => state.config?.offeringTypes) ?? []
  const offeringTypeNames = offeringTypes.map((type) => type.name)
  // MultiSelectDropdown works with display labels; map selected ids ↔ names
  // so the URL/API keep using stable config ids.
  const selectedTypeNames = offeringTypes
    .filter((type) => offeringTypeIds.includes(type.id))
    .map((type) => type.name)
  const offeringTypeKey = offeringTypeIds.join(",")

  useEffect(() => {
    const controller = new AbortController()

    const { config, setConfig, setConfigLoading, setConfigError } =
      useFinanceStore.getState()
    if (config) return

    async function loadConfig() {
      setConfigLoading(true)
      setConfigError("")

      try {
        const data = await getTransactionsConfig(controller.signal)
        if (controller.signal.aborted) return
        setConfig(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setConfigError(err?.message || "Unable to load offering types")
      } finally {
        if (!controller.signal.aborted) setConfigLoading(false)
      }
    }

    loadConfig()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadOfferings() {
      setIsLoading(true)
      setError("")

      try {
        const data = await getMemberOfferings(
          memberId,
          {
            period,
            from: dateFrom,
            to: dateTo,
            offeringTypeIds,
            page,
            limit: pageSize,
          },
          controller.signal
        )
        if (controller.signal.aborted) return

        const resolvedMeta = data.meta || { total: 0, totalPages: 1 }

        // The current page can outlive its own data (e.g. a narrower period
        // or type shrinks the result set) — snap back instead of sitting on
        // an empty page.
        if (page > 1 && page > resolvedMeta.totalPages) {
          onPageChange(Math.max(1, resolvedMeta.totalPages))
          return
        }

        setRecords(data.records)
        setTotal(data.total)
        setTotalRecords(data.totalRecords)
        setMeta(resolvedMeta)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to load offering records")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadOfferings()
    return () => controller.abort()
  }, [memberId, period, dateFrom, dateTo, offeringTypeKey, page, pageSize])

  function handleApplyDateRange(range) {
    onApplyDateRange(toDateRangeStrings(range))
  }

  function handleOfferingTypesChange(names) {
    // Empty and "everything checked" are the same filter — drop the param so
    // the request stays unscoped and the URL stays short.
    if (names.length === 0 || names.length === offeringTypes.length) {
      onOfferingTypesChange([])
      return
    }

    const ids = offeringTypes
      .filter((type) => names.includes(type.name))
      .map((type) => type.id)
    onOfferingTypesChange(ids)
  }

  // Footer range is keyed off transaction paging (meta.total), not the
  // flattened line-item count — a page can hold slightly more items than
  // pageSize when a transaction splits across offering types.
  const pageFrom = meta.total === 0 ? 0 : (page - 1) * pageSize + 1
  const pageTo = Math.min(page * pageSize, meta.total)
  const { sortedRows, sortKey, sortDirection, toggleSort } = useTableSort(
    records,
    OFFERING_SORT_COLUMNS,
    { initialKey: "date", initialDirection: "desc" }
  )

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <p className="flex items-center gap-2 text-sm text-emerald-700">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Financial breakdown unlocked for this session
        </p>

        <button
          type="button"
          onClick={onLock}
          className="flex shrink-0 items-center gap-1 text-sm text-emerald-700/80 hover:text-emerald-800"
        >
          <Lock className="h-3.5 w-3.5" />
          Lock
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <PeriodTabs
        active={period}
        onChange={onPeriodChange}
        recordCount={totalRecords}
        onCustomClick={() => setIsDateRangeOpen(true)}
        periods={PERIODS}
      />

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card className="rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Total Offerings
            </p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-36 sm:h-9" />
            ) : (
              <p className="mt-1 font-heading text-2xl font-normal text-foreground/85 sm:text-3xl">
                {currencyFormatter.format(total)}
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 gap-2 rounded-lg bg-card text-foreground hover:bg-card"
            onClick={() => setIsExportOpen(true)}
            disabled={isLoading}
          >
            <FileDown className="h-4 w-4" />
            Export Monthly Report
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl p-0">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground/85">
              Offering Records
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {totalRecords}
            </span>
          </div>

          <MultiSelectDropdown
            label="Offering Type"
            options={offeringTypeNames}
            selected={selectedTypeNames}
            onChange={handleOfferingTypesChange}
          />
        </div>

        {isLoading ? (
          <ListCardSkeleton
            rows={6}
            className="border-0 p-4 shadow-none sm:p-5"
          />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No offering records"
            description="Try a different period or offering type."
            className="py-14"
          />
        ) : (
          <>
            <table className="hidden w-full border-collapse md:table">
              <thead>
                <tr className="border-y border-border bg-muted/60">
                  <SortableTh
                    label="Date"
                    sortKey="date"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    className="pl-4"
                  />
                  <SortableTh
                    label="Type"
                    sortKey="type"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <SortableTh
                    label="Amount"
                    sortKey="amount"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                  <SortableTh
                    label="Note"
                    sortKey="note"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                  />
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-3.5 pl-4 text-sm text-foreground/80">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <TypeBadge type={record.type} />
                    </td>
                    <td className="py-3.5 pr-4 text-sm font-semibold text-foreground/85">
                      {currencyFormatter.format(record.amount)}
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-muted-foreground">
                      {record.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden">
              {sortedRows.map((record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-2 border-b border-border p-4 last:border-0"
                >
                  <div className="flex items-center justify-between gap-3">
                    <TypeBadge type={record.type} />
                    <span className="text-sm font-semibold text-foreground/85">
                      {currencyFormatter.format(record.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{formatDate(record.date)}</span>
                    <span>{record.note || "—"}</span>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={Math.max(1, meta.totalPages)}
              from={pageFrom}
              to={pageTo}
              total={meta.total}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </>
        )}
      </Card>

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={toModalRange(dateFrom, dateTo)}
        hasSelection={Boolean(dateFrom || dateTo)}
        onApply={handleApplyDateRange}
      />

      <ExportMonthlyOfferingsModal
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
        memberId={memberId}
        memberName={memberName}
        period={period}
        dateFrom={dateFrom}
        dateTo={dateTo}
        offeringTypeIds={offeringTypeIds}
        offeringTypeLabels={selectedTypeNames}
      />
    </div>
  )
}

export { MemberFinancePanel }
export default MemberFinancePanel
