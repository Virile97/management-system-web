"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/common/Pagination"
import { EmptyState } from "@/components/common/EmptyState"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpRight, ArrowDownRight, Receipt, X, Calendar } from "lucide-react"

const FILTERS = ["All", "Income", "Expense"]

function pad(value) {
  return String(value).padStart(2, "0")
}

// dateFrom/dateTo are "YYYY-MM-DD" strings (or ""); the modal works in
// day/month/year numbers for a single viewed month, so this seeds its
// initial view/selection from whichever bound is set (defaulting to today).
function toModalRange(dateFrom, dateTo) {
  const seed = dateFrom ? new Date(dateFrom) : dateTo ? new Date(dateTo) : new Date()

  return {
    year: seed.getFullYear(),
    month: seed.getMonth(),
    start: dateFrom ? new Date(dateFrom).getDate() : null,
    end: dateTo ? new Date(dateTo).getDate() : null,
  }
}

// Converts the modal's { year, month, start, end } day-of-month selection
// back into "YYYY-MM-DD" from/to strings for the /transactions API.
function toDateStrings(range) {
  if (!range.start) return { from: "", to: "" }

  const from = `${range.year}-${pad(range.month + 1)}-${pad(range.start)}`
  const to = `${range.year}-${pad(range.month + 1)}-${pad(range.end ?? range.start)}`

  return { from, to }
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
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + transactions.length
  const hasDateRange = Boolean(dateFrom || dateTo)

  function handleApplyDateRange(range) {
    const { from: nextFrom, to: nextTo } = toDateStrings(range)
    onDateFromChange(nextFrom)
    onDateToChange(nextTo)
  }

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <div className="flex h-8 items-center gap-1 overflow-x-auto rounded-lg bg-white p-1 ring-1 ring-border">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
              className={cn(
                "flex h-full shrink-0 items-center rounded-md px-3 text-sm transition-colors",
                activeFilter === filter
                  ? "bg-[#1e2a4a] font-medium text-white"
                  : "font-normal text-muted-foreground hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-8 gap-1.5 rounded-lg px-3 text-sm",
              hasDateRange && "border-[#1e2a4a] text-[#1e2a4a]"
            )}
            onClick={() => setIsDateRangeOpen(true)}
          >
            <Calendar className="h-3.5 w-3.5" />
            {hasDateRange ? `${dateFrom || "…"} – ${dateTo || "…"}` : "Date Range"}
          </Button>
          {hasDateRange && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={onClearDateRange}
              aria-label="Clear date range"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="h-8 rounded-lg bg-white pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={toModalRange(dateFrom, dateTo)}
        onApply={handleApplyDateRange}
      />

      {isLoading ? (
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          {Array.from({ length: pageSize }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-20 shrink-0" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try adjusting your search or type filter."
          className="py-16"
        />
      ) : (
        <>
          <table className="hidden w-full border-collapse md:table">
            <thead>
              <tr className="border-y border-border bg-muted/60">
                <th className="py-3 pl-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Date
                </th>
                <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Description
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
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border last:border-0">
                  <td className="py-4 pl-4 text-sm text-foreground/80">
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
              ))}
            </tbody>
          </table>

          <div className="md:hidden">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-2 border-b border-border p-4 last:border-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground/85">{transaction.description}</p>
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
            ))}
          </div>
        </>
      )}

      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </Card>
  )
}

export { TransactionTable }
export default TransactionTable
