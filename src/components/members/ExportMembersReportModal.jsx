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
import { MembersDirectoryReport } from "@/components/members/MembersDirectoryReport"
import { listMembers } from "@/services/member.service"
import { cn } from "@/lib/utils"
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
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
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

function membersToCsv(members) {
  const headers = ["Name", "Email", "Phone", "Status", "Group", "Baptized"]
  const rows = members.map((member) => [
    member.name || "",
    member.email || "",
    member.phone || member.contact || "",
    member.status || "",
    member.group || "",
    member.baptized || "",
  ])

  return [headers, ...rows]
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

async function fetchAllMatchingMembers({ status, search, from, to }, signal) {
  const all = []
  let page = 1
  let totalPages = 1

  do {
    const { data, meta } = await listMembers(
      {
        page,
        limit: EXPORT_PAGE_SIZE,
        status: status === "All" ? "" : status,
        search,
        from,
        to,
      },
      signal
    )
    if (signal?.aborted) return all

    all.push(...data)
    totalPages = Math.max(1, meta?.totalPages || 1)
    page += 1
  } while (page <= totalPages)

  return all
}

function ExportMembersReportModal({
  open,
  onOpenChange,
  statusFilter = "All",
  search = "",
  dateFrom = "",
  dateTo = "",
  dateRangeLabel = "",
  selectedMembers = [],
}) {
  const hasSelection = selectedMembers.length > 0
  const [scope, setScope] = useState(hasSelection ? "selected" : "filtered")
  const [members, setMembers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedAt, setGeneratedAt] = useState(() => new Date())

  const selectedKey = selectedMembers.map((member) => member.id).join(",")

  useEffect(() => {
    if (!open) return
    setScope(hasSelection ? "selected" : "filtered")
  }, [open, hasSelection])

  useEffect(() => {
    if (!open) return

    if (scope === "selected") {
      setMembers(selectedMembers)
      setError("")
      setIsLoading(false)
      setGeneratedAt(new Date())
      return
    }

    const controller = new AbortController()

    async function loadMembers() {
      setIsLoading(true)
      setError("")
      setMembers([])

      try {
        const data = await fetchAllMatchingMembers(
          { status: statusFilter, search, from: dateFrom, to: dateTo },
          controller.signal
        )
        if (controller.signal.aborted) return
        setMembers(data)
        setGeneratedAt(new Date())
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to build members report")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadMembers()
    return () => controller.abort()
    // selectedMembers is only read for the "selected" scope branch above;
    // selectedKey keeps that branch stable without depending on array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scope, statusFilter, search, dateFrom, dateTo, selectedKey])

  const scopeLabel =
    scope === "selected"
      ? `Selected members (${selectedMembers.length})`
      : "Current filters"

  const reportProps = {
    members,
    statusFilter,
    search,
    dateRangeLabel,
    scopeLabel,
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
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`members-directory-${stamp}.csv`, membersToCsv(members))
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
              Export Members Report
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
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Include
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScope("filtered")}
              className={cn(
                "h-8 rounded-lg border px-3 text-sm transition-colors",
                scope === "filtered"
                  ? "border-[#1e2a4a] bg-[#1e2a4a] text-white"
                  : "border-border bg-background text-foreground/80 hover:bg-muted"
              )}
            >
              Current filters
            </button>
            <button
              type="button"
              onClick={() => setScope("selected")}
              disabled={!hasSelection}
              className={cn(
                "h-8 rounded-lg border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                scope === "selected"
                  ? "border-[#1e2a4a] bg-[#1e2a4a] text-white"
                  : "border-border bg-background text-foreground/80 hover:bg-muted"
              )}
            >
              Selected only{hasSelection ? ` (${selectedMembers.length})` : ""}
            </button>
          </div>
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
              <MembersDirectoryReport {...reportProps} />
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
              disabled={isLoading || Boolean(error) || members.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download CSV
            </Button>
            <Button
              type="button"
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
              onClick={handlePrint}
              disabled={isLoading || Boolean(error) || members.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>

      {!isLoading && !error && members.length > 0 && (
        <PrintPortal>
          <div className="print-report-page">
            <MembersDirectoryReport {...reportProps} />
          </div>
        </PrintPortal>
      )}
    </Dialog>
  )
}

export { ExportMembersReportModal }
export default ExportMembersReportModal
