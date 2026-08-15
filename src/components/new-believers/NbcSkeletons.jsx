import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function NbcStatsCardsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }).map((_, index) => (
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

function NbcTabsSkeleton({ tabs = 2 }) {
  return (
    <div className="flex w-full items-center gap-1 rounded-xl bg-muted p-1 sm:w-fit">
      {Array.from({ length: tabs }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-10 flex-1 rounded-lg sm:h-9 sm:w-28 sm:flex-none"
        />
      ))}
    </div>
  )
}

function NbcListSkeleton({ rows = 5 }) {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 pb-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-border/60 px-3 py-3"
          >
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </Card>
  )
}

function NbcPageSkeleton({ isAdmin = false }) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <NbcStatsCardsSkeleton count={isAdmin ? 2 : 4} />
      <Skeleton className="h-3 w-72 max-w-full" />
      <NbcTabsSkeleton tabs={isAdmin ? 2 : 2} />
      <NbcListSkeleton />
    </div>
  )
}

export {
  NbcStatsCardsSkeleton,
  NbcTabsSkeleton,
  NbcListSkeleton,
  NbcPageSkeleton,
}
