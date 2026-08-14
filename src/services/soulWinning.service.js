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
  if (year != null && year !== "") {
    params.set("year", String(year))
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

function normalizeRecord(record) {
  const convert = record.convert || {}
  const soulWinner = record.soulWinner || {}
  const status = normalizeStatus(record.status)

  return {
    ...record,
    status,
    convertName: formatPersonName(convert),
    location: convert.location || "",
    soulWinnerName: formatPersonName(soulWinner),
    soulWinnerId: soulWinner.id || null,
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

function listSoulWinningWinners(options, signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.SOUL_WINNING_WINNERS}?${toPeriodParams(options)}`,
    { signal }
  )
}

function getSoulWinningTrends(options, signal) {
  return fetchJson(
    `${APP_API_ENDPOINTS.SOUL_WINNING_TRENDS}?${toPeriodParams(options)}`,
    { signal }
  )
}

export {
  PERIOD_VALUES,
  toPeriodParams,
  normalizeRecord,
  getSoulWinningOverview,
  getSoulWinningGoal,
  setSoulWinningGoal,
  listSoulWinningRecords,
  createSoulWinningRecord,
  updateSoulWinningRecord,
  baptizeSoulWinningRecord,
  listSoulWinningWinners,
  getSoulWinningTrends,
}
export default {
  getSoulWinningOverview,
  getSoulWinningGoal,
  setSoulWinningGoal,
  listSoulWinningRecords,
  createSoulWinningRecord,
  baptizeSoulWinningRecord,
  listSoulWinningWinners,
  getSoulWinningTrends,
}
