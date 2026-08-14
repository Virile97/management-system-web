"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PrintPortal } from "@/components/common/PrintPortal"
import { MemberMonthlyOfferingsReport } from "@/components/members/MemberMonthlyOfferingsReport"
import { Skeleton } from "@/components/ui/skeleton"
import { getMemberOfferingsMonthlyReport } from "@/services/memberFinance.service"
import { FileDown, X } from "lucide-react"

function ReportPreviewSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3.5 w-64" />
        <Skeleton className="h-3 w-40" />
      </div>

      <div className="mt-4 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

function ExportMonthlyOfferingsModal({
  open,
  onOpenChange,
  memberId,
  memberName,
  period,
  dateFrom,
  dateTo,
  offeringTypeIds,
  offeringTypeLabels,
}) {
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const offeringTypeKey = offeringTypeIds.join(",")

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()

    async function loadReport() {
      setIsLoading(true)
      setError("")
      setReport(null)

      try {
        const data = await getMemberOfferingsMonthlyReport(
          memberId,
          {
            period,
            from: dateFrom,
            to: dateTo,
            offeringTypeIds: offeringTypeKey ? offeringTypeKey.split(",") : [],
          },
          controller.signal
        )
        if (controller.signal.aborted) return

        setReport(data)
      } catch (err) {
        if (controller.signal.aborted) return
        setError(err?.message || "Unable to build monthly offerings report")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadReport()
    return () => controller.abort()
  }, [open, memberId, period, dateFrom, dateTo, offeringTypeKey])

  function handleExport() {
    // Blank the tab title for the print job so the browser header doesn't
    // echo the app route; paired with @page report { margin: 0 } this also
    // keeps the localhost URL / page counter out of the PDF in Chromium.
    const previousTitle = document.title
    document.title = "\u00a0"

    const restoreTitle = () => {
      document.title = previousTitle
      window.removeEventListener("afterprint", restoreTitle)
    }

    window.addEventListener("afterprint", restoreTitle)
    window.print()
  }

  const reportProps = report
    ? {
        memberName,
        periodLabel: period,
        periodFrom: report.periodRange?.from,
        periodTo: report.periodRange?.to,
        offeringTypeLabels,
        months: report.months,
        total: report.total,
      }
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100vh-4rem)] w-136 max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-136"
        showCloseButton={false}
      >
        <DialogHeader className="flex-row items-center justify-between gap-0 bg-[#1e2a4a] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <FileDown className="h-5 w-5 text-white" />
            <DialogTitle className="font-heading text-lg font-normal text-white">
              Export Monthly Report
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

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50 p-4 sm:p-6">
          {isLoading && <ReportPreviewSkeleton />}
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {!isLoading && !error && reportProps && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <MemberMonthlyOfferingsReport {...reportProps} />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            Uses the current period and type filters · short bond (8.5 × 11 in)
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
              className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-5 text-white hover:bg-[#1e2a4a]/90"
              onClick={handleExport}
              disabled={isLoading || !report}
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </DialogContent>

      {reportProps && (
        <PrintPortal>
          <div className="print-report-page">
            <MemberMonthlyOfferingsReport {...reportProps} />
          </div>
        </PrintPortal>
      )}
    </Dialog>
  )
}

export { ExportMonthlyOfferingsModal }
export default ExportMonthlyOfferingsModal
