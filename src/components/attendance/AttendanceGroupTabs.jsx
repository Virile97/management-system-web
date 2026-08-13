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
    <div className="-mx-3 flex items-center gap-2 overflow-x-auto px-3 pb-0.5 scrollbar-none sm:mx-0 sm:px-0">
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
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors sm:h-auto sm:py-1.5",
              isActive
                ? "border-[#1e2a4a] bg-[#1e2a4a] text-white"
                : "border-border bg-white text-muted-foreground hover:text-foreground"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isActive
                  ? "bg-white/70"
                  : (dotColors[name] ?? "bg-foreground/50")
              )}
            />
            <span className="whitespace-nowrap">{label}</span>
            <span
              className={isActive ? "text-white/70" : "text-muted-foreground"}
            >
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
