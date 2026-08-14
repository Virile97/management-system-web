import { cn } from "@/lib/utils"

function FilterPills({ options, active, onChange, disabled = false }) {
  return (
    <div className="flex h-10 w-full items-center gap-1 overflow-x-auto rounded-lg bg-card p-1 ring-1 ring-border scrollbar-none sm:h-8 sm:w-auto">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option)}
          className={cn(
            "flex h-full min-w-0 flex-1 items-center justify-center rounded-md px-3 text-sm transition-colors sm:flex-none",
            active === option
              ? "bg-[#1e2a4a] font-medium text-white"
              : "font-normal text-muted-foreground hover:text-foreground",
            disabled &&
              "cursor-not-allowed opacity-50 hover:text-muted-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export { FilterPills }
export default FilterPills
