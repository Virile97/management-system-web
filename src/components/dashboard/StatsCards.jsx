import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

function StatCard({ label, value, icon: Icon, iconClassName, trend, trendDirection = "up" }) {
  const isUp = trendDirection === "up"

  return (
    <Card className="rounded-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            iconClassName
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 font-heading text-2xl font-normal text-foreground/85">
        {value}
      </div>

      {trend && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs",
            isUp ? "text-emerald-500/90" : "text-muted-foreground"
          )}
        >
          {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{trend}</span>
        </div>
      )}
    </Card>
  )
}

export { StatCard }
export default StatCard
