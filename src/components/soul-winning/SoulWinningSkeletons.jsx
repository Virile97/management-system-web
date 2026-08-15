import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function SoulStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="rounded-2xl p-3 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-3 w-16 sm:w-20" />
            <Skeleton className="h-8 w-8 rounded-lg sm:h-9 sm:w-9" />
          </div>
          <Skeleton className="mt-3 h-7 w-14 sm:mt-4 sm:h-8 sm:w-16" />
          <Skeleton className="mt-2 h-3 w-24 sm:w-28" />
        </Card>
      ))}
    </div>
  )
}

function RetentionBarSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-5 w-48 sm:w-56" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-4 h-3.5 w-full rounded-full" />
          <div className="mt-4 flex flex-wrap gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SoulWinningGoalSkeleton() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-52 sm:w-64" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <div className="mt-5 flex flex-wrap items-baseline gap-2">
        <Skeleton className="h-10 w-28 sm:h-11 sm:w-36" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mt-4 h-2.5 w-full rounded-full sm:h-3" />
      <div className="mt-2.5 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:mt-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border sm:pt-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="px-0 sm:px-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-7 w-12" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>
    </Card>
  )
}

function RecordsTableSkeleton({ rows = 6 }) {
  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <div className="hidden border-b border-border bg-muted/40 px-4 py-3 md:grid md:grid-cols-5 md:gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-3.5 w-16" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 p-4 md:grid md:grid-cols-5 md:items-center md:gap-4"
          >
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-28 md:hidden" />
            </div>
            <Skeleton className="hidden h-4 w-28 md:block" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-lg md:justify-self-end" />
          </div>
        ))}
      </div>
    </Card>
  )
}

function LeaderboardSkeleton({ cards = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-2xl p-0">
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-4">
          {Array.from({ length: cards }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, metricIndex) => (
                  <div
                    key={metricIndex}
                    className="rounded-xl bg-muted/50 px-3 py-2.5"
                  >
                    <Skeleton className="h-6 w-8" />
                    <Skeleton className="mt-2 h-3 w-14" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SoulTrendChartSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="grid grid-cols-1 gap-3 sm:gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="rounded-2xl p-3 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="mt-4 h-52 w-full rounded-xl" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export {
  SoulStatsCardsSkeleton,
  RetentionBarSkeleton,
  SoulWinningGoalSkeleton,
  RecordsTableSkeleton,
  LeaderboardSkeleton,
  SoulTrendChartSkeleton,
}
