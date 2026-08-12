import { getCsrfHeader } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"
import { toDateInputValue } from "@/utils/helpers"

const STATUS_LABELS = {
  full_day: "Full day",
  morning_only: "Morning only",
  afternoon_only: "Afternoon only",
  partial: "Partial",
  absent: "Absent",
  present: "Present",
}

/**
 * Formats an ISO datetime into the "hh:mm AM/PM" string TimePickerInput expects.
 * Uses local calendar parts so the picker matches what the user recorded.
 */
function formatAttendanceTime(iso) {
  if (!iso) return null

  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) return null

  const hour24 = value.getHours()
  const hour12 = hour24 % 12 || 12
  const period = hour24 < 12 ? "AM" : "PM"
  const minute = String(value.getMinutes()).padStart(2, "0")

  return `${String(hour12).padStart(2, "0")}:${minute} ${period}`
}

/**
 * Builds a local "YYYY-MM-DDTHH:mm:ss" datetime from a date + TimePicker value.
 * Matches the attendance API's expected shape (no Z / offset).
 */
function toAttendanceDateTime(date, timeDisplay) {
  if (!date || !timeDisplay) return null

  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(
    String(timeDisplay).trim()
  )

  if (!match) return null

  let hour = Number(match[1])
  const minute = Number(match[2])
  const period = match[3].toUpperCase()

  if (period === "AM" && hour === 12) hour = 0
  if (period === "PM" && hour !== 12) hour += 12

  const pad = (n) => String(n).padStart(2, "0")
  return `${date}T${pad(hour)}:${pad(minute)}:00`
}

function formatStatusLabel(status) {
  if (!status) return null
  return (
    STATUS_LABELS[status] ??
    String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  )
}

function normalizeSummary(summary = {}) {
  return {
    total: summary.totalMembers ?? 0,
    present: summary.present ?? 0,
    attendanceRate: summary.attendanceRate ?? 0,
    fullDay: summary.fullDay ?? 0,
    partial: summary.partial ?? 0,
    partialMorning: summary.morningOnly ?? 0,
    partialAfternoon: summary.afternoonOnly ?? 0,
    absent: summary.absent ?? 0,
  }
}

function normalizeLevel(level) {
  return {
    id: level?.id ?? null,
    name: level?.name === "All Members" ? "All" : (level?.name ?? "All"),
    label: level?.name ?? "All Members",
    count: level?.count ?? 0,
  }
}

function formatMemberName(member) {
  if (!member) return "—"
  if (member.name) return member.name
  return (
    [member.firstName, member.middleName, member.lastName]
      .filter(Boolean)
      .join(" ") || "—"
  )
}

/**
 * List items carry `attendances: []` for the requested day. Empty means the
 * member has no check-in yet — leave table fields blank (no prefill).
 */
function pickAttendanceRecord(item, date) {
  const records = Array.isArray(item?.attendances)
    ? item.attendances
    : item?.attendance
      ? Array.isArray(item.attendance)
        ? item.attendance
        : [item.attendance]
      : []

  if (records.length === 0) return null

  if (date) {
    const match = records.find(
      (record) => resolveRecordDate(record, record) === date
    )
    if (match) return match
  }

  return [...records].sort((a, b) =>
    String(b?.date || "").localeCompare(String(a?.date || ""))
  )[0]
}

function normalizeItem(item, date) {
  const member = item?.member ?? {}
  const attendance = pickAttendanceRecord(item, date)

  // No attendance row for this day → blank fields (fresh day, no prefill).
  if (!attendance) {
    return {
      id: member.id,
      name: formatMemberName(member),
      level: member.level?.name || "—",
      morningIn: null,
      morningOut: null,
      afternoonIn: null,
      afternoonOut: null,
      status: null,
      date: date || null,
      attendanceId: null,
    }
  }

  const status =
    formatStatusLabel(attendance?.status) || derivePresentLabel(attendance)

  return {
    id: member.id,
    name: formatMemberName(member),
    level: member.level?.name || "—",
    morningIn: formatAttendanceTime(attendance?.morningIn),
    morningOut: formatAttendanceTime(attendance?.morningOut),
    afternoonIn: formatAttendanceTime(attendance?.afternoonIn),
    afternoonOut: formatAttendanceTime(attendance?.afternoonOut),
    status: status === "Absent" ? null : status,
    date: resolveRecordDate(attendance, attendance) || date || null,
    attendanceId: attendance?.id ?? null,
  }
}

