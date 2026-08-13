import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { StatCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { TrendingUp, TrendingDown, PhilippinePeso } from "lucide-react"

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

function FinanceCards({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  const netBalance = stats?.netBalance ?? 0

  const cards = [
    {
      label: "Total Income",
      value: currencyFormatter.format(stats?.totalIncome ?? 0),
      icon: TrendingUp,
      iconClassName: "bg-emerald-50 text-emerald-600",
      valueClassName: "text-emerald-600",
    },
    {
      label: "Total Expenses",
      value: currencyFormatter.format(stats?.totalExpenses ?? 0),
      icon: TrendingDown,
      iconClassName: "bg-red-50 text-red-500",
      valueClassName: "text-red-500",
    },
    {
      label: "Net Balance",
      value: currencyFormatter.format(netBalance),
      icon: PhilippinePeso,
      iconClassName:
        netBalance >= 0
          ? "bg-emerald-50 text-emerald-600"
          : "bg-red-50 text-red-500",
      valueClassName: netBalance >= 0 ? "text-emerald-600" : "text-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-2xl p-3 sm:p-6">
          <div className="flex items-start justify-between gap-3">
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

          <div
            className={cn(
              "mt-2 font-heading text-xl font-normal sm:mt-4 sm:text-2xl",
              card.valueClassName
            )}
          >
            {card.value}
          </div>
        </Card>
      ))}
    </div>
  )
}

export { FinanceCards }
export default FinanceCards
