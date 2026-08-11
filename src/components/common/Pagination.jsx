import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Exactly this many page-number buttons — never more. Ellipsis is decorative
// only and does not count toward the limit.
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
  return (
    <Button
      variant="outline"
      className={cn(
        "h-8 w-8 rounded-lg p-0",
        number === page && "bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90"
      )}
      onClick={() => onPageChange?.(number)}
    >
      {number}
    </Button>
  )
}

function Ellipsis() {
  return (
    <span className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
      …
    </span>
  )
}

function Pagination({ page = 1, totalPages = 2, from = 1, to = 10, total = 12, onPageChange }) {
  const visiblePages = getVisiblePages(page, totalPages)
  const firstVisible = visiblePages[0] ?? 1
  const lastVisible = visiblePages[visiblePages.length - 1] ?? 1

  const showLeadingEllipsis = firstVisible > 1
  const showTrailingEllipsis = lastVisible < totalPages

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}-{to} of {total}
      </p>

      <div className="flex items-center gap-1 overflow-x-auto">
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {showLeadingEllipsis && <Ellipsis />}

        {visiblePages.map((number) => (
          <PageButton key={number} number={number} page={page} onPageChange={onPageChange} />
        ))}

        {showTrailingEllipsis && <Ellipsis />}

        <Button
          variant="outline"
          size="icon"
          className="rounded-lg"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { Pagination }
export default Pagination
