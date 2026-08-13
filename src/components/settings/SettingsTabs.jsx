"use client"

import { FileText, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  {
    key: "offering-slip",
    label: "Offering Slip",
    shortLabel: "Slip",
    icon: FileText,
  },
  {
    key: "users-roles",
    label: "Users & Roles",
    shortLabel: "Users",
    icon: Users,
  },
]

function SettingsTabs({ active, onChange }) {
  return (
    <div className="flex w-full items-center gap-1 rounded-xl bg-muted p-1 sm:w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-sm transition-colors sm:h-auto sm:flex-none sm:gap-2 sm:px-3 sm:py-1.5",
            active === tab.key
              ? "bg-card font-medium text-foreground shadow-sm"
              : "font-normal text-muted-foreground hover:text-foreground"
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

export { SettingsTabs }
export default SettingsTabs
