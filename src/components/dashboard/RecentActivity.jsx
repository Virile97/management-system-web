import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Users, DollarSign, Calendar } from "lucide-react"

const activity = [
  {
    icon: Users,
    iconClassName: "bg-muted text-muted-foreground",
    title: "New member registered",
    subtitle: "Margaret Osei",
    time: "2 hours ago",
  },
  {
    icon: DollarSign,
    iconClassName: "bg-amber-50/60 text-amber-500",
    title: "Tithe recorded",
    subtitle: "$2,400 received",
    time: "5 hours ago",
  },
  {
    icon: Users,
    iconClassName: "bg-muted text-muted-foreground",
    title: "Status updated to Inactive",
    subtitle: "David Asante",
    time: "Yesterday",
  },
  {
    icon: DollarSign,
    iconClassName: "bg-amber-50/60 text-amber-500",
    title: "Expense logged",
    subtitle: "Building maintenance — $1,800",
    time: "Yesterday",
  },
  {
    icon: Users,
    iconClassName: "bg-muted text-muted-foreground",
    title: "New member registered",
    subtitle: "Grace Mensah",
    time: "2 days ago",
  },
]

function RecentActivity() {
  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <CardHeader className="px-0">
        <CardTitle className="font-heading text-lg font-normal text-foreground/80">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        <div className="divide-y divide-border">
          {activity.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    item.iconClassName
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-normal text-foreground/80">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1 pl-14 text-[11px] text-muted-foreground sm:pl-0">
                <Calendar className="h-3 w-3" />
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { RecentActivity }
export default RecentActivity
