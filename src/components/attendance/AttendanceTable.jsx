"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TimePickerInput } from "@/components/attendance/TimePickerInput"
import { Pagination } from "@/components/common/Pagination"
import { SortableTh } from "@/components/common/SortableTh"
import { EmptyState } from "@/components/common/EmptyState"
import { ListCardSkeleton } from "@/components/dashboard/DashboardSkeletons"
import { useTableSort } from "@/hooks/use-table-sort"
import { cn } from "@/lib/utils"
import { ClipboardX } from "lucide-react"

const SORT_COLUMNS = {
  name: { get: (row) => row.name, type: "string" },
  level: { get: (row) => row.level, type: "string" },
  status: { get: (row) => row.status, type: "string" },
}

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

function slotsFromMember(member) {
  return {
    times: {
      morningIn: member.morningIn,
      morningOut: member.morningOut,
      afternoonIn: member.afternoonIn,
      afternoonOut: member.afternoonOut,
    },
    checked: {
      morningIn: Boolean(member.morningIn),
      morningOut: Boolean(member.morningOut),
      afternoonIn: Boolean(member.afternoonIn),
      afternoonOut: Boolean(member.afternoonOut),
    },
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
  Career: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Ladies: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  Men: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  "Young People":
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  "Young Ladies":
    "bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300",
}

const statusStyles = {
  "Full day":
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  "Morning only":
    "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  "Afternoon only":
    "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  Partial: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Absent: "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400",
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** Desktop table at md+; mobile cards below. One layout at a time so slot state stays single-source. */
function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)")
    const sync = () => setIsDesktop(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return isDesktop
}

function TimeCell({ checked, value, disabled, onCheckedChange, onChange }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-none">
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

function SessionBlock({
  title,
  tone,
  inChecked,
  inValue,
  outChecked,
  outValue,
  onToggleIn,
  onToggleOut,
  onChangeIn,
  onChangeOut,
}) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2.5">
      <span
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium tracking-wide",
          tone === "morning" ? "text-amber-600" : "text-blue-600"
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "morning" ? "bg-amber-500" : "bg-blue-500"
          )}
        />
        {title}
      </span>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Time In
          </p>
          <TimeCell
            checked={inChecked}
            value={inValue}
            onCheckedChange={onToggleIn}
            onChange={onChangeIn}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Time Out
          </p>
          <TimeCell
            checked={outChecked}
            value={outValue}
            onCheckedChange={onToggleOut}
            onChange={onChangeOut}
          />
        </div>
      </div>
    </div>
  )
}

function useAttendanceMemberState(member, onSlotChange) {
  const timeSaveTimer = useRef(null)
  const seed = slotsFromMember(member)

  const [times, setTimes] = useState(seed.times)
  const [checkedSlots, setCheckedSlots] = useState(seed.checked)

  // Re-seed only when the row's identity/day changes (filter/page). Slot
  // writes patch the store without remounting — local state stays authoritative
  // so checkboxes do not flicker or uncheck while saves complete.
  useEffect(() => {
    const next = slotsFromMember(member)
    setTimes(next.times)
    setCheckedSlots(next.checked)
  }, [member.id, member.date])

  useEffect(() => {
    return () => {
      if (timeSaveTimer.current) clearTimeout(timeSaveTimer.current)
    }
  }, [])

  function applyCompanionPatch(patch) {
    if (!patch) return

    setTimes((prev) => {
      const next = { ...prev }
      for (const key of ["morningOut", "afternoonOut"]) {
        if (patch[key] != null && !prev[key]) next[key] = patch[key]
      }
      return next
    })
    setCheckedSlots((prev) => {
      const next = { ...prev }
      for (const key of ["morningOut", "afternoonOut"]) {
        if (patch[key] != null && !prev[key]) next[key] = true
      }
      return next
    })
  }

  async function persist(field, displayTime) {
    if (!onSlotChange) return

    try {
      const patch = await onSlotChange(member.id, field, displayTime)
      applyCompanionPatch(patch)
    } catch {
      const next = slotsFromMember(member)
      setTimes(next.times)
      setCheckedSlots(next.checked)
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

  return {
    times,
    checkedSlots,
    status: deriveStatus(checkedSlots) || member.status,
    updateTime,
    toggleSlot,
  }
}

function AttendanceCard({ member, index, onSlotChange }) {
  const { times, checkedSlots, status, updateTime, toggleSlot } =
    useAttendanceMemberState(member, onSlotChange)
  const color = avatarColors[index % avatarColors.length]

  return (
    <article className="border-b border-border px-3 py-4 last:border-0 sm:px-4">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
            color
          )}
        >
          {initials(member.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground/85">
              {member.name}
            </p>
            {status ? (
              <Badge
                className={cn(
                  "shrink-0 border-0",
                  statusStyles[status] ?? "bg-muted text-muted-foreground"
                )}
              >
                {status}
              </Badge>
            ) : (
              <span className="shrink-0 text-sm text-muted-foreground">—</span>
            )}
          </div>
          <Badge
            className={cn(
              "mt-1.5 border-0",
              levelBadgeStyles[member.level] ??
                "bg-muted text-muted-foreground"
            )}
          >
            {member.level}
          </Badge>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <SessionBlock
          title="Morning Session"
          tone="morning"
          inChecked={checkedSlots.morningIn}
          inValue={times.morningIn}
          outChecked={checkedSlots.morningOut}
          outValue={times.morningOut}
          onToggleIn={toggleSlot("morningIn")}
          onToggleOut={toggleSlot("morningOut")}
          onChangeIn={updateTime("morningIn")}
          onChangeOut={updateTime("morningOut")}
        />
        <SessionBlock
          title="Afternoon Session"
          tone="afternoon"
          inChecked={checkedSlots.afternoonIn}
          inValue={times.afternoonIn}
          outChecked={checkedSlots.afternoonOut}
          outValue={times.afternoonOut}
          onToggleIn={toggleSlot("afternoonIn")}
          onToggleOut={toggleSlot("afternoonOut")}
          onChangeIn={updateTime("afternoonIn")}
          onChangeOut={updateTime("afternoonOut")}
        />
      </div>
    </article>
  )
}

function AttendanceRow({ member, index, onSlotChange }) {
  const color = avatarColors[index % avatarColors.length]
  const { times, checkedSlots, status, updateTime, toggleSlot } =
    useAttendanceMemberState(member, onSlotChange)

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
  onPageSizeChange,
  onSlotChange,
}) {
  const isDesktop = useDesktopLayout()
  const { sortedRows, sortKey, sortDirection, toggleSort } = useTableSort(
    members,
    SORT_COLUMNS,
    { initialKey: "name", initialDirection: "asc" }
  )
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
          className="py-12 sm:py-16"
        />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10">
      {isDesktop ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <SortableTh
                  label="Member"
                  sortKey="name"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={toggleSort}
                  className="pl-4"
                />
                <SortableTh
                  label="Level"
                  sortKey="level"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={toggleSort}
                />
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
                <SortableTh
                  label="Status"
                  sortKey="status"
                  activeKey={sortKey}
                  direction={sortDirection}
                  onSort={toggleSort}
                  className="border-l border-border pl-4"
                />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((member, index) => (
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
      ) : (
        <div>
          {sortedRows.map((member, index) => (
            <AttendanceCard
              key={member.id}
              member={member}
              index={index}
              onSlotChange={onSlotChange}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        from={from}
        to={to}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}

export { AttendanceTable }
export default AttendanceTable
