"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/common/EmptyState"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { PeriodTabs } from "@/components/soul-winning/PeriodTabs"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { getMemberOfferings, PERIODS } from "@/services/memberFinance.service"
import { toDateRangeStrings, toDatePoint } from "@/utils/helpers"
import { cn } from "@/lib/utils"
import { Receipt, ShieldCheck, Lock, X } from "lucide-react"

const ALL_TYPES = "All types"

const typeStyles = {
  Tithe: "bg-purple-50 text-purple-600",
  "First Fruit": "bg-emerald-50 text-emerald-600",
  Sacrificial: "bg-sky-50 text-sky-600",
  Thanksgiving: "bg-amber-50 text-amber-600",
  Love: "bg-rose-50 text-rose-600",
}
const defaultTypeStyle = "bg-muted text-muted-foreground"

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

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

function MemberFinancePanel({ memberId, period, dateFrom, dateTo, onPeriodChange, onApplyDateRange, onLock }) {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState(ALL_TYPES)

  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function loadOfferings() {
      setIsLoading(true)
      setError("")

      try {
        const data = await getMemberOfferings(
          memberId,
          { period, from: dateFrom, to: dateTo },
          controller.signal
        )
        if (controller.signal.aborted) return

        setRecords(data.records)
        setTotal(data.total)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to load offering records")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadOfferings()
    return () => controller.abort()
  }, [memberId, period, dateFrom, dateTo])

  function handleApplyDateRange(range) {
    onApplyDateRange(toDateRangeStrings(range))
  }

  const availableTypes = [ALL_TYPES, ...new Set(records.map((record) => record.type))]
  const visibleRecords =
    typeFilter === ALL_TYPES ? records : records.filter((record) => record.type === typeFilter)
  const visibleTotal =
    typeFilter === ALL_TYPES
      ? total
      : visibleRecords.reduce((sum, record) => sum + record.amount, 0)

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
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
        recordCount={visibleRecords.length}
        onCustomClick={() => setIsDateRangeOpen(true)}
        periods={PERIODS}
      />

      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      <Card className="rounded-2xl p-4 sm:p-5">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Total Offerings
        </p>
        <p className="mt-1 font-heading text-2xl font-normal text-foreground/85 sm:text-3xl">
          {currencyFormatter.format(visibleTotal)}
        </p>
      </Card>

      <Card className="overflow-hidden rounded-2xl p-0">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-foreground/85">Offering Records</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {visibleRecords.length}
            </span>
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-36 shrink-0 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <ListCardSkeleton rows={6} className="border-0 p-4 shadow-none sm:p-5" />
        ) : visibleRecords.length === 0 ? (
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
                  <th className="py-3 pl-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Date
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Type
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id} className="border-b border-border last:border-0">
                    <td className="py-3.5 pl-4 text-sm text-foreground/80">{formatDate(record.date)}</td>
                    <td className="py-3.5 pr-4">
                      <TypeBadge type={record.type} />
                    </td>
                    <td className="py-3.5 pr-4 text-sm font-semibold text-foreground/85">
                      {currencyFormatter.format(record.amount)}
                    </td>
                    <td className="py-3.5 pr-4 text-sm text-muted-foreground">{record.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden">
              {visibleRecords.map((record) => (
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
    </div>
  )
}

export { MemberFinancePanel }
export default MemberFinancePanel
