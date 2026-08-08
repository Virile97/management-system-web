import { cn } from "@/lib/utils"

function FilterPills({ options, active, onChange, disabled = false }) {
  return (
    <div className="flex h-8 items-center gap-1 overflow-x-auto rounded-lg bg-white p-1 ring-1 ring-border">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option)}
          className={cn(
            "flex h-full shrink-0 items-center rounded-md px-3 text-sm transition-colors",
            active === option
              ? "bg-[#1e2a4a] font-medium text-white"
              : "font-normal text-muted-foreground hover:text-foreground",
            disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground"
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
