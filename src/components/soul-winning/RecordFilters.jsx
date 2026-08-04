import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, Users } from "lucide-react"

const statusLabels = {
  all: "All Statuses",
  "new-convert": "New Convert",
  "active-member": "Active Member",
  inactive: "Inactive",
}

function RecordFilters({ search, onSearchChange, status, onStatusChange, soulWinner, onSoulWinnerChange, soulWinners, resultCount }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col gap-3 sm:flex-1 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search converts or soul winners..."
            className="h-10 rounded-lg bg-white pl-9"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 w-full rounded-lg sm:w-44">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <SelectValue>{(value) => statusLabels[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new-convert">New Convert</SelectItem>
              <SelectItem value="active-member">Active Member</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={soulWinner} onValueChange={onSoulWinnerChange}>
            <SelectTrigger className="h-10 w-full rounded-lg sm:w-48">
              <Users className="h-4 w-4 text-muted-foreground" />
              <SelectValue>
                {(value) => (value === "all" ? "All Soul Winners" : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Soul Winners</SelectItem>
              {soulWinners.map((winner) => (
                <SelectItem key={winner} value={winner}>
                  {winner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="shrink-0 text-sm text-muted-foreground">{resultCount} results</p>
    </div>
  )
}

export { RecordFilters }
export default RecordFilters
