"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCardSkeleton, ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { AttendanceStatsCards } from "@/components/attendance/AttendanceStatsCards"
import { AttendanceGroupTabs } from "@/components/attendance/AttendanceGroupTabs"
import { AttendanceTable } from "@/components/attendance/AttendanceTable"
import { DateRangeButton } from "@/components/common/DateRangeButton"
import { DateRangeFilterModal } from "@/components/soul-winning/DateRangeFilterModal"
import { getAttendanceStats, getAttendanceMembers } from "@/services/attendance.service"
import { useAsyncData } from "@/hooks/use-async-data"
import { formatDateRangeLabel } from "@/utils/helpers"
import { Download, Search } from "lucide-react"

const GROUP_LEVELS = ["Career", "Ladies", "Men", "Young People"]
const PAGE_SIZE = 5

export default function AttendancePage() {
  const [stats, setStats] = useState(null)
  const [members, setMembers] = useState([])

  const [activeGroup, setActiveGroup] = useState("All")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [range, setRange] = useState(null)

  const modalRange = range ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    start: null,
    end: null,
    startTime: "12:00 AM",
    endTime: "11:59 PM",
    utc: true,
  }

  const buildTasks = useCallback(() => [
    [(signal) => getAttendanceStats(range, signal), setStats],
    [(signal) => getAttendanceMembers(range, signal), setMembers],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [range])

  const { isLoading, error, retry } = useAsyncData(buildTasks, { deps: [range] })

  const groups = [
    { name: "All", count: members.length },
    ...GROUP_LEVELS.map((level) => ({
      name: level,
      count: members.filter((m) => m.level === level).length,
    })),
  ]

  const filteredMembers = members
    .filter((m) => activeGroup === "All" || m.level === activeGroup)
    .filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const visibleMembers = filteredMembers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleGroupChange(group) {
    setActiveGroup(group)
    setPage(1)
  }

  function handleSearchChange(value) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-normal text-foreground/80 sm:text-3xl">
              Member Attendance
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track morning and afternoon sessions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DateRangeButton
              hasRange={Boolean(range)}
              label={range && formatDateRangeLabel(range)}
              onOpen={() => setIsDateRangeOpen(true)}
              onClear={() => setRange(null)}
            />

            <Button className="h-10 gap-2 rounded-lg bg-[#1e2a4a] px-4 text-white hover:bg-[#1e2a4a]/90">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <span>{error}</span>
            <button
              type="button"
              onClick={retry}
              className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
            <div className="mt-6">
              <ListCardSkeleton rows={PAGE_SIZE} />
            </div>
          </>
        ) : (
          <>
            <div className="mt-6">
              <AttendanceStatsCards stats={stats} />
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <AttendanceGroupTabs groups={groups} active={activeGroup} onChange={handleGroupChange} />

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search member..."
                  className="h-9 rounded-lg bg-white pl-9"
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <AttendanceTable
                members={visibleMembers}
                page={page}
                totalPages={totalPages}
                total={filteredMembers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <DateRangeFilterModal
        open={isDateRangeOpen}
        onOpenChange={setIsDateRangeOpen}
        range={modalRange}
        hasSelection={Boolean(range)}
        onApply={setRange}
      />
    </div>
  )
}
