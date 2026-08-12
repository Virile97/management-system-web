import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  Mail,
  Phone,
  CalendarDays,
  Droplet,
  Briefcase,
  MapPin,
  Pencil,
} from "lucide-react"

// Status pill on the navy header, so these are the translucent-on-dark
// variants of the list/table status colors rather than the same classes.
const statusStyles = {
  Active: "bg-emerald-400/15 text-emerald-300",
  Inactive: "bg-amber-400/15 text-amber-300",
  Deceased: "bg-red-400/15 text-red-300",
}
const defaultStatusStyle = "bg-white/10 text-white/70"

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(value) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="text-sm wrap-break-word text-foreground/85">
          {value || "—"}
        </p>
      </div>
    </div>
  )
}

function MemberProfileCard({ member, onEdit }) {
  const primaryGroup = member.groups?.[0]?.role

  return (
    <Card className="overflow-hidden rounded-2xl p-0">
      <div className="relative flex flex-col items-center gap-3 bg-[#1e2a4a] px-4 py-6 text-center">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(member)}
            aria-label="Edit member"
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
          {initials(member.name)}
        </div>

        <p className="font-heading text-base font-medium text-white">
          {member.name}
        </p>

        <div className="flex flex-col items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              statusStyles[member.status] || defaultStatusStyle
            )}
          >
            {member.status}
          </span>
          {primaryGroup && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/80">
              {primaryGroup}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white">
        <DetailRow icon={Mail} label="Email" value={member.email} />
        <DetailRow icon={Phone} label="Phone" value={member.phone} />
        <DetailRow
          icon={CalendarDays}
          label="Joined"
          value={formatDate(member.joinedAt || member.createdAt)}
        />
        <DetailRow icon={Droplet} label="Baptized" value={member.baptized} />
        <DetailRow
          icon={Briefcase}
          label="Occupation"
          value={member.occupation}
        />
        <DetailRow icon={MapPin} label="Address" value={member.address} />
      </div>
    </Card>
  )
}

export { MemberProfileCard }
export default MemberProfileCard
