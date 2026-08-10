"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableShell } from "@/components/common/DataTableShell"
import { FilterPills } from "@/components/common/FilterPills"
import { DateRangeButton } from "@/components/common/DateRangeButton"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { cn } from "@/lib/utils"
import { toDateRangeStrings, toDatePoint } from "@/utils/helpers"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpRight, ArrowDownRight, Receipt, Trash2 } from "lucide-react"

const FILTERS = ["All", "Income", "Expense"]

// dateFrom/dateTo are "YYYY-MM-DD" strings (or ""); this seeds the modal's
// initial view/selection from whichever bound is set (defaulting to today).
function toModalRange(dateFrom, dateTo) {
  const seed = dateFrom ? new Date(dateFrom) : dateTo ? new Date(dateTo) : new Date()

  return {
    year: seed.getFullYear(),
    month: seed.getMonth(),
    start: toDatePoint(dateFrom),
    end: toDatePoint(dateTo),
  }
}

const categoryStyles = {
  Tithe: "bg-[#1e2a4a]/10 text-[#1e2a4a]",
  Offering: "bg-[#1e2a4a]/10 text-[#1e2a4a]",
  Utilities: "bg-amber-50 text-amber-600",
  Maintenance: "bg-amber-50 text-amber-700",
  Salaries: "bg-red-50 text-red-600",
  Donation: "bg-amber-50 text-amber-600",
}
const defaultCategoryStyle = "bg-muted text-muted-foreground"

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
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
  onDateFromChange,
  onDateToChange,
  onClearDateRange,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onDeleteSelected,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)

  const selectedCount = selected?.size ?? 0
  const hasDateRange = Boolean(dateFrom || dateTo)
  const hasActiveFilters = activeFilter !== "All" || Boolean(search) || hasDateRange
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
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <FilterPills
          options={FILTERS}
          active={activeFilter}
          onChange={onFilterChange}
          disabled={filtersDisabled}
        />

        <DateRangeButton
          hasRange={hasDateRange}
          label={hasDateRange ? `${dateFrom || "…"} – ${dateTo || "…"}` : null}
          disabled={filtersDisabled}
          onOpen={() => setIsDateRangeOpen(true)}
          onClear={onClearDateRange}
          className="h-8"
        />

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="h-8 rounded-lg bg-white pl-9"
            value={search}
            disabled={filtersDisabled}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        {selectedCount > 0 && (
          <Button
            type="button"
            variant="outline"
            className="h-8 gap-1.5 rounded-lg border-destructive/30 px-3 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive sm:ml-auto"
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
        onApply={handleApplyDateRange}
      />
    </>
  )

  return (
    <DataTableShell
      rows={transactions}
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
            <Checkbox checked={selection.allSelected} onCheckedChange={selection.onToggleAll} />
          </th>
          <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Date
          </th>
          <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Note
          </th>
          <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Category
          </th>
          <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Recorded By
          </th>
          <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Type
          </th>
          <th className="py-3 pr-4 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Amount
          </th>
        </tr>
      )}
      renderDesktopRows={(rows, selection) =>
        rows.map((transaction) => (
          <tr key={transaction.id} className="border-b border-border last:border-0">
            <td className="w-10 py-4 pl-4">
              <Checkbox
                checked={selection.isSelected(transaction)}
                onCheckedChange={() => selection.toggle(transaction)}
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
            <td className="py-4 pr-4 text-sm text-foreground/80">{transaction.recordedBy}</td>
            <td className="py-4 pr-4">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-medium",
                  transaction.type === "Income" ? "text-emerald-600" : "text-red-500"
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
          </tr>
        ))
      }
      renderMobileRows={(rows, selection) =>
        rows.map((transaction) => (
          <div
            key={transaction.id}
            className="flex flex-col gap-2 border-b border-border p-4 last:border-0"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <Checkbox
                  className="mt-0.5"
                  checked={selection.isSelected(transaction)}
                  onCheckedChange={() => selection.toggle(transaction)}
                />
                <p className="text-sm font-medium text-foreground/85">{transaction.description}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-right text-sm font-semibold",
                  transaction.amount > 0 ? "text-emerald-600" : "text-red-500"
                )}
              >
                {transaction.amount > 0 ? "+" : "-"}
                {currencyFormatter.format(Math.abs(transaction.amount))}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
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
                  transaction.type === "Income" ? "text-emerald-600" : "text-red-500"
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

            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{formatDate(transaction.createdAt)}</span>
              <span>{transaction.recordedBy}</span>
            </div>
          </div>
        ))
      }
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
    />
  )
}

export { TransactionTable }
export default TransactionTable
