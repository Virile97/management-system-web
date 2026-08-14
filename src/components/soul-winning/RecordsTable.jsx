"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SortableTh } from "@/components/common/SortableTh"
import { Pagination } from "@/components/common/Pagination"
import { useTableSort } from "@/hooks/use-table-sort"
import { cn } from "@/lib/utils"
import { Droplets } from "lucide-react"

const statusStyles = {
  "New Convert": "bg-[#1e2a4a]/10 text-[#1e2a4a]",
  "Active Member": "bg-emerald-50 text-emerald-600",
  Inactive: "bg-amber-50 text-amber-600",
}

const dotStyles = {
  "New Convert": "bg-[#1e2a4a]",
  "Active Member": "bg-emerald-500",
  Inactive: "bg-amber-500",
}

const SORT_COLUMNS = {
  date: { get: (row) => row.date, type: "date" },
  convert: { get: (row) => row.convertName, type: "string" },
  contact: { get: (row) => row.contact, type: "string" },
  soulWinner: { get: (row) => row.soulWinnerName, type: "string" },
  status: { get: (row) => row.status, type: "string" },
  notes: { get: (row) => row.notes, type: "string" },
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatDisplayDate(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        statusStyles[status] || "bg-muted text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotStyles[status] || "bg-muted-foreground"
        )}
      />
      {status}
    </span>
  )
}

function RecordsTable({
  records = [],
  isLoading = false,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onBaptize,
}) {
  const { sortedRows, sortKey, sortDirection, toggleSort } = useTableSort(
    records,
    SORT_COLUMNS,
    { initialKey: "date", initialDirection: "desc" }
  )

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (isLoading) {
    return (
      <Card className="rounded-2xl p-8">
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <SortableTh
              label="Date"
              sortKey="date"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={toggleSort}
              className="pl-4"
            />
            <SortableTh
              label="Convert"
              sortKey="convert"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={toggleSort}
            />
            <SortableTh
              label="Contact"
              sortKey="contact"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={toggleSort}
            />
            <SortableTh
              label="Soul Winner"
              sortKey="soulWinner"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={toggleSort}
            />
            <SortableTh
              label="Status"
              sortKey="status"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={toggleSort}
            />
            <SortableTh
              label="Notes"
              sortKey="notes"
              activeKey={sortKey}
              direction={sortDirection}
              onSort={toggleSort}
            />
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((record) => (
            <tr
              key={record.id}
              className="border-b border-border last:border-0"
            >
              <td className="py-4 pl-4 align-top text-sm text-foreground/80">
                {formatDisplayDate(record.date)}
              </td>
              <td className="py-4 pr-4 align-top">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
                    {initials(record.convertName)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/85">
                      {record.convertName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {record.location || "—"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 pr-4 align-top text-sm text-foreground/80">
                {record.contact || "—"}
              </td>
              <td className="py-4 pr-4 align-top">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-semibold text-[#1e2a4a]">
                    {initials(record.soulWinnerName)}
                  </div>
                  <span className="text-sm text-foreground/80">
                    {record.soulWinnerName}
                  </span>
                </div>
              </td>
              <td className="py-4 pr-4 align-top">
                <StatusBadge status={record.status} />
              </td>
              <td className="py-4 pr-4 align-top text-sm text-foreground/70">
                {record.notes || "—"}
              </td>
              <td className="py-4 pr-4 align-top">
                {record.canBaptize ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
                    onClick={() => onBaptize?.(record)}
                  >
                    <Droplets className="h-3.5 w-3.5" />
                    Baptize
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden">
        {sortedRows.map((record) => (
          <div
            key={record.id}
            className="flex flex-col gap-2.5 border-b border-border px-3 py-4 last:border-0 sm:px-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
                  {initials(record.convertName)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground/85">
                    {record.convertName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {record.location || "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDisplayDate(record.date)}
                  </p>
                </div>
              </div>
              <StatusBadge status={record.status} />
            </div>

            <div className="grid grid-cols-1 gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Contact</span>
                <span className="truncate text-foreground/80">
                  {record.contact || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">Soul Winner</span>
                <span className="truncate text-foreground/80">
                  {record.soulWinnerName}
                </span>
              </div>
              {record.notes ? (
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="mt-0.5 text-foreground/70">{record.notes}</p>
                </div>
              ) : null}
            </div>

            {record.canBaptize ? (
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-1.5 rounded-lg"
                onClick={() => onBaptize?.(record)}
              >
                <Droplets className="h-3.5 w-3.5" />
                Mark as Baptized
              </Button>
            ) : null}
          </div>
        ))}
      </div>

      {records.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No records found.
        </div>
      )}

      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </Card>
  )
}

export { RecordsTable }
export default RecordsTable
