"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Exactly this many page-number buttons — never more. Ellipsis is decorative
// only and does not count toward the limit. Jumping to any page is handled
// by the "Page X of N" select.
const PAGE_WINDOW = 5

function getVisiblePages(page, totalPages) {
  const safeTotal = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotal)
  const windowSize = Math.min(PAGE_WINDOW, safeTotal)

  if (safeTotal <= windowSize) {
    return Array.from({ length: safeTotal }, (_, index) => index + 1)
  }

  // Center on the current page, clamped so the window always stays
  // exactly `windowSize` buttons.
  let start = safePage - Math.floor((windowSize - 1) / 2)
  let end = start + windowSize - 1

  if (start < 1) {
    start = 1
    end = windowSize
  }

  if (end > safeTotal) {
    end = safeTotal
    start = safeTotal - windowSize + 1
  }

  return Array.from({ length: windowSize }, (_, index) => start + index)
}

function PageButton({ number, page, onPageChange }) {
  const isActive = number === page

  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-8 min-w-8 shrink-0 rounded-md px-2 text-sm font-medium tabular-nums",
        isActive
          ? "bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90 hover:text-white"
          : "text-foreground/70 hover:bg-muted hover:text-foreground"
      )}
      onClick={() => onPageChange?.(number)}
      aria-current={isActive ? "page" : undefined}
    >
      {number}
    </Button>
  )
}

function Ellipsis() {
  return (
    <span
      className="flex h-8 w-6 shrink-0 items-center justify-center text-xs text-muted-foreground/70"
      aria-hidden
    >
      …
    </span>
  )
}

function Pagination({
  page = 1,
  totalPages = 2,
  from = 1,
  to = 10,
  total = 12,
  onPageChange,
}) {
  const safeTotalPages = Math.max(1, totalPages)
  const visiblePages = getVisiblePages(page, safeTotalPages)
  const firstVisible = visiblePages[0] ?? 1
  const lastVisible = visiblePages[visiblePages.length - 1] ?? 1
  const showLeadingEllipsis = firstVisible > 1
  const showTrailingEllipsis = lastVisible < safeTotalPages
  const pageOptions = Array.from(
    { length: safeTotalPages },
    (_, index) => index + 1
  )

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground/80">
          {from}-{to}
        </span>{" "}
        of <span className="font-medium text-foreground/80">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-0.5 px-0.5">
            {showLeadingEllipsis && <Ellipsis />}

            {visiblePages.map((number) => (
              <PageButton
                key={number}
                number={number}
                page={page}
                onPageChange={onPageChange}
              />
            ))}

            {showTrailingEllipsis && <Ellipsis />}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground"
            disabled={page >= safeTotalPages}
            onClick={() => onPageChange?.(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {safeTotalPages > 1 && (
          <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Page
            </span>
            <Select
              value={String(page)}
              onValueChange={(value) => onPageChange?.(Number(value))}
            >
              <SelectTrigger
                size="sm"
                className="h-7 min-w-14 border-0 bg-background px-2 shadow-none ring-0 focus-visible:ring-2"
              >
                <SelectValue>{() => String(page)}</SelectValue>
              </SelectTrigger>
              <SelectContent align="end" className="max-h-60 min-w-20">
                {pageOptions.map((number) => (
                  <SelectItem
                    key={number}
                    value={String(number)}
                    className="tabular-nums"
                  >
                    {number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground tabular-nums">
              of {safeTotalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export { Pagination }
export default Pagination
