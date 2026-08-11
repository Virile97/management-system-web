import { cn } from "@/lib/utils"

const dotColors = {
  All: "bg-foreground/70",
  Career: "bg-amber-500",
  Ladies: "bg-rose-500",
  Men: "bg-blue-500",
  "Young People": "bg-emerald-500",
  "Young Ladies": "bg-pink-500",
}

function AttendanceGroupTabs({ groups, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {groups.map((group) => {
        const name = group.name
        const label = group.label || (name === "All" ? "All Members" : name)
        const isActive = active === name

        return (
          <button
            key={group.id ?? name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              isActive
                ? "border-[#1e2a4a] bg-[#1e2a4a] text-white"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[name] ?? "bg-foreground/50")} />
            {label}
            <span className={isActive ? "text-white/70" : "text-muted-foreground"}>
              ({group.count})
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { AttendanceGroupTabs }
export default AttendanceGroupTabs
