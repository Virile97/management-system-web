import { cn } from "@/lib/utils"
import { Users, Trophy, TrendingUp } from "lucide-react"

const tabs = [
  { key: "records", label: "Records", shortLabel: "Records", icon: Users },
  {
    key: "leaderboard",
    label: "Leaderboard",
    shortLabel: "Board",
    icon: Trophy,
  },
  { key: "trend", label: "Trend Chart", shortLabel: "Trend", icon: TrendingUp },
]

function SectionTabs({ active, onChange }) {
  return (
    <div className="flex w-full items-center gap-1 rounded-xl bg-muted p-1 sm:w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors sm:h-auto sm:flex-none sm:gap-2 sm:px-4 sm:py-2",
            active === tab.key
              ? "bg-white text-foreground/85 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <tab.icon className="h-4 w-4 shrink-0" />
          <span className="truncate sm:hidden">{tab.shortLabel}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export { SectionTabs }
export default SectionTabs
