import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { AlertCircle, QrCode } from "lucide-react"

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  Inactive: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Deceased: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
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

function MemberRow({
  member,
  checked,
  onCheckedChange,
  onPrint,
  onEdit,
  onOpen,
  isDeleting = false,
}) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors last:border-0",
        checked && "bg-primary/3",
        member.needsUpdate && !checked && "bg-red-50 dark:bg-red-500/5",
        onOpen && !isDeleting && "cursor-pointer hover:bg-muted/40",
        isDeleting && "pointer-events-none opacity-50"
      )}
      aria-busy={isDeleting || undefined}
      onClick={() => {
        if (!isDeleting) onOpen?.(member)
      }}
      role={onOpen ? "link" : undefined}
      tabIndex={onOpen && !isDeleting ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !isDeleting) onOpen?.(member)
      }}
    >
      {/* Checkbox and the action buttons sit inside the row, so their clicks
          must not also trigger the row's navigation. */}
      <td
        className="w-10 py-4 pl-4"
        onClick={(event) => event.stopPropagation()}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={isDeleting}
        />
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2a4a] text-xs font-semibold text-white ring-2 ring-background">
            {initials(member.name)}
          </div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            {member.name}
            {member.needsUpdate && (
              <AlertCircle
                className="h-3.5 w-3.5 shrink-0 text-red-500"
                aria-label="Needs update"
              />
            )}
          </p>
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
              <Badge
                key={g.role}
                variant="outline"
                className="text-muted-foreground"
              >
                {g.role}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-sm text-foreground/80">—</span>
        )}
      </td>
      <td className="py-4 pr-4 text-sm text-foreground/80">
        {member.baptized}
      </td>
      <td className="py-4 pr-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            statusStyles[member.status] || defaultStatusStyle
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              dotStyles[member.status] || defaultDotStyle
            )}
          />
          {member.status}
        </span>
      </td>
      <td className="py-4 pr-4" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(member)}
            disabled={isDeleting}
            className="rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onPrint?.(member)}
            disabled={isDeleting}
            aria-label={`Print QR code for ${member.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
