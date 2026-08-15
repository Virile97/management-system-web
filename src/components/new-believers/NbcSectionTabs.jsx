import { cn } from "@/lib/utils"
import { Users, BookOpen, ClipboardList } from "lucide-react"

const ALL_TABS = [
  {
    key: "my-class",
    label: "My Class",
    shortLabel: "Class",
    icon: Users,
    teacherOnly: true,
  },
  { key: "lessons", label: "Lessons", shortLabel: "Lessons", icon: BookOpen },
  {
    key: "assignments",
    label: "Assignments",
    shortLabel: "Assign",
    icon: ClipboardList,
    adminOnly: true,
  },
]

function NbcSectionTabs({ active, onChange, isAdmin = false }) {
  const tabs = ALL_TABS.filter((tab) => {
    if (tab.adminOnly && !isAdmin) return false
    if (tab.teacherOnly && isAdmin) return false
    return true
  })

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
              ? "bg-card text-foreground/85 shadow-sm"
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

export { NbcSectionTabs }
export default NbcSectionTabs
