import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

function MemberSearch({ value, onChange, disabled = false }) {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search members..."
        className={cn("h-10 rounded-lg bg-card pl-9", value && "pr-9")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={disabled}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  )
}

export { MemberSearch }
export default MemberSearch
