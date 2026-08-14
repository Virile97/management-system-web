import { cn } from "@/lib/utils"

function SidebarItem({ icon: Icon, label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
        active
          ? "bg-white/10 font-medium text-white"
          : "font-normal text-white/55 hover:bg-white/6 hover:text-white/90"
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-400"
        />
      ) : null}

      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-amber-400/15 text-amber-300"
            : "bg-white/4 text-white/55 group-hover:bg-white/8 group-hover:text-white/80"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>

      <span className="min-w-0 flex-1 truncate">{label}</span>
    </button>
  )
}

export { SidebarItem }
export default SidebarItem
