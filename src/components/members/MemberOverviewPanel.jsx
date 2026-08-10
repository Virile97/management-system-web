import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { cn } from "@/lib/utils"
import { LayoutGrid, Clock, CalendarX } from "lucide-react"

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function MemberOverviewPanel({ member, attendance, isAttendanceLoading, attendanceError }) {
  const groups = member.groups ?? []

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <Card className="rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-medium text-foreground/85">Ministry &amp; Groups</h2>
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
          <p className="mt-3 text-sm text-muted-foreground">No groups assigned.</p>
        )}
      </Card>

      <Card className="rounded-2xl p-0">
        <div className="flex items-center gap-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <Clock className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-medium text-foreground/85">Recent Attendance</h2>
        </div>

        {attendanceError && (
          <p className="px-4 pt-3 text-sm text-destructive sm:px-5">{attendanceError}</p>
        )}

        {isAttendanceLoading ? (
          <ListCardSkeleton rows={5} className="border-0 p-4 shadow-none sm:p-5" />
        ) : attendance.length === 0 ? (
          <EmptyState
            icon={CalendarX}
            title="No attendance yet"
            description="This member has no recorded services."
            className="py-10"
          />
        ) : (
          <div className="mt-2 px-4 pb-2 sm:px-5">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground/85">{record.event}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(record.date)}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium",
                    record.status === "Present" ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export { MemberOverviewPanel }
export default MemberOverviewPanel
