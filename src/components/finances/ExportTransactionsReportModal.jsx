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
import { TransactionsReport } from "@/components/finances/TransactionsReport"
import { listTransactions } from "@/services/finance.service"
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
      <div className="mt-4 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
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

function formatCsvDate(value) {
  if (!value) return ""
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function transactionsToCsv(transactions) {
  const headers = ["Date", "Note", "Category", "Type", "Recorded By", "Amount"]
  const rows = transactions.map((transaction) => [
    formatCsvDate(transaction.createdAt || transaction.date),
    transaction.description || "",
    transaction.category || "",
    transaction.type || "",
    transaction.recordedBy || "",
    Number(transaction.amount) || 0,
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

async function fetchAllMatchingTransactions(
  { type, search, from, to },
  signal
) {
  const all = []
  let page = 1
  let totalPages = 1

  do {
    const { data, meta } = await listTransactions(
      {
        page,
        limit: EXPORT_PAGE_SIZE,
        type: type === "All" ? "" : type,
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

function ExportTransactionsReportModal({
  open,
  onOpenChange,
  typeFilter = "All",
  search = "",
  dateFrom = "",
  dateTo = "",
  dateRangeLabel = "",
  selectedTransactions = [],
}) {
  const hasSelection = selectedTransactions.length > 0
  const [scope, setScope] = useState(hasSelection ? "selected" : "filtered")
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedAt, setGeneratedAt] = useState(() => new Date())

  const selectedKey = selectedTransactions
    .map((transaction) => transaction.id)
    .join(",")

  useEffect(() => {
    if (!open) return
    setScope(hasSelection ? "selected" : "filtered")
  }, [open, hasSelection])

  useEffect(() => {
    if (!open) return

    if (scope === "selected") {
      setTransactions(selectedTransactions)
      setError("")
      setIsLoading(false)
      setGeneratedAt(new Date())
      return
    }

    const controller = new AbortController()

    async function loadTransactions() {
      setIsLoading(true)
      setError("")
      setTransactions([])

      try {
        const data = await fetchAllMatchingTransactions(
          { type: typeFilter, search, from: dateFrom, to: dateTo },
          controller.signal
        )
        if (controller.signal.aborted) return
        setTransactions(data)
        setGeneratedAt(new Date())
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to build transactions report")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadTransactions()
    return () => controller.abort()
    // selectedTransactions is only read for the "selected" scope branch;
    // selectedKey keeps that branch stable without array-identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scope, typeFilter, search, dateFrom, dateTo, selectedKey])

  const scopeLabel =
    scope === "selected"
      ? `Selected transactions (${selectedTransactions.length})`
      : "Current filters"

  const reportProps = {
    transactions,
    typeFilter,
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
    downloadCsv(
      `transactions-report-${stamp}.csv`,
      transactionsToCsv(transactions)
    )
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
              Export Transactions Report
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
              Selected only
              {hasSelection ? ` (${selectedTransactions.length})` : ""}
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
              <TransactionsReport {...reportProps} />
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
              disabled={
                isLoading || Boolean(error) || transactions.length === 0
              }
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download CSV
            </Button>
            <Button
              type="button"
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
              onClick={handlePrint}
              disabled={
                isLoading || Boolean(error) || transactions.length === 0
              }
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>

      {!isLoading && !error && transactions.length > 0 && (
        <PrintPortal>
          <div className="print-report-page">
            <TransactionsReport {...reportProps} />
          </div>
        </PrintPortal>
      )}
    </Dialog>
  )
}

export { ExportTransactionsReportModal }
export default ExportTransactionsReportModal
