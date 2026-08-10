import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { QrCode, Printer } from "lucide-react"

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

function MemberRow({ member, checked, onCheckedChange, onPrint, onEdit, onOpen }) {
  return (
    <tr
      className={cn("border-b border-border last:border-0", onOpen && "cursor-pointer hover:bg-muted/40")}
      onClick={() => onOpen?.(member)}
      role={onOpen ? "link" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen?.(member)
      }}
    >
      {/* Checkbox and the action buttons sit inside the row, so their clicks
          must not also trigger the row's navigation. */}
      <td className="w-10 py-4 pl-4" onClick={(event) => event.stopPropagation()}>
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
            {initials(member.name)}
          </div>
          <p className="text-sm font-medium text-foreground/85">{member.name}</p>
        </div>
      </td>
      <td className="py-4 pr-4">
        <p className="text-sm text-foreground/80">{member.email || "—"}</p>
        <p className="text-xs text-muted-foreground">{member.phone || "—"}</p>
      </td>
      <td className="py-4 pr-4">
        {member.groups?.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {member.groups.map((g) => (
              <Badge key={g.role} variant="outline" className="text-muted-foreground">
                {g.role}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-foreground/80">—</span>
        )}
      </td>
      <td className="py-4 pr-4 text-sm text-foreground/80">{member.baptized}</td>
      <td className="py-4 pr-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyles[member.status] || defaultStatusStyle
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[member.status] || defaultDotStyle)} />
          {member.status}
        </span>
      </td>
      <td className="py-4 pr-4" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(member)}
            className="text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onPrint(member)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
          >
            <QrCode className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export { MemberRow }
export default MemberRow
