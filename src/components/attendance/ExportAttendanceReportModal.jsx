"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PrintPortal } from "@/components/common/PrintPortal"
import { AttendanceReport } from "@/components/attendance/AttendanceReport"
import { listAttendance } from "@/services/attendance.service"
import { FileDown, FileSpreadsheet, X } from "lucide-react"

const EXPORT_PAGE_SIZE = 100

function ReportPreviewSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-14 w-16 rounded-lg" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}

function escapeCsvValue(value) {
  const text = String(value ?? "")
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

function attendanceToCsv(rows) {
  const headers = [
    "Member",
    "Level",
    "Morning In",
    "Morning Out",
    "Afternoon In",
    "Afternoon Out",
    "Status",
  ]
  const body = rows.map((row) => [
    row.name || "",
    row.level || "",
    row.morningIn || "",
    row.morningOut || "",
    row.afternoonIn || "",
    row.afternoonOut || "",
    row.status || "",
  ])

  return [headers, ...body]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n")
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function fetchAllMatchingAttendance({ from, to, level, search }, signal) {
  const all = []
  let page = 1
  let totalPages = 1
  let summary = null

  do {
    const response = await listAttendance(
      {
        from,
        to,
        level: level === "All" ? "" : level,
        search,
        page,
        limit: EXPORT_PAGE_SIZE,
      },
      signal
    )
    if (signal?.aborted) return { rows: all, summary }

    if (!summary) summary = response.summary
    all.push(...response.items)
    totalPages = Math.max(1, response.meta?.totalPages || 1)
    page += 1
  } while (page <= totalPages)

  return { rows: all, summary }
}

function formatDateLabel(date) {
  if (!date) return ""
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatRangeLabel(from, to) {
  const start = formatDateLabel(from)
  const end = formatDateLabel(to)
  if (!start) return end
  if (!end || start === end) return start
  return `${start} – ${end}`
}

function ExportAttendanceReportModal({
  open,
  onOpenChange,
  dateFrom = "",
  dateTo = "",
  levelFilter = "All",
  search = "",
}) {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedAt, setGeneratedAt] = useState(() => new Date())

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()

    async function loadAttendance() {
      setIsLoading(true)
      setError("")
      setRows([])
      setSummary(null)

      try {
        const { rows: data, summary: nextSummary } =
          await fetchAllMatchingAttendance(
            {
              from: dateFrom,
              to: dateTo || dateFrom,
              level: levelFilter,
              search,
            },
            controller.signal
          )
        if (controller.signal.aborted) return
        setRows(data)
        setSummary(nextSummary)
        setGeneratedAt(new Date())
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to build attendance report")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadAttendance()
    return () => controller.abort()
  }, [open, dateFrom, dateTo, levelFilter, search])

  const dateLabel = formatRangeLabel(dateFrom, dateTo || dateFrom)
  const reportProps = {
    rows,
    summary,
    dateLabel,
    levelFilter,
    search,
    scopeLabel: "Current filters",
    generatedAt,
  }

  function handlePrint() {
    const previousTitle = document.title
    document.title = "\u00a0"

    const restoreTitle = () => {
      document.title = previousTitle
      window.removeEventListener("afterprint", restoreTitle)
    }

    window.addEventListener("afterprint", restoreTitle)
    window.print()
  }

  function handleCsv() {
    const stamp = dateTo || dateFrom || new Date().toISOString().slice(0, 10)
    downloadCsv(`attendance-report-${stamp}.csv`, attendanceToCsv(rows))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] w-[min(52rem,calc(100%-2rem))] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-208"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <FileDown className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Export Attendance Report
            </DialogTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="border-b border-border px-4 py-3 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Includes all members matching the current date range, level, and
            search filters.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50 p-4 sm:p-6">
          {isLoading && <ReportPreviewSkeleton />}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {!isLoading && !error && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <AttendanceReport {...reportProps} />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            PDF via print · CSV for spreadsheets · letter (8.5 × 11 in)
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg px-5"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2 rounded-lg px-5"
              onClick={handleCsv}
              disabled={isLoading || Boolean(error) || rows.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download CSV
            </Button>
            <Button
              type="button"
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
              onClick={handlePrint}
              disabled={isLoading || Boolean(error) || rows.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>

      {!isLoading && !error && rows.length > 0 && (
        <PrintPortal>
          <div className="print-report-page">
            <AttendanceReport {...reportProps} />
          </div>
        </PrintPortal>
      )}
    </Dialog>
  )
}

export { ExportAttendanceReportModal }
export default ExportAttendanceReportModal
