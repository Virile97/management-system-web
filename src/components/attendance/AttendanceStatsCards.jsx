import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function AttendanceStatsCards({ stats }) {
  if (!stats) return null

  const cards = [
    {
      label: "Total Members",
      value: stats.total,
    },
    {
      label: "Present",
      value: stats.present,
      valueClassName: "text-emerald-500",
      helper: `${stats.attendanceRate}% attendance`,
    },
    {
      label: "Full Day",
      value: stats.fullDay,
      valueClassName: "text-[#1e2a4a]",
    },
    {
      label: "Partial",
      value: stats.partial,
      valueClassName: "text-amber-500",
      helper: `${stats.partialMorning} morning · ${stats.partialAfternoon} afternoon`,
    },
    {
      label: "Absent",
      value: stats.absent,
      valueClassName: "text-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} className="rounded-2xl p-3 sm:p-5">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">
            {card.label}
          </span>

          <div
            className={cn(
              "mt-2 font-heading text-xl font-normal text-foreground/85 sm:mt-3 sm:text-2xl",
              card.valueClassName
            )}
          >
            {card.value}
          </div>

          {card.helper && (
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">
              {card.helper}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}

export { AttendanceStatsCards }
export default AttendanceStatsCards
