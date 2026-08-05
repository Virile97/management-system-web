import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/common/EmptyState"
import { cn } from "@/lib/utils"
import { Users, UserCog, DollarSign, Calendar, Clock } from "lucide-react"

const DEFAULT_META = { icon: Clock, iconClassName: "bg-muted text-muted-foreground" }

const ACTIVITY_META = {
  MEMBER_REGISTERED: { icon: Users, iconClassName: "bg-muted text-muted-foreground" },
  MEMBER_STATUS_CHANGED: { icon: UserCog, iconClassName: "bg-muted text-muted-foreground" },
  MEMBER_UPDATED: { icon: UserCog, iconClassName: "bg-muted text-muted-foreground" },
  INCOME_RECORDED: { icon: DollarSign, iconClassName: "bg-amber-50/60 text-amber-500" },
  EXPENSE_RECORDED: { icon: DollarSign, iconClassName: "bg-amber-50/60 text-amber-500" },
}

function formatRelativeTime(timestamp) {
  const date = new Date(timestamp)
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) return "Just now"
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function RecentActivity({ items = [] }) {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {items.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No recent activity"
            description="New members and transactions will show up here."
          />
        ) : (
          <div className="divide-y divide-border">
            {items.map((item, index) => {
              const meta = ACTIVITY_META[item.type] ?? DEFAULT_META

              return (
                <div
                  key={index}
                  className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        meta.iconClassName
                      )}
                    >
                      <meta.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-normal text-foreground/80">{item.message}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 pl-14 text-[11px] text-muted-foreground sm:pl-0">
                    <Calendar className="h-3 w-3" />
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { RecentActivity }
export default RecentActivity
