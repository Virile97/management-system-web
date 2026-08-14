import { fetchJson } from "@/services/api"
import { APP_API_ENDPOINTS } from "@/utils/constants"

const DEFAULT_FINANCE_RANGE = "6m"
const DEFAULT_ATTENDANCE_RANGE = "5w"
const DEFAULT_ACTIVITY_LIMIT = 5
const DEFAULT_ACTIVITY_SEARCH_LIMIT = 20

/**
 * Weekly attendance rates for the Member Attendance chart.
 * Maps API `{ label, percentage }` points onto `{ date, rate }` for AttendanceChart.
 */
function normalizeAttendanceSummary(points = []) {
  return (Array.isArray(points) ? points : []).map((point) => ({
    date: point.label || "—",
    rate: Number(point.percentage ?? 0),
  }))
}

function normalizeDashboardOverview(data = {}) {
  return {
    stats: data.stats ?? null,
    memberBreakdown: data.memberBreakdown ?? null,
    financeSummary: Array.isArray(data.financeSummary)
      ? data.financeSummary
      : [],
    attendanceSummary: normalizeAttendanceSummary(data.attendanceSummary),
    recentActivity: Array.isArray(data.recentActivity)
      ? data.recentActivity
      : [],
  }
}

/**
 * Single dashboard overview: stats, breakdown, finance/attendance series, activity.
 */
function getDashboardOverview(
  {
    financeRange = DEFAULT_FINANCE_RANGE,
    attendanceRange = DEFAULT_ATTENDANCE_RANGE,
    activityLimit = DEFAULT_ACTIVITY_LIMIT,
  } = {},
  signal
) {
  const params = new URLSearchParams()
  if (financeRange) params.set("financeRange", financeRange)
  if (attendanceRange) params.set("attendanceRange", attendanceRange)
  if (activityLimit != null) params.set("activityLimit", String(activityLimit))

  const query = params.toString()

  return fetchJson(
    `${APP_API_ENDPOINTS.DASHBOARD}${query ? `?${query}` : ""}`,
    { signal }
  ).then(normalizeDashboardOverview)
}

/**
 * Search activity logs beyond the overview snapshot (message / detail / actor / type).
 */
function searchDashboardActivity(
  { search, limit = DEFAULT_ACTIVITY_SEARCH_LIMIT } = {},
  signal
) {
  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (limit != null) params.set("limit", String(limit))

  const query = params.toString()

  return fetchJson(
    `${APP_API_ENDPOINTS.DASHBOARD_ACTIVITY}${query ? `?${query}` : ""}`,
    { signal }
  ).then((data) => (Array.isArray(data) ? data : []))
}

export {
  getDashboardOverview,
  searchDashboardActivity,
  normalizeDashboardOverview,
}
