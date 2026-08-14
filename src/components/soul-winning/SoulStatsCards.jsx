import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Heart, Star, UserPlus, UserX } from "lucide-react"

function SoulStatsCards({
  stats = null,
  isLoading = false,
  periodLabel = "selected period",
}) {
  const total = Number(stats?.totalSoulsWon) || 0
  const baptized = Number(stats?.baptized) || 0
  const wentInactive = Number(stats?.wentInactive) || 0
  const cards = [
    {
      label: "Total POF",
      value: String(total),
      caption: `in ${periodLabel}`,
      icon: Heart,
      iconClassName: "bg-muted text-muted-foreground",
    },
    {
      label: "Recent POF",
      value: String(Number(stats?.newConverts) || 0),
      caption: `${Number(stats?.newConvertsPercent) || 0}% of total`,
      icon: Star,
      iconClassName: "bg-amber-50 text-amber-500",
    },
    {
      label: "Became Members",
      value: String(Number(stats?.nowActiveMembers) || 0),
      caption: `${Number(stats?.activeRetentionPercent) || 0}% retention`,
      icon: UserPlus,
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Went Inactive",
      value: String(wentInactive),
      caption:
        baptized > 0
          ? `${Math.round((wentInactive / baptized) * 100)}% of baptized`
          : "0% of baptized",
      icon: UserX,
      iconClassName: "bg-red-50 text-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-2xl p-3 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">
              {card.label}
            </span>
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9",
                card.iconClassName
              )}
            >
              <card.icon className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-2 font-heading text-xl font-normal text-foreground/85 sm:mt-4 sm:text-2xl">
            {isLoading ? "—" : card.value}
          </div>

          <p className="mt-1 text-[11px] text-muted-foreground sm:mt-2 sm:text-xs">
            {card.caption}
          </p>
        </Card>
      ))}
    </div>
  )
}

export { SoulStatsCards }
export default SoulStatsCards
