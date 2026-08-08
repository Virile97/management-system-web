import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

function MemberSearch({ value, onChange, disabled = false }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search members..."
        className="h-9 rounded-lg bg-white pl-9"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  )
}

export { MemberSearch }
export default MemberSearch
