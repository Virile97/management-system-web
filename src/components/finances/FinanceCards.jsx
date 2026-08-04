import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

const cards = [
  {
    label: "Total Income",
    value: "$21,400",
    icon: TrendingUp,
    iconClassName: "bg-emerald-50 text-emerald-600",
    valueClassName: "text-emerald-600",
  },
  {
    label: "Total Expenses",
    value: "$7,770",
    icon: TrendingDown,
    iconClassName: "bg-red-50 text-red-500",
    valueClassName: "text-red-500",
  },
  {
    label: "Net Balance",
    value: "$14,740",
    icon: DollarSign,
    iconClassName: "bg-emerald-50 text-emerald-600",
    valueClassName: "text-emerald-600",
  },
]

function FinanceCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-2xl p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {card.label}
            </span>
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                card.iconClassName
              )}
            >
              <card.icon className="h-4 w-4" />
            </div>
          </div>

          <div
            className={cn(
              "mt-4 font-heading text-2xl font-normal",
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
