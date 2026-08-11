import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { QrCode } from "lucide-react"

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-600",
  Inactive: "bg-amber-50 text-amber-600",
  Deceased: "bg-red-50 text-red-500",
}

const dotStyles = {
  Active: "bg-emerald-500",
  Inactive: "bg-amber-500",
  Deceased: "bg-red-500",
}

const defaultStatusStyle = "bg-muted text-muted-foreground"
const defaultDotStyle = "bg-muted-foreground"

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function MemberCard({ member, checked, onCheckedChange, onPrint, onEdit, onOpen }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border p-4 last:border-0",
        onOpen && "cursor-pointer active:bg-muted/40"
      )}
      onClick={() => onOpen?.(member)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Stops the checkbox tap from also opening the member. */}
          <span onClick={(event) => event.stopPropagation()}>
            <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
          </span>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
            {initials(member.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground/85">{member.name}</p>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyles[member.status] || defaultStatusStyle
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[member.status] || defaultDotStyle)} />
          {member.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-13 text-sm">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Contact</p>
          <p className="truncate text-foreground/80">{member.email || "—"}</p>
          <p className="text-xs text-muted-foreground">{member.phone || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Group</p>
          {member.groups?.length > 0 ? (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {member.groups.map((g) => (
                <Badge key={g.role} variant="outline" className="text-muted-foreground">
                  {g.role}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-foreground/80">—</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Baptized</p>
          <p className="text-foreground/80">{member.baptized}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 pl-13" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={() => onEdit?.(member)}
          className="text-sm font-medium text-foreground/80 hover:text-foreground"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onPrint?.(member)}
          aria-label={`Print QR code for ${member.name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
        >
          <QrCode className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export { MemberCard }
export default MemberCard
