import { getCsrfHeader } from "@/lib/auth"
import { fetchJson, fetchWithMeta } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

const PERIOD_VALUES = {
  Today: "today",
  "This Week": "week",
  "This Month": "month",
  "This Year": "year",
  "All Time": "all",
  Custom: "custom",
}

/**
 * Annual goal year implied by the overview period filter.
 * Preset periods (today/week/month/year/all) → current calendar year.
 * Custom range → the year of that range (single-year ranges preferred).
 */
function resolveGoalYear({ period = "This Month", from = "", to = "" } = {}) {
  const currentYear = new Date().getFullYear()
  if (period !== "Custom") return currentYear

  const startYear = from ? Number(String(from).slice(0, 4)) : null
  const endYear = to ? Number(String(to).slice(0, 4)) : null
  if (
    Number.isFinite(startYear) &&
    Number.isFinite(endYear) &&
    startYear === endYear
  ) {
    return startYear
  }
  if (Number.isFinite(endYear)) return endYear
  if (Number.isFinite(startYear)) return startYear
  return currentYear
}

function toPeriodParams({
  period = "This Month",
  from = "",
  to = "",
  year,
} = {}) {
  const value = PERIOD_VALUES[period] || period || "month"
  const params = new URLSearchParams({ period: value })
  if (value === "custom") {
    if (from) params.set("from", from)
    if (to) params.set("to", to)
  }
  const goalYear =
    year != null && year !== "" ? Number(year) : resolveGoalYear({ period, from, to })
  if (Number.isFinite(goalYear)) {
    params.set("year", String(goalYear))
  }
  return params
}

