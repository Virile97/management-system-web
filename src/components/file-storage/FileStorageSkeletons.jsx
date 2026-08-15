import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function FileCardSkeleton() {
  return (
    <Card className="min-h-[156px] gap-3 rounded-xl border-[#E5E4E0] bg-white p-4 shadow-none">
      <Skeleton className="h-11 w-12 rounded-xl" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-14 rounded-md" />
        <Skeleton className="h-6 w-14 rounded-md" />
      </div>
    </Card>
  )
}

function FileGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <FileCardSkeleton key={index} />
      ))}
    </div>
  )
}

/** Mirrors FileListView's actual row grid (checkbox, name+badge, type,
 * size, uploader, date) instead of reusing the grid-card skeleton, which
 * didn't match the table layout at all. */
function FileListSkeleton({ count = 8 }) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div className="grid grid-cols-[auto_minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center gap-4 border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-10" />
      </div>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`grid grid-cols-[auto_minmax(0,2.5fr)_1fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3.5 ${
            index > 0 ? "border-t border-border" : ""
          }`}
        >
          <Skeleton className="h-4 w-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 min-w-[2.25rem] rounded-lg" />
            <Skeleton className="h-4 w-40 max-w-full" />
          </div>
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </Card>
  )
}

function SidebarSkeleton() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-[#E5E4E0] bg-[#F3F2EE] lg:w-[220px] lg:border-r xl:w-[240px]">
      <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-5">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="mx-1 mb-2 h-3 w-16" />
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <Card className="mt-auto gap-3 rounded-xl border-[#E0DED8] bg-white p-4 shadow-none">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-28" />
        </Card>
      </div>
    </aside>
  )
}

function ToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-10 min-w-[180px] flex-1 rounded-lg xl:max-w-[420px]" />
      <Skeleton className="h-10 w-28 rounded-lg" />
      <Skeleton className="h-10 w-[4.5rem] rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  )
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <ToolbarSkeleton />
    </div>
  )
}

function FileStoragePageSkeleton() {
  return (
    <>
      <SidebarSkeleton />
      <div className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 md:px-8">
        <HeaderSkeleton />
        <Skeleton className="h-4 w-36" />
        <FileGridSkeleton />
      </div>
    </>
  )
}

export {
  FileCardSkeleton,
  FileGridSkeleton,
  FileListSkeleton,
  SidebarSkeleton,
  ToolbarSkeleton,
  FileStoragePageSkeleton,
}
