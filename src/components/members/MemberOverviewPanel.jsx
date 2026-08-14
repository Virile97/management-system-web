import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { Pagination } from "@/components/common/Pagination"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { cn } from "@/lib/utils"
import { LayoutGrid, Clock, CalendarX } from "lucide-react"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const statusStyles = {
  "Full day":
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  Present:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  "Morning only":
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  "Afternoon only":
    "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  Partial: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Absent: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
}

function TimeReadout({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xs tabular-nums",
          value ? "text-foreground/85" : "text-muted-foreground/50"
        )}
      >
        {value || "—"}
      </p>
    </div>
  )
}

function SessionBlock({ title, tone, timeIn, timeOut }) {
  return (
    <div className="min-w-0">
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium tracking-wide whitespace-nowrap",
          tone === "morning" ? "text-amber-600" : "text-blue-600"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "morning" ? "bg-amber-500" : "bg-blue-500"
          )}
        />
        {title}
      </span>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <TimeReadout label="Time In" value={timeIn} />
        <TimeReadout label="Time Out" value={timeOut} />
      </div>
    </div>
  )
}

function AttendanceDayCard({ record }) {
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground/85">
          {formatDate(record.date)}
        </p>
        {record.status ? (
          <Badge
            className={cn(
              "shrink-0 border-0",
              statusStyles[record.status] ?? "bg-muted text-muted-foreground"
            )}
          >
            {record.status}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-muted/40 px-3 py-2.5">
          <SessionBlock
            title="Morning Session"
            tone="morning"
            timeIn={record.morningIn}
            timeOut={record.morningOut}
          />
        </div>
        <div className="rounded-lg bg-muted/40 px-3 py-2.5">
          <SessionBlock
            title="Afternoon Session"
            tone="afternoon"
            timeIn={record.afternoonIn}
            timeOut={record.afternoonOut}
          />
        </div>
      </div>
    </div>
  )
}

function MemberOverviewPanel({
  member,
  attendance,
  isAttendanceLoading,
  attendanceError,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
}) {
  const groups = member.groups ?? []
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + attendance.length

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card className="rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-medium text-foreground/85">
            Ministry &amp; Groups
          </h2>
        </div>

        {groups.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {groups.map((group, index) => (
              <span
                key={group.id ?? group.role}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  index === 0
                    ? "bg-[#1e2a4a] text-white"
                    : "bg-muted text-muted-foreground ring-1 ring-border"
                )}
              >
                {group.role}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No groups assigned.
          </p>
        )}
      </Card>

      <Card className="overflow-hidden rounded-2xl p-0">
        <div className="flex items-center gap-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <Clock className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-medium text-foreground/85">
            Recent Attendance
          </h2>
        </div>

        {attendanceError && (
          <p className="px-4 pt-3 text-sm text-destructive sm:px-5">
            {attendanceError}
          </p>
        )}

        {isAttendanceLoading ? (
          <ListCardSkeleton
            rows={5}
            className="border-0 p-4 shadow-none sm:p-5"
          />
        ) : attendance.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No attendance yet"
            description="Recorded morning and afternoon sessions will show up here."
            className="py-10"
          />
        ) : (
          <>
            <div className="mt-1 px-4 pb-2 sm:px-5">
              {attendance.map((record) => (
                <AttendanceDayCard key={record.id} record={record} />
              ))}
            </div>

            {total > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                from={from}
                to={to}
                total={total}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
              />
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export { MemberOverviewPanel }
export default MemberOverviewPanel
