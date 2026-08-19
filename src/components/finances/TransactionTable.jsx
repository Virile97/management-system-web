"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableShell } from "@/components/common/DataTableShell"
import { SortableTh } from "@/components/common/SortableTh"
import { FilterPills } from "@/components/common/FilterPills"
import { DateRangeButton } from "@/components/common/DateRangeButton"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { useTableSort } from "@/hooks/use-table-sort"
import { cn } from "@/lib/utils"
import { toDateRangeStrings, toDatePoint, formatDateRangeLabel } from "@/utils/helpers"
import { Button } from "@/components/ui/button"
import {
  Search,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Trash2,
  Pencil,
} from "lucide-react"

const FILTERS = ["All", "Income", "Expense"]

const SORT_COLUMNS = {
  date: { get: (row) => row.createdAt, type: "date" },
  note: { get: (row) => row.description, type: "string" },
  category: { get: (row) => row.category, type: "string" },
  recordedBy: { get: (row) => row.recordedBy, type: "string" },
  type: { get: (row) => row.type, type: "string" },
  amount: { get: (row) => row.amount, type: "number" },
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

const categoryStyles = {
  Tithe:
    "bg-[#1e2a4a]/10 text-[#1e2a4a] dark:bg-slate-700/60 dark:text-slate-200",
  Offering:
    "bg-[#1e2a4a]/10 text-[#1e2a4a] dark:bg-slate-700/60 dark:text-slate-200",
  Utilities:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Maintenance:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  Salaries: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  Donation:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
}
const defaultCategoryStyle = "bg-muted text-muted-foreground"

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

function TransactionTable({
  transactions,
  isLoading,
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  dateFilterDisabled = false,
  onDateFromChange,
  onDateToChange,
  onClearDateRange,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteSelected,
  onDelete,
  onEdit,
  deletingIds,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const { sortedRows, sortKey, sortDirection, toggleSort } = useTableSort(
    transactions,
    SORT_COLUMNS,
    { initialKey: "date", initialDirection: "desc" }
  )

  const selectedCount = selected?.size ?? 0
  const hasDateRange = Boolean(dateFrom || dateTo)
  const hasActiveFilters =
    activeFilter !== "All" || Boolean(search) || hasDateRange
  // Nothing to filter — no transactions exist at all (not just for the
  // current filter combination) — so disable the controls rather than let
  // the user open filters with no possible effect.
  const filtersDisabled = total === 0 && !hasActiveFilters

  function handleApplyDateRange(range) {
    const { from: nextFrom, to: nextTo } = toDateRangeStrings(range)
    onDateFromChange(nextFrom)
    onDateToChange(nextTo)
  }

  const toolbar = (
    <>
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:p-4">
        <div className="relative order-1 w-full sm:order-3 sm:ml-auto sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className={cn("h-10 rounded-lg bg-card pl-9", search && "pr-9")}
            value={search}
            disabled={filtersDisabled}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {search ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              disabled={filtersDisabled}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="order-2 flex min-w-0 flex-col gap-2 sm:order-1 sm:flex-row sm:items-center sm:gap-3">
          <FilterPills
            options={FILTERS}
            active={activeFilter}
            onChange={onFilterChange}
            disabled={filtersDisabled}
          />

          <DateRangeButton
            hasRange={hasDateRange}
            label={
              hasDateRange
                ? formatDateRangeLabel({
                    start: toDatePoint(dateFrom),
                    end: toDatePoint(dateTo),
                  })
                : null
            }
            disabled={filtersDisabled || dateFilterDisabled}
            clearable={!dateFilterDisabled}
            onOpen={() => setIsDateRangeOpen(true)}
            onClear={onClearDateRange}
            className="w-full justify-start sm:w-auto"
          />
        </div>

        {selectedCount > 0 && (
          <Button
            type="button"
            variant="outline"
            className="order-3 h-10 w-full gap-1.5 rounded-lg border-destructive/30 px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive sm:order-4 sm:ml-0 sm:w-auto"
            onClick={onDeleteSelected}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected ({selectedCount})
          </Button>
        )}
      </div>

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={toModalRange(dateFrom, dateTo)}
        hasSelection={hasDateRange}
        onApply={handleApplyDateRange}
      />
    </>
  )

  return (
    <DataTableShell
      rows={sortedRows}
      isLoading={isLoading}
      toolbar={toolbar}
      emptyIcon={Receipt}
      emptyTitle="No transactions found"
      emptyDescription="Try adjusting your search or type filter."
      enableSelection
      selected={selected}
      onToggleSelect={onToggleSelect}
      onToggleSelectAll={onToggleSelectAll}
      renderTableHead={(selection) => (
        <tr className="border-y border-border bg-muted/60">
          <th className="w-10 py-3 pl-4">
            <Checkbox
              checked={selection.allSelected}
              onCheckedChange={selection.onToggleAll}
            />
          </th>
          <SortableTh
            label="Date"
            sortKey="date"
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
          <SortableTh
            label="Category"
            sortKey="category"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={toggleSort}
          />
          <SortableTh
            label="Recorded By"
            sortKey="recordedBy"
            activeKey={sortKey}
            direction={sortDirection}
            onSort={toggleSort}
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
            align="right"
          />
          <th className="py-3 pr-4 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Actions
          </th>
        </tr>
      )}
      renderDesktopRows={(rows, selection) =>
        rows.map((transaction) => {
          const isDeleting = deletingIds?.has(transaction.id)

          return (
          <tr
            key={transaction.id}
            className={cn(
              "border-b border-border last:border-0",
              isDeleting && "pointer-events-none opacity-50"
            )}
            aria-busy={isDeleting || undefined}
          >
            <td className="w-10 py-4 pl-4">
              <Checkbox
                checked={selection.isSelected(transaction)}
                onCheckedChange={() => selection.toggle(transaction)}
                disabled={isDeleting}
              />
            </td>
            <td className="py-4 pr-4 text-sm text-foreground/80">
              {formatDate(transaction.createdAt)}
            </td>
            <td className="py-4 pr-4 text-sm font-medium text-foreground/85">
              {transaction.description}
            </td>
            <td className="py-4 pr-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  categoryStyles[transaction.category] || defaultCategoryStyle
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {transaction.category}
              </span>
            </td>
            <td className="py-4 pr-4 text-sm text-foreground/80">
              {transaction.recordedBy}
            </td>
            <td className="py-4 pr-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium",
                  transaction.type === "Income"
                    ? "text-emerald-600"
                    : "text-red-500"
                )}
              >
                {transaction.type === "Income" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {transaction.type}
              </span>
            </td>
            <td
              className={cn(
                "py-4 pr-4 text-right text-sm font-semibold",
                transaction.amount > 0 ? "text-emerald-600" : "text-red-500"
              )}
            >
              {transaction.amount > 0 ? "+" : "-"}
              {currencyFormatter.format(Math.abs(transaction.amount))}
            </td>
            <td className="py-4 pr-4 text-right">
              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => onEdit?.(transaction)}
                  disabled={isDeleting}
                  aria-label={`Edit ${transaction.description || "transaction"}`}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(transaction)}
                  disabled={isDeleting}
                  aria-label={`Delete ${transaction.description || "transaction"}`}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
          )
        })
      }
      renderMobileRows={(rows, selection) =>
        rows.map((transaction) => {
          const isDeleting = deletingIds?.has(transaction.id)

          return (
          <div
            key={transaction.id}
            className={cn(
              "flex flex-col gap-2.5 border-b border-border px-3 py-4 last:border-0 sm:px-4",
              isDeleting && "pointer-events-none opacity-50"
            )}
            aria-busy={isDeleting || undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <Checkbox
                  className="mt-0.5"
                  checked={selection.isSelected(transaction)}
                  onCheckedChange={() => selection.toggle(transaction)}
                  disabled={isDeleting}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground/85">
                    {transaction.description}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(transaction.createdAt)}
                    {transaction.recordedBy
                      ? ` · ${transaction.recordedBy}`
                      : ""}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 text-right text-sm font-semibold tabular-nums",
                  transaction.amount > 0 ? "text-emerald-600" : "text-red-500"
                )}
              >
                {transaction.amount > 0 ? "+" : "-"}
                {currencyFormatter.format(Math.abs(transaction.amount))}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pl-7">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                    categoryStyles[transaction.category] || defaultCategoryStyle
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {transaction.category}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium",
                    transaction.type === "Income"
                      ? "text-emerald-600"
                      : "text-red-500"
                  )}
                >
                  {transaction.type === "Income" ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {transaction.type}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit?.(transaction)}
                  disabled={isDeleting}
                  aria-label={`Edit ${transaction.description || "transaction"}`}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(transaction)}
                  disabled={isDeleting}
                  aria-label={`Delete ${transaction.description || "transaction"}`}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          )
        })
      }
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  )
}

export { TransactionTable }
export default TransactionTable
