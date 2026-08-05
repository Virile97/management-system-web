"use client"

import { FileText, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { key: "offering-slip", label: "Offering Slip", icon: FileText },
  { key: "users-roles", label: "Users & Roles", icon: Users },
]

function SettingsTabs({ active, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
            active === tab.key
              ? "bg-card font-medium text-foreground shadow-sm"
              : "font-normal text-muted-foreground hover:text-foreground"
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export { SettingsTabs }
export default SettingsTabs
