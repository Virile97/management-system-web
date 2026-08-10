import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TimePickerInput } from "@/components/attendance/TimePickerInput"
import { Pagination } from "@/components/common/Pagination"
import { cn } from "@/lib/utils"

function currentTimeString() {
  const now = new Date()
  let hour = now.getHours() % 12 || 12
  const period = now.getHours() < 12 ? "AM" : "PM"

  return `${String(hour).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${period}`
}

// Status is derived from which sessions were logged, not stored — a session
// counts as attended once its Time In is checked. Clearing every checkbox
// clears the status too, rather than leaving a stale label behind.
function deriveStatus(checkedSlots) {
  const morning = checkedSlots.morningIn
  const afternoon = checkedSlots.afternoonIn

  switch (true) {
    case morning && afternoon:
      return "Full day"
    case morning:
      return "Morning only"
    case afternoon:
      return "Afternoon only"
    default:
      return null
  }
}

const avatarColors = [
  "bg-[#1e2a4a]",
  "bg-emerald-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-blue-600",
]

const levelBadgeStyles = {
  Career: "bg-amber-50 text-amber-600",
  Ladies: "bg-rose-50 text-rose-600",
  Men: "bg-blue-50 text-blue-600",
  "Young People": "bg-emerald-50 text-emerald-600",
}

const statusStyles = {
  "Full day": "bg-emerald-50 text-emerald-600",
  "Morning only": "bg-amber-50 text-amber-600",
  "Afternoon only": "bg-blue-50 text-blue-600",
  Absent: "bg-red-50 text-red-500",
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function TimeCell({ checked, value, onCheckedChange, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} />
      <TimePickerInput value={value} onChange={onChange} disabled={!checked} />
    </div>
  )
}

function AttendanceRow({ member, index }) {
  const color = avatarColors[index % avatarColors.length]

  const [times, setTimes] = useState({
    morningIn: member.morningIn,
    morningOut: member.morningOut,
    afternoonIn: member.afternoonIn,
    afternoonOut: member.afternoonOut,
  })

  // Checked reflects whether each slot has been logged at all — driven by
  // the checkbox, independent of whatever time ends up in it.
  const [checkedSlots, setCheckedSlots] = useState({
    morningIn: Boolean(member.morningIn),
    morningOut: Boolean(member.morningOut),
    afternoonIn: Boolean(member.afternoonIn),
    afternoonOut: Boolean(member.afternoonOut),
  })

  function updateTime(key) {
    return (value) => setTimes((prev) => ({ ...prev, [key]: value }))
  }

  // Checking a slot logs it as "now"; the time picker only exists to
  // override that value afterward. Unchecking clears and disables it.
  function toggleSlot(key) {
    return (isChecked) => {
      setCheckedSlots((prev) => ({ ...prev, [key]: isChecked }))
      setTimes((prev) => ({ ...prev, [key]: isChecked ? currentTimeString() : null }))
    }
  }

  const status = deriveStatus(checkedSlots)

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-4 pr-4 pl-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
              color
            )}
          >
            {initials(member.name)}
          </div>
          <p className="text-sm font-medium text-foreground/85">{member.name}</p>
        </div>
      </td>
      <td className="py-4 pr-4">
        <Badge className={cn("border-0", levelBadgeStyles[member.level])}>{member.level}</Badge>
      </td>
      <td className="border-l border-border p-4">
        <div className="flex items-center gap-3">
          <TimeCell
            checked={checkedSlots.morningIn}
            value={times.morningIn}
            onCheckedChange={toggleSlot("morningIn")}
            onChange={updateTime("morningIn")}
          />
          <TimeCell
            checked={checkedSlots.morningOut}
            value={times.morningOut}
            onCheckedChange={toggleSlot("morningOut")}
            onChange={updateTime("morningOut")}
          />
        </div>
      </td>
      <td className="border-l border-border p-4">
        <div className="flex items-center gap-3">
          <TimeCell
            checked={checkedSlots.afternoonIn}
            value={times.afternoonIn}
            onCheckedChange={toggleSlot("afternoonIn")}
            onChange={updateTime("afternoonIn")}
          />
          <TimeCell
            checked={checkedSlots.afternoonOut}
            value={times.afternoonOut}
            onCheckedChange={toggleSlot("afternoonOut")}
            onChange={updateTime("afternoonOut")}
          />
        </div>
      </td>
      <td className="border-l border-border p-4">
        {status ? (
          <Badge className={cn("border-0", statusStyles[status])}>{status}</Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  )
}

function AttendanceTable({
  members,
  page = 1,
  totalPages = 1,
  total = members.length,
  pageSize = members.length,
  onPageChange,
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + members.length

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            <th className="py-3 pr-4 pl-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Member
            </th>
            <th className="py-3 pr-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Level
            </th>
            <th className="w-0 border-l border-border py-3 px-4 text-left">
              <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide whitespace-nowrap text-amber-600">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Morning Session
              </span>
              <span className="mt-1 flex gap-2 text-[11px] font-normal tracking-normal text-muted-foreground normal-case">
                <span className="w-30">Time In</span>
                <span className="w-30">Time Out</span>
              </span>
            </th>
            <th className="w-0 border-l border-border py-3 px-4 text-left">
              <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide whitespace-nowrap text-blue-600">
                <span className="size-1.5 rounded-full bg-blue-500" />
                Afternoon Session
              </span>
              <span className="mt-1 flex gap-2 text-[11px] font-normal tracking-normal text-muted-foreground normal-case">
                <span className="w-30">Time In</span>
                <span className="w-30">Time Out</span>
              </span>
            </th>
            <th className="w-0 border-l border-border py-3 px-4 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <AttendanceRow key={member.id} member={member} index={index} />
          ))}
        </tbody>
      </table>
      </div>

      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}

export { AttendanceTable }
export default AttendanceTable
