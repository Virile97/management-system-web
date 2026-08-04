import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

function Pagination({ page = 1, totalPages = 2, from = 1, to = 10, total = 12 }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {from}-{to} of {total}
      </p>

      <div className="flex items-center gap-1 overflow-x-auto">
        <Button variant="outline" size="icon" className="rounded-lg">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <Button
            key={number}
            variant="outline"
            className={cn(
              "h-8 w-8 rounded-lg p-0",
              number === page && "bg-[#1e2a4a] text-white hover:bg-[#1e2a4a]/90"
            )}
          >
            {number}
          </Button>
        ))}

        <Button variant="outline" size="icon" className="rounded-lg">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { Pagination }
export default Pagination
