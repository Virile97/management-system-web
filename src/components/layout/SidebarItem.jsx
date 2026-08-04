import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

function SidebarItem({ icon: Icon, label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
        active
          ? "bg-white/10 font-semibold text-white"
          : "font-normal text-white/60 hover:bg-white/5 hover:text-white/80"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        <span>{label}</span>
      </div>
      {active && <ChevronRight className="h-4 w-4 text-amber-400" />}
    </button>
  )
}

export { SidebarItem }
export default SidebarItem
