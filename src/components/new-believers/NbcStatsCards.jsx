"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookOpen, Users, UserRound, AlertCircle } from "lucide-react"

function NbcStatsCards({ stats, onStatClick, isAdmin = false }) {
  const cards = [
    {
      key: "lessons",
      label: "Total Lessons",
      value: String(stats?.totalLessons ?? 0),
      caption: "in the course",
      valueClassName: "text-foreground/85",
      icon: BookOpen,
      iconClassName: "bg-muted text-muted-foreground",
      action: "lessons",
    },
    {
      key: "students",
      label: "Total Students",
      value: String(stats?.totalStudents ?? 0),
      caption: "across all teachers",
      valueClassName: "text-sky-600",
      icon: Users,
      iconClassName:
        "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
      action: isAdmin ? "assignments" : null,
    },
    {
      key: "mine",
      label: "My Students",
      value: String(stats?.myStudents ?? 0),
      caption: "assigned to you",
      valueClassName: "text-amber-600",
      icon: UserRound,
      iconClassName:
        "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
      action: "my-class",
      teacherOnly: true,
    },
    {
      key: "attention",
      label: "Need Attention",
      value: String(stats?.needAttention ?? 0),
      caption: "behind in your class",
      valueClassName: "text-red-600",
      icon: AlertCircle,
      iconClassName:
        "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
      action: "attention",
      teacherOnly: true,
    },
  ].filter((card) => !(card.teacherOnly && isAdmin))

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6",
        cards.length <= 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"
      )}
    >
      {cards.map((card) => {
        const clickable = Boolean(onStatClick && card.action)

        return (
          <Card
            key={card.key}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={() => {
              if (clickable) onStatClick(card.action)
            }}
            onKeyDown={(event) => {
              if (!clickable) return
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onStatClick(card.action)
              }
            }}
            className={cn(
              "rounded-2xl p-3 sm:p-6",
              clickable &&
                "cursor-pointer transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-[#1e2a4a]/30 outline-none"
            )}
          >
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

            <div
              className={cn(
                "mt-2 font-heading text-xl font-normal sm:mt-4 sm:text-2xl",
                card.valueClassName
              )}
            >
              {card.value}
            </div>

            <p className="mt-1 text-[11px] text-muted-foreground sm:mt-2 sm:text-xs">
              {card.caption}
            </p>
          </Card>
        )
      })}
    </div>
  )
}

export { NbcStatsCards }
export default NbcStatsCards
