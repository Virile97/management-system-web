import { cn } from "@/lib/utils"

const filters = ["All", "Active", "Inactive", "Deceased"]

function MemberFilters({ active, counts, onChange }) {
  return (
    <div className="flex h-8 items-center gap-1 overflow-x-auto rounded-lg bg-white p-1 ring-1 ring-border">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={cn(
            "flex h-full shrink-0 items-center rounded-md px-3 text-sm transition-colors",
            active === filter
              ? "bg-[#1e2a4a] font-medium text-white"
              : "font-normal text-muted-foreground hover:text-foreground"
          )}
        >
          {filter} ({counts[filter]})
        </button>
      ))}
    </div>
  )
}

export { MemberFilters }
export default MemberFilters
