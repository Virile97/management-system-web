"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TimePickerInput } from "@/components/attendance/TimePickerInput"
import { Pagination } from "@/components/common/Pagination"
import { EmptyState } from "@/components/common/EmptyState"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { cn } from "@/lib/utils"
import { ClipboardX } from "lucide-react"

function currentTimeString() {
  const now = new Date()
  const hour = now.getHours() % 12 || 12
  const period = now.getHours() < 12 ? "AM" : "PM"

  return `${String(hour).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ${period}`
}

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
  "Young Ladies": "bg-pink-50 text-pink-600",
}

const statusStyles = {
  "Full day": "bg-emerald-50 text-emerald-600",
  "Morning only": "bg-amber-50 text-amber-600",
  "Afternoon only": "bg-blue-50 text-blue-600",
  Partial: "bg-amber-50 text-amber-600",
  Absent: "bg-red-50 text-red-500",
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function TimeCell({ checked, value, disabled, onCheckedChange, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
      <TimePickerInput
        value={value}
        onChange={onChange}
        disabled={!checked || disabled}
      />
    </div>
  )
}

function AttendanceRow({ member, index, onSlotChange }) {
  const color = avatarColors[index % avatarColors.length]
  const [isSaving, setIsSaving] = useState(false)
  const timeSaveTimer = useRef(null)

  const [times, setTimes] = useState({
    morningIn: member.morningIn,
    morningOut: member.morningOut,
    afternoonIn: member.afternoonIn,
    afternoonOut: member.afternoonOut,
  })

  const [checkedSlots, setCheckedSlots] = useState({
    morningIn: Boolean(member.morningIn),
    morningOut: Boolean(member.morningOut),
    afternoonIn: Boolean(member.afternoonIn),
    afternoonOut: Boolean(member.afternoonOut),
  })

  useEffect(() => {
    setTimes({
      morningIn: member.morningIn,
      morningOut: member.morningOut,
      afternoonIn: member.afternoonIn,
      afternoonOut: member.afternoonOut,
    })
    setCheckedSlots({
      morningIn: Boolean(member.morningIn),
      morningOut: Boolean(member.morningOut),
      afternoonIn: Boolean(member.afternoonIn),
      afternoonOut: Boolean(member.afternoonOut),
    })
  }, [member])

  useEffect(() => {
    return () => {
      if (timeSaveTimer.current) clearTimeout(timeSaveTimer.current)
    }
  }, [])

  async function persist(field, displayTime) {
    if (!onSlotChange) return

    setIsSaving(true)
    try {
      await onSlotChange(member.id, field, displayTime)
    } catch {
      setTimes({
        morningIn: member.morningIn,
        morningOut: member.morningOut,
        afternoonIn: member.afternoonIn,
        afternoonOut: member.afternoonOut,
      })
      setCheckedSlots({
        morningIn: Boolean(member.morningIn),
        morningOut: Boolean(member.morningOut),
        afternoonIn: Boolean(member.afternoonIn),
        afternoonOut: Boolean(member.afternoonOut),
      })
    } finally {
      setIsSaving(false)
    }
  }

  function updateTime(key) {
    return (value) => {
      setTimes((prev) => ({ ...prev, [key]: value }))

      if (timeSaveTimer.current) clearTimeout(timeSaveTimer.current)
      timeSaveTimer.current = setTimeout(() => {
        if (!value) return
        persist(key, value)
      }, 400)
    }
  }

  function toggleSlot(key) {
    return (isChecked) => {
      const nextValue = isChecked ? currentTimeString() : null

      setCheckedSlots((prev) => {
        const next = { ...prev, [key]: isChecked }
        if (key === "morningIn" && !isChecked) next.morningOut = false
        if (key === "afternoonIn" && !isChecked) next.afternoonOut = false
        return next
      })

      setTimes((prev) => {
        const next = { ...prev, [key]: nextValue }
        if (key === "morningIn" && !isChecked) next.morningOut = null
        if (key === "afternoonIn" && !isChecked) next.afternoonOut = null
        return next
      })

      persist(key, nextValue)
    }
  }

  const status = deriveStatus(checkedSlots) || member.status

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
          <p className="text-sm font-medium text-foreground/85">
            {member.name}
          </p>
        </div>
      </td>
      <td className="py-4 pr-4">
        <Badge
          className={cn(
            "border-0",
            levelBadgeStyles[member.level] ?? "bg-muted text-muted-foreground"
          )}
        >
          {member.level}
        </Badge>
      </td>
      <td className="border-l border-border p-4">
        <div className="flex items-center gap-3">
          <TimeCell
            checked={checkedSlots.morningIn}
            value={times.morningIn}
            disabled={isSaving}
            onCheckedChange={toggleSlot("morningIn")}
            onChange={updateTime("morningIn")}
          />
          <TimeCell
            checked={checkedSlots.morningOut}
            value={times.morningOut}
            disabled={isSaving}
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
            disabled={isSaving}
            onCheckedChange={toggleSlot("afternoonIn")}
            onChange={updateTime("afternoonIn")}
          />
          <TimeCell
            checked={checkedSlots.afternoonOut}
            value={times.afternoonOut}
            disabled={isSaving}
            onCheckedChange={toggleSlot("afternoonOut")}
            onChange={updateTime("afternoonOut")}
          />
        </div>
      </td>
      <td className="border-l border-border p-4">
        {status ? (
          <Badge
            className={cn(
              "border-0",
              statusStyles[status] ?? "bg-muted text-muted-foreground"
            )}
          >
            {status}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  )
}

function AttendanceTable({
  members,
  isLoading = false,
  page = 1,
  totalPages = 1,
  total = members.length,
  pageSize = members.length,
  onPageChange,
  onSlotChange,
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + members.length

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <ListCardSkeleton
          rows={Math.min(pageSize, 8)}
          className="border-0 p-4 shadow-none sm:p-6"
        />
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
        <EmptyState
          icon={ClipboardX}
          title="No members found"
          description="Try another date, level, or search."
          className="py-16"
        />
      </div>
    )
  }

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
              <th className="w-0 border-l border-border px-4 py-3 text-left">
                <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide whitespace-nowrap text-amber-600">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Morning Session
                </span>
                <span className="mt-1 flex gap-2 text-[11px] font-normal tracking-normal text-muted-foreground normal-case">
                  <span className="w-30">Time In</span>
                  <span className="w-30">Time Out</span>
                </span>
              </th>
              <th className="w-0 border-l border-border px-4 py-3 text-left">
                <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide whitespace-nowrap text-blue-600">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  Afternoon Session
                </span>
                <span className="mt-1 flex gap-2 text-[11px] font-normal tracking-normal text-muted-foreground normal-case">
                  <span className="w-30">Time In</span>
                  <span className="w-30">Time Out</span>
                </span>
              </th>
              <th className="w-0 border-l border-border px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <AttendanceRow
                key={member.id}
                member={member}
                index={index}
                onSlotChange={onSlotChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  )
}

export { AttendanceTable }
export default AttendanceTable
