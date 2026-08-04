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

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function MemberRow({ member, checked, onCheckedChange, onPrint }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="w-10 py-4 pl-4">
        <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white">
            {initials(member.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/85">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.gender}</p>
          </div>
        </div>
      </td>
      <td className="py-4 pr-4">
        <p className="text-sm text-foreground/80">{member.email}</p>
        <p className="text-xs text-muted-foreground">{member.phone}</p>
      </td>
      <td className="py-4 pr-4 text-sm text-foreground/80">{member.group}</td>
      <td className="py-4 pr-4 text-sm text-foreground/80">{member.joined}</td>
      <td className="py-4 pr-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyles[member.status]
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[member.status])} />
          {member.status}
        </span>
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <button type="button" className="text-sm font-medium text-foreground/80 hover:text-foreground">
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
