import { cn } from "@/lib/utils"
import { Users, Trophy, TrendingUp } from "lucide-react"

const tabs = [
  { key: "records", label: "Records", icon: Users },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "trend", label: "Trend Chart", icon: TrendingUp },
]

function SectionTabs({ active, onChange }) {
  return (
    <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-muted p-1 sm:w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            active === tab.key
              ? "bg-white text-foreground/85 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export { SectionTabs }
export default SectionTabs