function resolveRecordDate(row, attendance) {
  const raw =
    row?.date ||
    attendance?.date ||
    attendance?.morningIn ||
    attendance?.afternoonIn ||
    attendance?.morningOut ||
    attendance?.afternoonOut

  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) return String(raw)

  const parsed = new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return toDateInputValue(parsed)
}

function derivePresentLabel(attendance) {
  if (!attendance) return "Absent"
  if (attendance.status) return formatStatusLabel(attendance.status)

  const morning = Boolean(attendance.morningIn)
  const afternoon = Boolean(attendance.afternoonIn)
  if (morning && afternoon) return "Full day"
  if (morning) return "Morning only"
  if (afternoon) return "Afternoon only"
  return "Absent"
}

/**
 * Maps `GET /members/:id` → `attendances[]` (newest first) into the same
 * session-row shape the attendance table / member overview uses.
 */
function mapMemberAttendances(attendances = []) {
  return (Array.isArray(attendances) ? attendances : [])
    .map((attendance, index) => {
      const statusLabel = derivePresentLabel(attendance)
      const hasAnyTime = Boolean(
        attendance?.morningIn ||
        attendance?.morningOut ||
        attendance?.afternoonIn ||
        attendance?.afternoonOut
      )

      if (!hasAnyTime && (!attendance?.status || statusLabel === "Absent")) {
        return null
      }

      return {
        id: attendance?.id ?? `attendance-${index}`,
        date: resolveRecordDate(attendance, attendance),
        morningIn: formatAttendanceTime(attendance?.morningIn),
        morningOut: formatAttendanceTime(attendance?.morningOut),
        afternoonIn: formatAttendanceTime(attendance?.afternoonIn),
        afternoonOut: formatAttendanceTime(attendance?.afternoonOut),
        status: statusLabel === "Absent" ? null : statusLabel,
      }
    })
    .filter(Boolean)
}

async function listAttendance(
  {
    from = "",
    to = "",
    date = "",
    level = "",
    search = "",
    page = 1,
    limit = 20,
  } = {},
  signal
) {
  const params = new URLSearchParams()

  const fromDate = from || date || toDateInputValue()
  const toDate = to || date || fromDate
  // Slot editing / row normalization still key off a single day — use the
  // range end (or the legacy `date`) so a one-day range behaves as before.
  const activeDate = toDate || fromDate

  if (fromDate) params.set("from", fromDate)
  if (toDate) params.set("to", toDate)
  if (level) params.set("level", level)
  if (search) params.set("search", search)
  params.set("page", String(page))
  params.set("limit", String(limit))

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.ATTENDANCE}?${params.toString()}`,
    { signal }
  )

  return {
    from: data?.period?.from ?? fromDate,
    to: data?.period?.to ?? toDate,
    date: data?.date ?? activeDate,
    summary: normalizeSummary(data?.summary),
    levels: (data?.levels ?? []).map(normalizeLevel),
    items: (data?.items ?? []).map((item) => normalizeItem(item, activeDate)),
    meta: meta || { page, limit, total: 0, totalPages: 1 },
  }
}

/**
 * Partial upsert for one member's attendance on a date. Only include fields
 * that changed — send null to clear a slot. Omitting morningOut when setting
 * morningIn lets the backend default morningOut to noon.
 */
function upsertAttendance(memberId, payload, signal) {
  return fetchJson(APP_API_ENDPOINTS.ATTENDANCE_BY_MEMBER(memberId), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(payload),
    signal,
  })
}

export {
  listAttendance,
  upsertAttendance,
  mapMemberAttendances,
  formatAttendanceTime,
  toAttendanceDateTime,
  formatStatusLabel,
}