function formatPersonName(person) {
  if (!person) return "—"
  if (person.name) return person.name
  return (
    [person.firstName, person.middleName, person.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "—"
  )
}

function normalizeStatus(status) {
  if (!status) return "New Convert"
  if (status === "Active") return "Active Member"
  return status
}

function normalizeSoulWinners(record) {
  const fromArray = Array.isArray(record.soulWinners)
    ? record.soulWinners.filter(Boolean)
    : []
  if (fromArray.length > 0) return fromArray
  if (record.soulWinner) return [record.soulWinner]
  return []
}

function normalizeRecord(record) {
  const convert = record.convert || {}
  const soulWinners = normalizeSoulWinners(record)
  const primaryWinner = soulWinners[0] || record.soulWinner || null
  const status = normalizeStatus(record.status)
  const convertName = formatPersonName(convert)
  const contact =
    record.contact ?? convert.contact ?? null
  const age =
    record.age ?? convert.age ?? null
  const location = convert.location || ""
  const date = record.date || record.wonAt || null

  return {
    ...record,
    date,
    status,
    convert,
    convertName,
    contact,
    age,
    location,
    event: record.event ?? null,
    notes: record.notes ?? null,
    soulWinners,
    soulWinner: primaryWinner,
    soulWinnerName: formatPersonName(primaryWinner),
    soulWinnerNames: soulWinners.map(formatPersonName).filter((n) => n !== "—"),
    soulWinnerId: primaryWinner?.id || null,
    canBaptize: status === "New Convert" && !record.memberId,
  }
}

function getSoulWinningOverview(options, signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.SOUL_WINNING_OVERVIEW}?${toPeriodParams(options)}`,
    { signal }
  )
}

function getSoulWinningGoal({ year } = {}, signal) {
  const params = new URLSearchParams()
  if (year != null && year !== "") params.set("year", String(year))
  const query = params.toString()
  return fetchJson(
    `${APP_API_ENDPOINTS.SOUL_WINNING_GOALS}${query ? `?${query}` : ""}`,
    { signal }
  )
}

function setSoulWinningGoal({ year, targetCount }, signal) {
  return fetchJson(APP_API_ENDPOINTS.SOUL_WINNING_GOALS, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({
      year: Number(year),
      targetCount: Number(targetCount),
    }),
    signal,
  })
}

async function listSoulWinningRecords(
  {
    period = "This Month",
    from = "",
    to = "",
    page = 1,
    limit = 20,
    search = "",
    status = "",
    winnerMemberId = "",
  } = {},
  signal
) {
  const params = toPeriodParams({ period, from, to })
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (search) params.set("search", search)
  if (status && status !== "all") params.set("status", status)
  if (winnerMemberId) params.set("winnerMemberId", winnerMemberId)

  const { data, meta } = await fetchWithMeta(
    `${APP_API_ENDPOINTS.SOUL_WINNING_RECORDS}?${params}`,
    { signal }
  )

  return {
    data: (data || []).map(normalizeRecord),
    meta: meta || { page, limit, total: 0, totalPages: 1 },
  }
}

function createSoulWinningRecord(payload, signal) {
  return fetchJson(APP_API_ENDPOINTS.SOUL_WINNING_RECORDS, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(payload),
    signal,
  })
}

function updateSoulWinningRecord(id, payload, signal) {
  return fetchJson(APP_API_ENDPOINTS.SOUL_WINNING_RECORD_BY_ID(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(payload),
    signal,
  })
}

function baptizeSoulWinningRecord(id, payload = {}, signal) {
  return fetchJson(APP_API_ENDPOINTS.SOUL_WINNING_BAPTIZE(id), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify(payload),
    signal,
  })
}

function bulkDeleteSoulWinningRecords(ids, signal) {
  return fetchJson(APP_API_ENDPOINTS.SOUL_WINNING_RECORDS_BULK_DELETE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeader() },
    body: JSON.stringify({ ids }),
    signal,
  })
}

function listSoulWinningWinners(
  { period = "This Month", from = "", to = "", page = 1, limit = 20, search = "" } = {},
  signal
) {
  const params = toPeriodParams({ period, from, to })
  params.set("page", String(page))
  params.set("limit", String(limit))
  if (search) params.set("search", search)

  return fetchWithMeta(
    `${APP_API_ENDPOINTS.SOUL_WINNING_WINNERS}?${params}`,
    { signal }
  ).then(({ data, meta }) => ({
    items: data?.items || [],
    totalSoulsShared: Number(data?.totalSoulsShared) || 0,
    period: data?.period || null,
    meta: meta || { page, limit, total: 0, totalPages: 1 },
  }))
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const MONTH_NAME_INDEX = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
}

function parseTrendMonthIndex(entry) {
  if (!entry || typeof entry !== "object") return null

  if (entry.month != null && entry.month !== "") {
    const month = Number(entry.month)
    if (Number.isFinite(month) && month >= 1 && month <= 12) return month - 1
    if (Number.isFinite(month) && month >= 0 && month <= 11) return month
  }

  if (entry.monthIndex != null) {
    const index = Number(entry.monthIndex)
    if (Number.isFinite(index) && index >= 0 && index <= 11) return index
  }

  const dateLike = entry.date || entry.key || entry.monthKey || ""
  const isoMatch = String(dateLike).match(/^(\d{4})-(\d{2})/)
  if (isoMatch) {
    const month = Number(isoMatch[2])
    if (month >= 1 && month <= 12) return month - 1
  }

  const label = String(entry.label || "").trim().toLowerCase()
  if (!label) return null
  const token = label.split(/[\s/-]+/)[0]
  if (token in MONTH_NAME_INDEX) return MONTH_NAME_INDEX[token]
  return null
}

function parseTrendYear(entry, fallbackYear) {
  if (entry?.year != null && entry.year !== "") {
    const year = Number(entry.year)
    if (Number.isFinite(year)) return year
  }
  const dateLike = entry?.date || entry?.key || entry?.monthKey || ""
  const isoMatch = String(dateLike).match(/^(\d{4})-/)
  if (isoMatch) return Number(isoMatch[1])
  const labelYear = String(entry?.label || "").match(/\b(20\d{2})\b/)
  if (labelYear) return Number(labelYear[1])
  return fallbackYear
}

/**
 * Pads/merges API monthly points into Jan–Dec for a calendar year.
 * Counts stay period-filtered by whatever the trends API returned.
 */
function normalizeYearMonthly(monthly = [], year) {
  const targetYear = Number(year) || new Date().getFullYear()
  const rows = MONTH_SHORT.map((label, index) => ({
    label,
    month: index + 1,
    year: targetYear,
    professionsOfFaith: 0,
    baptism: 0,
    activeRetention: 0,
    wentInactive: 0,
  }))

  for (const entry of monthly || []) {
    const index = parseTrendMonthIndex(entry)
    if (index == null) continue
    const entryYear = parseTrendYear(entry, targetYear)
    if (entryYear !== targetYear) continue

    rows[index].professionsOfFaith +=
      Number(entry.professionsOfFaith ?? entry.soulsWon) || 0
    rows[index].baptism += Number(entry.baptism ?? entry.becameActive) || 0
    rows[index].activeRetention += Number(entry.activeRetention) || 0
    rows[index].wentInactive += Number(entry.wentInactive) || 0
  }

  return rows
}

async function getSoulWinningTrends(options, signal) {
  const year =
    options?.year != null && options.year !== ""
      ? Number(options.year)
      : resolveGoalYear(options)
  const data = await fetchJson(
    `${APP_API_ENDPOINTS.SOUL_WINNING_TRENDS}?${toPeriodParams({
      ...options,
      year,
    })}`,
    { signal }
  )

  return {
    ...(data || {}),
    daily: data?.daily || [],
    monthly: normalizeYearMonthly(data?.monthly, year),
    leaderboard: data?.leaderboard || [],
    year,
  }
}

export {
  PERIOD_VALUES,
  toPeriodParams,
  resolveGoalYear,
  normalizeRecord,
  normalizeYearMonthly,
  getSoulWinningOverview,
  getSoulWinningGoal,
  setSoulWinningGoal,
  listSoulWinningRecords,
  createSoulWinningRecord,
  updateSoulWinningRecord,
  baptizeSoulWinningRecord,
  bulkDeleteSoulWinningRecords,
  listSoulWinningWinners,
  getSoulWinningTrends,
}
export default {
  getSoulWinningOverview,
  getSoulWinningGoal,
  setSoulWinningGoal,
  listSoulWinningRecords,
  createSoulWinningRecord,
  updateSoulWinningRecord,
  baptizeSoulWinningRecord,
  bulkDeleteSoulWinningRecords,
  listSoulWinningWinners,
  getSoulWinningTrends,
}
