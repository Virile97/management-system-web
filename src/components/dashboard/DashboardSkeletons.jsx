import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function StatCardSkeleton() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="mt-4 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-28" />
    </Card>
  )
}

function ChartCardSkeleton({ className }) {
  return (
    <Card className={className ?? "rounded-2xl p-4 sm:p-6"}>
      <CardHeader className="px-0">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="px-0">
        <Skeleton className="h-52 w-full" />
      </CardContent>
    </Card>
  )
}

function ListCardSkeleton({ rows = 5, className }) {
  return (
    <Card className={className ?? "rounded-2xl p-4 sm:p-6"}>
      <CardHeader className="px-0">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { StatCardSkeleton, ChartCardSkeleton, ListCardSkeleton }
